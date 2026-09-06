/**
 * OmniFlow Base Job Class
 * All background jobs must extend this class.
 *
 * Usage:
 *   export class SendInvoiceEmailJob extends BaseJob {
 *     queue = "emails";
 *     tries = 3;
 *     delay = 0;
 *     constructor(public orderId: number) { super(); }
 *     async handle(): Promise<void> {
 *       // send email logic
 *     }
 *   }
 *
 *   await omniQueue.push(new SendInvoiceEmailJob(orderId));
 */
export abstract class BaseJob {
  /** Queue name to push into */
  queue = "default";

  /** Number of retry attempts on failure */
  tries = 3;

  /** Delay in seconds before the job becomes available */
  delay = 0;

  /** Job display name (auto-detected from class name) */
  get displayName(): string {
    return this.constructor.name;
  }

  /**
   * The main job logic — must be implemented by subclasses
   */
  abstract handle(): Promise<void>;
}
