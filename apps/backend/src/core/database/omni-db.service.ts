import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import * as mysql from "mysql2/promise";
import { Pool, PoolConnection } from "mysql2/promise";
import { QueryBuilder } from "./query-builder";
import { BaseModel } from "./base-model";
import * as dotenv from "dotenv";

dotenv.config();

export interface OmniDbTransaction {
  table(name: string): QueryBuilder;
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
}

@Injectable()
export class OmniDbService implements OnModuleInit {
  private readonly logger = new Logger(OmniDbService.name);
  private pool!: Pool;

  async onModuleInit() {
    let host = process.env.DB_HOST || "localhost";
    let port = parseInt(process.env.DB_PORT || "3306");
    let user = process.env.DB_USER || "root";
    let password = process.env.DB_PASS || "";
    let database = process.env.DB_NAME || "";

    if (process.env.DATABASE_URL) {
      try {
        const parsed = new URL(process.env.DATABASE_URL);
        host = process.env.DB_HOST || parsed.hostname || host;
        port = parseInt(process.env.DB_PORT || parsed.port || String(port));
        user = process.env.DB_USER || decodeURIComponent(parsed.username) || user;
        password = process.env.DB_PASS !== undefined ? process.env.DB_PASS : decodeURIComponent(parsed.password || "");
        if (!database && parsed.pathname) {
          database = parsed.pathname.replace(/^\//, "");
        }
      } catch {
        // keep fallback
      }
    }

    if (!database) {
      database = "omniflow_erp_db";
    }

    // Auto-create database if not existing
    try {
      const adminConn = await mysql.createConnection({ host, port, user, password });
      await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await adminConn.end();
    } catch (e: any) {
      this.logger.warn(`Could not auto-verify database existence: ${e.message}`);
    }

    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_SIZE || "10"),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: "+00:00",
    });

    BaseModel._db = this;

    try {
      await this.pool.query("SELECT 1 AS ok");
      this.logger.log(`OmniDB connected to MySQL database [${database}] successfully.`);
    } catch (err) {
      this.logger.error(`OmniDB failed to connect to MySQL database [${database}]!`, err);
      throw err;
    }
  }

  table(tableName: string, connection?: PoolConnection): QueryBuilder {
    return new QueryBuilder(tableName, this.pool, connection || null);
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const [rows] = await this.pool.query(sql, params);
    return rows as T[];
  }

  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
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
      const connection = await this.pool.getConnection();
      try {
        await connection.beginTransaction();

        const txDb: OmniDbTransaction = {
          table: (name: string) => new QueryBuilder(name, this.pool, connection),
          query: async (sql: string, params: unknown[] = []) => {
            const [rows] = await connection.query(sql, params);
            return rows as unknown[];
          },
        };

        const result = await callback(txDb);
        await connection.commit();
        return result;
      } catch (err: any) {
        await connection.rollback().catch(() => {});

        const isDeadlock =
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
      await this.pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  getPoolInfo(): Record<string, unknown> {
    return { status: "connected", config: { host: process.env.DB_HOST, database: process.env.DB_NAME } };
  }
}
