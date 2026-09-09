import { Injectable, Logger } from "@nestjs/common";
import { OmniDbService } from "./omni-db.service";
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";

export interface BackupMetadata {
  filename: string;
  filePath: string;
  sizeBytes: number;
  tablesCount: number;
  compressed: boolean;
  createdAt: Date;
}

export interface BackupListItem {
  filename: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: Date;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private readonly db: OmniDbService) {}

  static getBackupDir(): string {
    const dir = path.join(process.cwd(), "storage", "backups");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async create(options: { compress?: boolean; keepLast?: number } = {}): Promise<BackupMetadata> {
    const compress = options.compress !== false;
    const keepLast = options.keepLast || 7;
    const dir = BackupService.getBackupDir();
    const isPg = this.db.getDbType() === "postgresql";

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const dbName = process.env.DB_NAME || "omniflow_erp_db";
    const baseFilename = "backup_" + dbName + "_" + timestamp + ".sql";
    const finalFilename = compress ? baseFilename + ".gz" : baseFilename;
    const finalPath = path.join(dir, finalFilename);

    let tables: string[] = [];
    if (isPg) {
      const rows = await this.db.query<any[]>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
      );
      tables = rows.map((r: any) => r.table_name);
    } else {
      const tableRows = await this.db.query<any[]>("SHOW TABLES");
      tables = tableRows.map((r: any) => Object.values(r)[0] as string);
    }

    const fileStream = fs.createWriteStream(finalPath);
    const writeTarget = compress ? zlib.createGzip() : fileStream;
    if (compress) {
      writeTarget.pipe(fileStream);
    }

    const write = (str: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!writeTarget.write(str)) {
          writeTarget.once("drain", resolve);
        } else {
          resolve();
        }
      });
    };

    try {
      await write("-- ========================================================\n");
      await write("-- OmniFlow Database Backup (" + (isPg ? "PostgreSQL" : "MySQL") + ")\n");
      await write("-- Database: " + dbName + "\n");
      await write("-- Date: " + new Date().toISOString() + "\n");
      await write("-- ========================================================\n\n");

      if (!isPg) {
        await write("SET FOREIGN_KEY_CHECKS = 0;\n");
        await write("SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n\n");
      }

      for (const table of tables) {
        const escTable = isPg ? '"' + table + '"' : "`" + table + "`";
        await write("DROP TABLE IF EXISTS " + escTable + ";\n");

        if (!isPg) {
          const createRows = await this.db.query<any[]>("SHOW CREATE TABLE `" + table + "`");
          if (createRows[0] && createRows[0]["Create Table"]) {
            await write(createRows[0]["Create Table"] + ";\n\n");
          }
        }

        const countRow = await this.db.query<any[]>("SELECT COUNT(*) as total FROM " + escTable);
        const totalRows = Number((countRow[0] as any)?.total ?? 0);

        if (totalRows > 0) {
          let offset = 0;
          const chunkSize = 200;

          while (offset < totalRows) {
            const rows = await this.db.query<any[]>("SELECT * FROM " + escTable + " LIMIT " + chunkSize + " OFFSET " + offset);
            if (!rows || rows.length === 0) break;

            const cols = Object.keys(rows[0]);
            const escCols = cols.map((c) => isPg ? '"' + c + '"' : "`" + c + "`").join(", ");

            const valueStrings = rows.map((r: any) => {
              const vals = cols.map((c) => {
                const v = r[c];
                if (v === null || v === undefined) return "NULL";
                if (typeof v === "number") return String(v);
                if (typeof v === "boolean") return v ? "1" : "0";
                if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace("T", " ") + "'";
                if (typeof v === "object") return "'" + JSON.stringify(v).replace(/'/g, "\\'") + "'";
                return "'" + String(v).replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, (char) => "\\" + char) + "'";
              });
              return "(" + vals.join(", ") + ")";
            });

            await write("INSERT INTO " + escTable + " (" + escCols + ") VALUES\n  " + valueStrings.join(",\n  ") + ";\n\n");
            offset += chunkSize;
          }
        }
      }

      if (!isPg) {
        await write("SET FOREIGN_KEY_CHECKS = 1;\n");
      }
      await write("-- End of OmniFlow Backup\n");

      await new Promise<void>((resolve, reject) => {
        writeTarget.end(() => {
          if (compress) {
            fileStream.on("finish", () => resolve());
          } else {
            resolve();
          }
        });
        writeTarget.on("error", reject);
        fileStream.on("error", reject);
      });

      const stat = fs.statSync(finalPath);
      if (keepLast > 0) {
        this.cleanOldBackups(keepLast);
      }

      return {
        filename: finalFilename,
        filePath: finalPath,
        sizeBytes: stat.size,
        tablesCount: tables.length,
        compressed: compress,
        createdAt: new Date(),
      };
    } catch (err) {
      if (fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }
      throw err;
    }
  }

  list(): BackupListItem[] {
    const dir = BackupService.getBackupDir();
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
      .filter((f) => f.startsWith("backup_") && (f.endsWith(".sql") || f.endsWith(".sql.gz")))
      .map((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        return {
          filename: file,
          filePath,
          sizeBytes: stat.size,
          sizeFormatted: (stat.size / (1024 * 1024)).toFixed(2) + " MB",
          createdAt: stat.mtime,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  cleanOldBackups(keepLast = 7): number {
    const all = this.list();
    if (all.length <= keepLast) return 0;

    const toRemove = all.slice(keepLast);
    let removedCount = 0;
    for (const b of toRemove) {
      try {
        fs.unlinkSync(b.filePath);
        removedCount++;
      } catch {
        // ignore
      }
    }
    return removedCount;
  }

  async restore(filenameOrPath: string): Promise<{ filePath: string; statementsExecuted: number }> {
    let fullPath = filenameOrPath;
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(BackupService.getBackupDir(), filenameOrPath);
    }

    if (!fs.existsSync(fullPath)) {
      throw new Error("Backup file not found: " + filenameOrPath);
    }

    let sqlContent = "";
    if (fullPath.endsWith(".gz")) {
      const buffer = fs.readFileSync(fullPath);
      sqlContent = zlib.gunzipSync(buffer).toString("utf-8");
    } else {
      sqlContent = fs.readFileSync(fullPath, "utf-8");
    }

    const statements = sqlContent
      .split(/;\s*[\r\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    let executed = 0;
    for (const stmt of statements) {
      try {
        await this.db.query(stmt);
        executed++;
      } catch (err: any) {
        this.logger.warn("[Backup Restore Warning] " + err.message);
      }
    }

    return {
      filePath: fullPath,
      statementsExecuted: executed,
    };
  }
}
