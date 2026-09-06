import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { OmniQueueService } from "./omni-queue.service";

/**
 * OmniFlow Queue Worker Service
 * Polls MySQL job queue and processes jobs in background.
 * Supports multiple queues, retry, and failure handling.
 *
 * Enable by importing OmniQueueModule and calling worker.start()
 */
@Injectable()
export class QueueWorkerService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueWorkerService.name);
  private _running = false;
  private _interval: NodeJS.Timeout | null = null;

  // Registry: "JobClassName" ? handler function
  private _handlers = new Map<string, () => Promise<void>>();

  // Registry: "JobClassName" ? job class constructor
  private _jobClasses = new Map<string, new (...args: unknown[]) => { handle(): Promise<void> }>();

  constructor(private readonly queue: OmniQueueService) {}

  /**
   * Register a job class handler
   */
  register(JobClass: new (...args: unknown[]) => { handle(): Promise<void> }): void {
    this._jobClasses.set(JobClass.name, JobClass);
    this.logger.log("Registered job handler: " + JobClass.name);
  }

  /**
   * Start the worker polling loop
   * @param queues - array of queue names to process (default: ["default"])
   * @param intervalMs - polling interval in milliseconds (default: 5000)
   */
  start(queues: string[] = ["default"], intervalMs = 5000): void {
    if (this._running) return;
    this._running = true;
    this.logger.log("Queue worker started. Polling every " + intervalMs + "ms on: " + queues.join(", "));

    this._interval = setInterval(async () => {
      for (const queue of queues) {
        await this._processQueue(queue);
      }
    }, intervalMs);
  }

  /**
   * Stop the worker
   */
  stop(): void {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._running = false;
    this.logger.log("Queue worker stopped.");
  }

  onModuleDestroy(): void {
    this.stop();
  }

  private async _processQueue(queueName: string): Promise<void> {
    try {
      const job = await this.queue.pop(queueName);
      if (!job) return;

      const displayName = job.display_name as string;
      const payload = typeof job.payload === "string" ? JSON.parse(job.payload) : job.payload;
      const jobData = payload?.data || {};

      this.logger.debug("Processing job: " + displayName + " [id=" + job.id + "]");

      const JobClass = this._jobClasses.get(displayName);
      if (!JobClass) {
        this.logger.warn("No handler registered for job: " + displayName);
        await this.queue.delete(job.id as number);
        return;
      }

      // Instantiate job and merge data
      const jobInstance = Object.assign(new JobClass(), jobData);
      await jobInstance.handle();
      await this.queue.delete(job.id as number);
      this.logger.debug("Job completed: " + displayName + " [id=" + job.id + "]");
    } catch (err: unknown) {
      this.logger.error("Error processing queue: " + queueName, err);
    }
  }

  isRunning(): boolean {
    return this._running;
  }
}
