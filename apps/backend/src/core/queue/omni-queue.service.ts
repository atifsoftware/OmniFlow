import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { OmniDbService } from "../database/omni-db.service";
import { BaseJob } from "./base-job";

const JOB_TABLE = "omni_jobs";
const FAILED_TABLE = "omni_failed_jobs";

/**
 * OmniFlow Queue Service — MySQL-backed Job Queue
 * Inspired by NodeFlow-React Queue.js
 * No Redis required — uses MySQL for reliability.
 *
 * Usage:
 *   await omniQueue.push(new SendEmailJob(userId));
 *   await omniQueue.push(new GeneratePdfJob(orderId), "reports");
 */
@Injectable()
export class OmniQueueService implements OnModuleInit {
  private readonly logger = new Logger(OmniQueueService.name);

  constructor(private readonly db: OmniDbService) {}

  async onModuleInit() {
    await this._ensureTables();
  }

  private async _ensureTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS \`${JOB_TABLE}\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`queue\` VARCHAR(255) NOT NULL DEFAULT 'default',
        \`display_name\` VARCHAR(255) NOT NULL,
        \`payload\` LONGTEXT NOT NULL,
        \`attempts\` TINYINT UNSIGNED NOT NULL DEFAULT 0,
        \`max_attempts\` TINYINT UNSIGNED NOT NULL DEFAULT 3,
        \`reserved_at\` TIMESTAMP NULL DEFAULT NULL,
        \`available_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_queue_status (\`queue\`, \`reserved_at\`, \`available_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS \`${FAILED_TABLE}\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`queue\` VARCHAR(255) NOT NULL,
        \`display_name\` VARCHAR(255) NOT NULL,
        \`payload\` LONGTEXT NOT NULL,
        \`exception\` LONGTEXT NOT NULL,
        \`failed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  private _ts(date = new Date()): string {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  /**
   * Push a job onto the queue
   */
  async push(job: BaseJob, queue?: string): Promise<number> {
    const queueName = queue || job.queue || "default";
    const availableAt = new Date(Date.now() + (job.delay || 0) * 1000);
    const payload = JSON.stringify({ data: { ...job } });

    const id = await this.db.table(JOB_TABLE).insert({
      queue: queueName,
      display_name: job.displayName,
      payload,
      attempts: 0,
      max_attempts: job.tries || 3,
      available_at: this._ts(availableAt),
      created_at: this._ts(),
    });

    this.logger.debug(`Job queued: ${job.displayName} [id=${id}] ? queue:${queueName}`);
    return id;
  }

  /**
   * Pop the next available job from the queue
   */
  async pop(queue = "default"): Promise<Record<string, unknown> | null> {
    const now = this._ts();
    const job = await this.db.table(JOB_TABLE)
      .where("queue", queue)
      .whereNull("reserved_at")
      .whereRaw("available_at <= ?", [now])
      .orderBy("id", "ASC")
      .first<Record<string, unknown>>();

    if (job) {
      await this.db.table(JOB_TABLE).where("id", job.id).update({
        reserved_at: now,
        attempts: (Number(job.attempts) + 1),
      });
      return job;
    }
    return null;
  }

  /**
   * Delete a completed job
   */
  async delete(id: number): Promise<void> {
    await this.db.table(JOB_TABLE).where("id", id).delete();
  }

  /**
   * Release a failed job back to the queue with a delay
   */
  async release(id: number, delay = 60): Promise<void> {
    const availableAt = this._ts(new Date(Date.now() + delay * 1000));
    await this.db.table(JOB_TABLE).where("id", id).update({
      reserved_at: null,
      available_at: availableAt,
    });
  }

  /**
   * Move a job to the failed jobs table
   */
  async fail(job: Record<string, unknown>, error: Error): Promise<void> {
    await this.db.table(FAILED_TABLE).insert({
      queue: job.queue as string,
      display_name: job.display_name as string,
      payload: job.payload as string,
      exception: error.stack || error.message,
      failed_at: this._ts(),
    });
    await this.db.table(JOB_TABLE).where("id", job.id).delete();
    this.logger.error(`Job FAILED: ${job.display_name} [id=${job.id}]`, error.message);
  }

  /**
   * Get queue statistics
   */
  async stats(): Promise<Record<string, number>> {
    const pending = await this.db.table(JOB_TABLE).whereNull("reserved_at").count();
    const processing = await this.db.table(JOB_TABLE).whereNotNull("reserved_at").count();
    const failed = await this.db.table(FAILED_TABLE).count();
    return { pending, processing, failed };
  }

  /**
   * Get all queued jobs
   */
  async all(queue?: string): Promise<Record<string, unknown>[]> {
    const qb = this.db.table(JOB_TABLE).latest("id");
    if (queue) qb.where("queue", queue);
    return qb.get<Record<string, unknown>>();
  }

  /**
   * Get all failed jobs
   */
  async failedJobs(): Promise<Record<string, unknown>[]> {
    return this.db.table(FAILED_TABLE).latest("failed_at").get<Record<string, unknown>>();
  }

  /**
   * Retry all failed jobs
   */
  async retryFailed(): Promise<number> {
    const failed = await this.failedJobs();
    for (const job of failed) {
      await this.db.table(JOB_TABLE).insert({
        queue: job.queue as string,
        display_name: job.display_name as string,
        payload: job.payload as string,
        attempts: 0,
        max_attempts: 3,
        available_at: this._ts(),
        created_at: this._ts(),
      });
      await this.db.table(FAILED_TABLE).where("id", job.id).delete();
    }
    return failed.length;
  }
}
