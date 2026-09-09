import { Injectable, Logger } from "@nestjs/common";
import { OmniDbService } from "./omni-db.service";

export interface AuditLogEntry {
  userId?: number | string | null;
  user_id?: number | string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT" | "STATUS_CHANGE" | string;
  auditableType?: string;
  auditable_type?: string;
  auditableId?: number | string | null;
  auditable_id?: number | string | null;
  oldValues?: Record<string, unknown> | null;
  old_values?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip?: string | null;
  ip_address?: string | null;
  userAgent?: string | null;
  user_agent?: string | null;
  created_at?: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private static _memoryLogs: Record<string, unknown>[] = [];

  constructor(private readonly db: OmniDbService) {}

  static diff(oldData: Record<string, unknown> = {}, newData: Record<string, unknown> = {}): {
    oldValues: Record<string, unknown>;
    newValues: Record<string, unknown>;
  } {
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    const ignoreFields = ["created_at", "updated_at", "deleted_at", "createdAt", "updatedAt"];

    for (const key of allKeys) {
      if (ignoreFields.includes(key)) continue;

      const oldVal = oldData ? oldData[key] : undefined;
      const newVal = newData ? newData[key] : undefined;

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        if (oldVal !== undefined) oldValues[key] = oldVal;
        if (newVal !== undefined) newValues[key] = newVal;
      }
    }

    return { oldValues, newValues };
  }

  async log(entry: AuditLogEntry): Promise<Record<string, unknown>> {
    const auditData = {
      user_id: entry.userId || entry.user_id ? String(entry.userId || entry.user_id) : null,
      action: (entry.action || "UPDATE").toUpperCase(),
      auditable_type: entry.auditableType || entry.auditable_type || "System",
      auditable_id: entry.auditableId || entry.auditable_id ? String(entry.auditableId || entry.auditable_id) : null,
      old_values: entry.oldValues || entry.old_values ? JSON.stringify(entry.oldValues || entry.old_values) : null,
      new_values: entry.newValues || entry.new_values ? JSON.stringify(entry.newValues || entry.new_values) : null,
      ip_address: entry.ip || entry.ip_address || null,
      user_agent: entry.userAgent || entry.user_agent || null,
      created_at: new Date(),
    };

    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS omni_audit_logs (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(50),
          action VARCHAR(50) NOT NULL,
          auditable_type VARCHAR(100) NOT NULL,
          auditable_id VARCHAR(100),
          old_values JSON,
          new_values JSON,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await this.db.query(`
        INSERT INTO omni_audit_logs (user_id, action, auditable_type, auditable_id, old_values, new_values, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        auditData.user_id,
        auditData.action,
        auditData.auditable_type,
        auditData.auditable_id,
        auditData.old_values,
        auditData.new_values,
        auditData.ip_address,
        auditData.user_agent,
        auditData.created_at,
      ]);
    } catch {
      AuditService._memoryLogs.push(auditData);
      this.logger.log(`[Audit fallback] ${auditData.action} on ${auditData.auditable_type}:${auditData.auditable_id}`);
    }

    return auditData;
  }

  async getTrail(auditableType: string, auditableId: string | number): Promise<Record<string, unknown>[]> {
    try {
      const rows = await this.db.query<Record<string, unknown>[]>(
        "SELECT * FROM omni_audit_logs WHERE auditable_type = ? AND auditable_id = ? ORDER BY id DESC",
        [auditableType, String(auditableId)]
      );
      return rows.map((r: any) => ({
        ...r,
        old_values: typeof r.old_values === "string" ? JSON.parse(r.old_values) : r.old_values,
        new_values: typeof r.new_values === "string" ? JSON.parse(r.new_values) : r.new_values,
      }));
    } catch {
      return AuditService._memoryLogs.filter(
        (l) => l.auditable_type === auditableType && String(l.auditable_id) === String(auditableId)
      );
    }
  }

  static resetMemory(): void {
    this._memoryLogs = [];
  }
}
