import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

export type LogLevel = "emergency" | "alert" | "critical" | "error" | "warning" | "notice" | "info" | "debug";

/**
 * OmniFlow Logger Service
 * Inspired by NodeFlow-React Logger.js
 * Provides structured, leveled logging to files and console.
 * Supports: slow query detection, security event logging, activity logging.
 */
@Injectable()
export class OmniLoggerService {
  static readonly EMERGENCY = "emergency";
  static readonly ALERT = "alert";
  static readonly CRITICAL = "critical";
  static readonly ERROR = "error";
  static readonly WARNING = "warning";
  static readonly NOTICE = "notice";
  static readonly INFO = "info";
  static readonly DEBUG = "debug";

  private static logFile = "storage/logs/app.log";
  private static errorLogFile = "storage/logs/error.log";

  private static levels: Record<string, number> = {
    emergency: 0, alert: 1, critical: 2, error: 3,
    warning: 4, notice: 5, info: 6, debug: 7,
  };

  private _init(): void {
    const dirs = [
      path.dirname(path.resolve(OmniLoggerService.logFile)),
      path.dirname(path.resolve(OmniLoggerService.errorLogFile)),
    ];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  }

  // ----------------------------------------------
  //  LEVEL SHORTCUTS
  // ----------------------------------------------
  emergency(message: string, context: Record<string, unknown> = {}): void { this.log("emergency", message, context); }
  alert(message: string, context: Record<string, unknown> = {}): void { this.log("alert", message, context); }
  critical(message: string, context: Record<string, unknown> = {}): void { this.log("critical", message, context); }
  error(message: string, context: Record<string, unknown> = {}): void { this.log("error", message, context); }
  warning(message: string, context: Record<string, unknown> = {}): void { this.log("warning", message, context); }
  notice(message: string, context: Record<string, unknown> = {}): void { this.log("notice", message, context); }
  info(message: string, context: Record<string, unknown> = {}): void { this.log("info", message, context); }
  debug(message: string, context: Record<string, unknown> = {}): void { this.log("debug", message, context); }

  /**
   * Core logging method
   */
  log(level: LogLevel, message: string, context: Record<string, unknown> = {}): void {
    this._init();
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const contextStr = Object.keys(context).length > 0 ? " | " + JSON.stringify(context) : "";
    const logEntry = "[" + timestamp + "] " + level.toUpperCase() + ": " + message + contextStr + "\n";

    const isErrorLevel = ["emergency", "alert", "critical", "error"].includes(level);
    const targetFile = isErrorLevel ? OmniLoggerService.errorLogFile : OmniLoggerService.logFile;

    try {
      fs.appendFileSync(targetFile, logEntry, "utf8");
    } catch (err) {
      console.error("OmniLogger: Failed to write log file:", err);
    }

    // Console output with colors
    if (isErrorLevel) {
      console.error("\x1b[31m[OmniLogger] " + level.toUpperCase() + "\x1b[0m " + message, context);
    } else if (level === "warning") {
      console.warn("\x1b[33m[OmniLogger] WARNING\x1b[0m " + message);
    } else if (level === "debug") {
      if (process.env.LOG_LEVEL === "debug") {
        console.log("\x1b[90m[OmniLogger] DEBUG\x1b[0m " + message);
      }
    } else {
      console.log("\x1b[36m[OmniLogger] " + level.toUpperCase() + "\x1b[0m " + message);
    }
  }

  /**
   * Log a database query — detects slow queries (>100ms)
   */
  logQuery(sql: string, bindings: unknown[] = [], executionTimeMs?: number): void {
    const context = { sql, bindings, execution_time_ms: executionTimeMs };
    if (executionTimeMs !== undefined && executionTimeMs > 100) {
      this.warning("Slow Query Detected (>" + executionTimeMs + "ms)", context);
    } else {
      this.debug("DB Query Executed", context);
    }
  }

  /**
   * Log a user activity event
   */
  logActivity(action: string, details: Record<string, unknown> = {}): void {
    this.info("User Activity: " + action, details);
  }

  /**
   * Log a security event
   */
  logSecurity(event: string, details: Record<string, unknown> = {}): void {
    this.warning("Security Event: " + event, { ...details, severity: "high" });
  }

  /**
   * Log an HTTP request
   */
  logRequest(method: string, url: string, statusCode: number, durationMs: number, userId?: unknown): void {
    const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info";
    this.log(level, method + " " + url + " " + statusCode + " (" + durationMs + "ms)", {
      user_id: userId ?? "guest",
    });
  }

  /**
   * Read recent log entries
   */
  getRecentLogs(lines = 50, errorOnly = false): string[] {
    const filePath = errorOnly ? OmniLoggerService.errorLogFile : OmniLoggerService.logFile;
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf8");
    return content.split("\n").filter((l) => l.trim().length > 0).reverse().slice(0, lines);
  }

  /**
   * Clear log files
   */
  clearLogs(type: "all" | "app" | "error" = "all"): void {
    if (type === "all" || type === "app") {
      if (fs.existsSync(OmniLoggerService.logFile)) fs.writeFileSync(OmniLoggerService.logFile, "");
    }
    if (type === "all" || type === "error") {
      if (fs.existsSync(OmniLoggerService.errorLogFile)) fs.writeFileSync(OmniLoggerService.errorLogFile, "");
    }
  }

  /**
   * Get log file stats
   */
  stats(): Record<string, unknown> {
    const getSize = (file: string) => {
      try { return fs.statSync(file).size; } catch { return 0; }
    };
    return {
      app_log_size: getSize(OmniLoggerService.logFile),
      error_log_size: getSize(OmniLoggerService.errorLogFile),
      app_log_path: path.resolve(OmniLoggerService.logFile),
      error_log_path: path.resolve(OmniLoggerService.errorLogFile),
    };
  }
}
