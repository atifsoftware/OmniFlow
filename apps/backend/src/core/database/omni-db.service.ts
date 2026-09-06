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
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "omniflow_db",
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
      this.logger.log("OmniDB connected to MySQL successfully.");
    } catch (err) {
      this.logger.error("OmniDB failed to connect to MySQL!", err);
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

  async transaction<T>(callback: (db: OmniDbTransaction) => Promise<T>): Promise<T> {
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
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
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
