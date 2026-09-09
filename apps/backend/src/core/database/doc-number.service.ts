import { Injectable, Logger } from "@nestjs/common";
import { OmniDbService } from "./omni-db.service";

export interface DocNumberOptions {
  prefix?: string;
  format?: string;
  reset?: "never" | "yearly" | "monthly" | "daily";
  branch?: string;
  date?: Date;
  tokens?: Record<string, string | number>;
}

@Injectable()
export class DocNumberService {
  private readonly logger = new Logger(DocNumberService.name);
  private static _memorySequences = new Map<string, number>();

  constructor(private readonly db: OmniDbService) {}

  static formatPattern(pattern: string, seq: number, vars: Record<string, unknown> = {}): string {
    const now = vars.date ? new Date(vars.date as string | Date) : new Date();
    const yyyy = String(now.getFullYear());
    const yy = yyyy.slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    let result = pattern;

    // Date tokens
    result = result.replace(/{YYYY}/g, yyyy);
    result = result.replace(/{YY}/g, yy);
    result = result.replace(/{MM}/g, mm);
    result = result.replace(/{DD}/g, dd);

    // Custom tokens
    for (const [key, val] of Object.entries(vars)) {
      if (key !== "date") {
        const regex = new RegExp(`{${key.toUpperCase()}}`, "g");
        result = result.replace(regex, String(val));
      }
    }

    // Zero-padding pattern e.g. {00001}
    const padMatch = result.match(/{0+1}/);
    if (padMatch) {
      const padLength = padMatch[0].length - 2;
      const paddedNumber = String(seq).padStart(padLength, "0");
      result = result.replace(padMatch[0], paddedNumber);
    } else {
      result = result.replace(/{SEQ}/g, String(seq));
    }

    return result;
  }

  static getPeriodKey(resetPolicy: string, date: Date = new Date()): string {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    switch (resetPolicy) {
      case "daily":
        return `${yyyy}${mm}${dd}`;
      case "monthly":
        return `${yyyy}${mm}`;
      case "yearly":
        return yyyy;
      case "never":
      default:
        return "ALL";
    }
  }

  async next(type: string, options: DocNumberOptions = {}): Promise<string> {
    const prefix = options.prefix || type.toUpperCase().slice(0, 3);
    const format = options.format || "{PREFIX}-{YYYY}{MM}-{00001}";
    const reset = options.reset || "monthly";
    const date = options.date || new Date();
    const period = DocNumberService.getPeriodKey(reset, date);
    const branch = options.branch || "";

    const seqKey = `${type}:${branch}:${period}`;
    let nextSeq = 1;

    try {
      // Ensure sequence table exists
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS omni_doc_sequences (
          seq_key VARCHAR(100) PRIMARY KEY,
          current_val BIGINT NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await this.db.query(`
        INSERT INTO omni_doc_sequences (seq_key, current_val)
        VALUES (?, 1)
        ON DUPLICATE KEY UPDATE current_val = current_val + 1;
      `, [seqKey]);

      const res = await this.db.query<any[]>(
        "SELECT current_val FROM omni_doc_sequences WHERE seq_key = ?",
        [seqKey]
      );
      nextSeq = Number((res[0] as any)?.current_val ?? 1);
    } catch {
      // Safe in-memory fallback
      const current = DocNumberService._memorySequences.get(seqKey) || 0;
      nextSeq = current + 1;
      DocNumberService._memorySequences.set(seqKey, nextSeq);
    }

    return DocNumberService.formatPattern(format, nextSeq, {
      PREFIX: prefix,
      BRANCH: branch,
      date,
      ...options.tokens,
    });
  }

  async setSequence(type: string, val: number, options: DocNumberOptions = {}): Promise<void> {
    const reset = options.reset || "monthly";
    const date = options.date || new Date();
    const period = DocNumberService.getPeriodKey(reset, date);
    const branch = options.branch || "";
    const seqKey = `${type}:${branch}:${period}`;

    DocNumberService._memorySequences.set(seqKey, val);

    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS omni_doc_sequences (
          seq_key VARCHAR(100) PRIMARY KEY,
          current_val BIGINT NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);

      await this.db.query(`
        INSERT INTO omni_doc_sequences (seq_key, current_val)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE current_val = ?;
      `, [seqKey, val, val]);
    } catch {
      // ignore
    }
  }

  static resetMemory(): void {
    this._memorySequences.clear();
  }
}
