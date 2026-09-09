import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import * as mysql from "mysql2/promise";
import { Pool as MySqlPool, PoolConnection as MySqlPoolConnection } from "mysql2/promise";
import { QueryBuilder, DbDialect } from "./query-builder";
import { BaseModel } from "./base-model";
import * as dotenv from "dotenv";

dotenv.config();

export interface OmniDbTransaction {
  table(name: string): QueryBuilder;
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
}

@Injectable()
export class OmniDbService implements OnModuleInit {
  static isDeadlockError(err: any): boolean {
    if (!err) return false;
    return (
      err.code === "40P01" ||
      err.code === "55P03" ||
      err.errno === 1213 ||
      err.code === "ER_LOCK_DEADLOCK" ||
      err.errno === 1205 ||
      Boolean(err.message && err.message.toLowerCase().includes("deadlock"))
    );
  }

  private readonly logger = new Logger(OmniDbService.name);
  private pool!: any;
  private dbType: DbDialect = "mysql";

  async onModuleInit() {
    let host = process.env.DB_HOST || "localhost";
    let port = parseInt(process.env.DB_PORT || "3306");
    let user = process.env.DB_USER || "root";
    let password = process.env.DB_PASS || "";
    let database = process.env.DB_NAME || "";

    const rawType = (process.env.DB_TYPE || "").toLowerCase();
    const url = process.env.DATABASE_URL || "";

    if (
      rawType === "postgresql" ||
      rawType === "postgres" ||
      rawType === "pg" ||
      url.startsWith("postgres://") ||
      url.startsWith("postgresql://") ||
      port === 5432
    ) {
      this.dbType = "postgresql";
    } else {
      this.dbType = "mysql";
    }

    if (url) {
      try {
        const parsed = new URL(url);
        host = process.env.DB_HOST || parsed.hostname || host;
        port = parseInt(process.env.DB_PORT || parsed.port || String(port));
        user = process.env.DB_USER || decodeURIComponent(parsed.username) || user;
        password = process.env.DB_PASS !== undefined ? process.env.DB_PASS : decodeURIComponent(parsed.password || "");
        if (!database && parsed.pathname) {
          database = parsed.pathname.replace(/^\//, "");
        }
      } catch {
        // fallback
      }
    }

    if (!database) {
      database = "omniflow_erp_db";
    }

    if (this.dbType === "postgresql") {
      const { Pool: PgPool } = require("pg");
      this.pool = new PgPool({
        host,
        port: isNaN(port) ? 5432 : port,
        user,
        password,
        database,
        max: 15,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
      });

      this.pool.on("error", (err: Error) => {
        this.logger.error(`[PostgreSQL Pool Error] ${err.message}`);
      });

      this.logger.log(`🔌 OmniDb initialized with PostgreSQL on ${host}:${port}/${database}`);
    } else {
      // Auto-create MySQL database if not existing
      try {
        const adminConn = await mysql.createConnection({ host, port, user, password });
        await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await adminConn.end();
      } catch (e: any) {
        this.logger.warn(`Could not auto-verify database existence: ${e.message}`);
      }

      this.pool = mysql.createPool({
        host,
        port: isNaN(port) ? 3306 : port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      this.logger.log(`🔌 OmniDb initialized with MySQL on ${host}:${port}/${database}`);
    }

    BaseModel.setDb(this);
  }

  getDbType(): DbDialect {
    return this.dbType;
  }

  getPool(): any {
    return this.pool;
  }

  table(name: string): QueryBuilder {
    return new QueryBuilder(name, this.pool, null, this.dbType);
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (this.dbType === "postgresql") {
      let idx = 0;
      const formattedSql = sql.replace(/\?/g, () => `$${++idx}`);
      const res = await this.pool.query(formattedSql, params);
      return res.rows as T[];
    } else {
      const [rows] = await (this.pool as MySqlPool).query(sql, params);
      return rows as T[];
    }
  }

  async getConnection(): Promise<any> {
    if (this.dbType === "postgresql") {
      return this.pool.connect();
    }
    return (this.pool as MySqlPool).getConnection();
  }

  async transaction<T>(
    callback: (db: OmniDbTransaction) => Promise<T>,
    options: { maxRetries?: number; backoffMs?: number } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const backoffMs = options.backoffMs ?? 50;

    let attempt = 0;
    while (true) {
      attempt++;
      const isPg = this.dbType === "postgresql";
      const connection = await this.getConnection();

      try {
        if (isPg) {
          await connection.query("BEGIN");
        } else {
          await connection.beginTransaction();
        }

        const txDb: OmniDbTransaction = {
          table: (name: string) => new QueryBuilder(name, this.pool, connection, this.dbType),
          query: async (sql: string, params: unknown[] = []) => {
            if (isPg) {
              let idx = 0;
              const formattedSql = sql.replace(/\?/g, () => `$${++idx}`);
              const res = await connection.query(formattedSql, params);
              return res.rows as unknown[];
            } else {
              const [rows] = await connection.query(sql, params);
              return rows as unknown[];
            }
          },
        };

        const result = await callback(txDb);

        if (isPg) {
          await connection.query("COMMIT");
        } else {
          await connection.commit();
        }

        return result;
      } catch (err: any) {
        if (isPg) {
          await connection.query("ROLLBACK").catch(() => {});
        } else {
          await connection.rollback().catch(() => {});
        }

        const isDeadlock =
          err.code === "40P01" || // Postgres deadlock_detected
          err.code === "55P03" || // Postgres lock_not_available
          err.code === "ER_LOCK_DEADLOCK" ||
          err.errno === 1213 ||
          err.code === "ER_LOCK_WAIT_TIMEOUT" ||
          err.errno === 1205;

        if (isDeadlock && attempt <= maxRetries) {
          const delay = backoffMs * Math.pow(2, attempt - 1);
          this.logger.warn(
            `[OmniDb Deadlock] Auto-retrying transaction attempt ${attempt}/${maxRetries} after ${delay}ms: ${err.message}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw err;
      } finally {
        connection.release();
      }
    }
  }

  async raw<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.query<T>(sql, params);
  }

  async ping(): Promise<boolean> {
    try {
      await this.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }
}
