import { Pool, PoolConnection } from "mysql2/promise";

/**
 * OmniFlow Fluent Query Builder
 * Inspired by NodeFlow-React QueryBuilder pattern.
 * Supports all standard SQL operations with a clean chainable API.
 */

interface WhereClause {
  boolean: "AND" | "OR";
  sql: string;
  bindings: unknown[];
}

export class QueryBuilder {
  private _table: string;
  private _connection: PoolConnection | Pool | null;
  private _select = "*";
  private _wheres: WhereClause[] = [];
  private _joins: string[] = [];
  private _orders: string[] = [];
  private _limit: number | null = null;
  private _offset: number | null = null;
  private _groupBy: string | null = null;
  private _having: string | null = null;
  private _havingBindings: unknown[] = [];
  private _lock: string | null = null;
  private _pool: Pool;

  constructor(table: string, pool: Pool, connection: PoolConnection | Pool | null = null) {
    this._table = table;
    this._pool = pool;
    this._connection = connection;
  }

  select(...fields: string[]): this {
    this._select = fields.join(", ");
    return this;
  }

  addSelect(...fields: string[]): this {
    if (this._select === "*") {
      this._select = fields.join(", ");
    } else {
      this._select += ", " + fields.join(", ");
    }
    return this;
  }

  private _escapeCol(column: string): string {
    if (column.includes("(") || column.includes(" ") || column === "*") return column;
    return column.split(".").map((c) => "`" + c + "`").join(".");
  }

  private _addWhere(boolean: "AND" | "OR", sql: string, bindings: unknown[] = []): this {
    this._wheres.push({ boolean, sql, bindings });
    return this;
  }

  where(column: string | ((qb: QueryBuilder) => void), operator?: unknown, value?: unknown): this {
    if (typeof column === "function") {
      const nested = new QueryBuilder(this._table, this._pool, this._connection);
      column(nested);
      if (nested._wheres.length > 0) {
        const { sql, bindings } = nested._compileWheres();
        this._addWhere("AND", "(" + sql + ")", bindings);
      }
      return this;
    }
    if (value === undefined) { value = operator; operator = "="; }
    this._addWhere("AND", this._escapeCol(column) + " " + operator + " ?", [value]);
    return this;
  }

  orWhere(column: string | ((qb: QueryBuilder) => void), operator?: unknown, value?: unknown): this {
    if (typeof column === "function") {
      const nested = new QueryBuilder(this._table, this._pool, this._connection);
      column(nested);
      if (nested._wheres.length > 0) {
        const { sql, bindings } = nested._compileWheres();
        this._addWhere("OR", "(" + sql + ")", bindings);
      }
      return this;
    }
    if (value === undefined) { value = operator; operator = "="; }
    this._addWhere("OR", this._escapeCol(column) + " " + operator + " ?", [value]);
    return this;
  }

  whereIn(column: string, values: unknown[]): this {
    if (!Array.isArray(values) || values.length === 0) return this;
    const placeholders = values.map(() => "?").join(", ");
    this._addWhere("AND", this._escapeCol(column) + " IN (" + placeholders + ")", values);
    return this;
  }

  whereNotIn(column: string, values: unknown[]): this {
    if (!Array.isArray(values) || values.length === 0) return this;
    const placeholders = values.map(() => "?").join(", ");
    this._addWhere("AND", this._escapeCol(column) + " NOT IN (" + placeholders + ")", values);
    return this;
  }

  whereNull(column: string): this {
    this._addWhere("AND", this._escapeCol(column) + " IS NULL");
    return this;
  }

  whereNotNull(column: string): this {
    this._addWhere("AND", this._escapeCol(column) + " IS NOT NULL");
    return this;
  }

  whereBetween(column: string, range: [unknown, unknown]): this {
    this._addWhere("AND", this._escapeCol(column) + " BETWEEN ? AND ?", range);
    return this;
  }

  whereNotBetween(column: string, range: [unknown, unknown]): this {
    this._addWhere("AND", this._escapeCol(column) + " NOT BETWEEN ? AND ?", range);
    return this;
  }

  whereLike(column: string, value: string): this {
    return this.where(column, "LIKE", value);
  }

  orWhereLike(column: string, value: string): this {
    return this.orWhere(column, "LIKE", value);
  }

  whereRaw(sql: string, bindings: unknown[] = []): this {
    this._addWhere("AND", sql, bindings);
    return this;
  }

  orWhereRaw(sql: string, bindings: unknown[] = []): this {
    this._addWhere("OR", sql, bindings);
    return this;
  }

  when(condition: unknown, callback: (qb: this) => void, defaultCallback?: (qb: this) => void): this {
    if (condition) { callback(this); } else if (defaultCallback) { defaultCallback(this); }
    return this;
  }

  join(table: string, first: string, operator?: string, second?: string, type = "INNER"): this {
    const escTable = this._parseTableName(table);
    if (operator === undefined && second === undefined) {
      this._joins.push(type + " JOIN " + escTable + " ON " + first);
    } else {
      this._joins.push(type + " JOIN " + escTable + " ON " + this._escapeCol(first) + " " + operator + " " + this._escapeCol(second!));
    }
    return this;
  }

  leftJoin(table: string, first: string, operator?: string, second?: string): this {
    return this.join(table, first, operator, second, "LEFT");
  }

  rightJoin(table: string, first: string, operator?: string, second?: string): this {
    return this.join(table, first, operator, second, "RIGHT");
  }

  groupBy(column: string): this {
    this._groupBy = "GROUP BY " + this._escapeCol(column);
    return this;
  }

  having(column: string, operator: string, value: unknown): this {
    this._having = "HAVING " + this._escapeCol(column) + " " + operator + " ?";
    this._havingBindings = [value];
    return this;
  }

  havingRaw(sql: string, bindings: unknown[] = []): this {
    this._having = "HAVING " + sql;
    this._havingBindings = bindings;
    return this;
  }

  orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
    this._orders.push(this._escapeCol(column) + " " + direction.toUpperCase());
    return this;
  }

  orderByDesc(column: string): this { return this.orderBy(column, "DESC"); }

  orderByRaw(sql: string): this { this._orders.push(sql); return this; }

  latest(column = "created_at"): this { return this.orderBy(column, "DESC"); }

  oldest(column = "created_at"): this { return this.orderBy(column, "ASC"); }

  limit(count: number): this { this._limit = parseInt(String(count)); return this; }

  offset(count: number): this { this._offset = parseInt(String(count)); return this; }

  take(count: number): this { return this.limit(count); }

  skip(count: number): this { return this.offset(count); }

  forPage(page: number, perPage = 20): this {
    return this.offset((page - 1) * perPage).limit(perPage);
  }

  private _parseTableName(table: string): string {
    let tableName = table;
    let alias = "";
    if (tableName.toLowerCase().includes(" as ")) {
      const parts = tableName.split(/ as /i);
      tableName = parts[0].trim();
      alias = " AS `" + parts[1].trim() + "`";
    }
    const escTable = tableName.includes(".")
      ? tableName.split(".").map((t) => "`" + t + "`").join(".")
      : "`" + tableName + "`";
    return escTable + alias;
  }

  private _compileWheres(): { sql: string; bindings: unknown[] } {
    if (this._wheres.length === 0) return { sql: "", bindings: [] };
    let sql = "";
    const bindings: unknown[] = [];
    this._wheres.forEach((w, idx) => {
      sql += idx === 0 ? w.sql : " " + w.boolean + " " + w.sql;
      bindings.push(...w.bindings);
    });
    return { sql, bindings };
  }


  forUpdate(): this {
    this._lock = "FOR UPDATE";
    return this;
  }

  sharedLock(): this {
    this._lock = "LOCK IN SHARE MODE";
    return this;
  }

  toSql(): string {
    const escTable = this._parseTableName(this._table);
    let sql = "SELECT " + this._select + " FROM " + escTable;
    if (this._joins.length > 0) sql += " " + this._joins.join(" ");
    const { sql: whereSql } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    if (this._groupBy) sql += " " + this._groupBy;
    if (this._having) sql += " " + this._having;
    if (this._orders.length > 0) sql += " ORDER BY " + this._orders.join(", ");
    if (this._limit !== null) {
      sql += " LIMIT " + this._limit;
      if (this._offset !== null) sql += " OFFSET " + this._offset;
    }
    if (this._lock) {
      sql += " " + this._lock;
    }
    return sql;
  }

  getBindings(): unknown[] {
    const { bindings } = this._compileWheres();
    return [...bindings, ...this._havingBindings];
  }

  private async _execute(sql: string, bindings: unknown[] = []): Promise<unknown[]> {
    const executor = this._connection || this._pool;
    const [rows] = await (executor as Pool).query(sql, bindings);
    return rows as unknown[];
  }

  async get<T = Record<string, unknown>>(): Promise<T[]> {
    return (await this._execute(this.toSql(), this.getBindings())) as T[];
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    this.limit(1);
    const rows = await this.get<T>();
    return rows.length > 0 ? rows[0] : null;
  }

  async firstOrFail<T = Record<string, unknown>>(): Promise<T> {
    const result = await this.first<T>();
    if (!result) throw new Error("No record found in table: " + this._table);
    return result;
  }

  async pluck<T = unknown>(column: string): Promise<T[]> {
    this.select(column);
    const rows = await this.get<Record<string, unknown>>();
    return rows.map((r) => r[column] as T);
  }

  async insert(data: Record<string, unknown>): Promise<number> {
    const keys = Object.keys(data);
    const escapedKeys = keys.map((k) => "`" + k + "`").join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const sql = "INSERT INTO `" + this._table + "` (" + escapedKeys + ") VALUES (" + placeholders + ")";
    const executor = this._connection || this._pool;
    const [result] = await (executor as Pool).query(sql, Object.values(data));
    return (result as { insertId: number }).insertId;
  }

  async insertMany(rows: Record<string, unknown>[]): Promise<number> {
    if (rows.length === 0) return 0;
    const keys = Object.keys(rows[0]);
    const escapedKeys = keys.map((k) => "`" + k + "`").join(", ");
    const rowPlaceholder = "(" + keys.map(() => "?").join(", ") + ")";
    const allPlaceholders = rows.map(() => rowPlaceholder).join(", ");
    const values = rows.flatMap((r) => Object.values(r));
    const sql = "INSERT INTO `" + this._table + "` (" + escapedKeys + ") VALUES " + allPlaceholders;
    const executor = this._connection || this._pool;
    const [result] = await (executor as Pool).query(sql, values);
    return (result as { affectedRows: number }).affectedRows;
  }

  async update(data: Record<string, unknown>): Promise<number> {
    const keys = Object.keys(data);
    const setClause = keys.map((k) => "`" + k + "` = ?").join(", ");
    let sql = "UPDATE `" + this._table + "` SET " + setClause;
    const { sql: whereSql, bindings: whereBindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const executor = this._connection || this._pool;
    const [result] = await (executor as Pool).query(sql, [...Object.values(data), ...whereBindings]);
    return (result as { affectedRows: number }).affectedRows;
  }

  async updateOrInsert(conditions: Record<string, unknown>, data: Record<string, unknown>): Promise<void> {
    Object.entries(conditions).forEach(([k, v]) => this.where(k, v));
    const exists = (await this.count()) > 0;
    if (exists) { await this.update(data); } else { await this.insert({ ...conditions, ...data }); }
  }

  async delete(): Promise<number> {
    let sql = "DELETE FROM `" + this._table + "`";
    const { sql: whereSql, bindings: whereBindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const executor = this._connection || this._pool;
    const [result] = await (executor as Pool).query(sql, whereBindings);
    return (result as { affectedRows: number }).affectedRows;
  }

  async truncate(): Promise<void> {
    const executor = this._connection || this._pool;
    await (executor as Pool).query("TRUNCATE TABLE `" + this._table + "`");
  }

  async count(column = "*"): Promise<number> {
    const escTable = this._parseTableName(this._table);
    const col = column === "*" ? "*" : this._escapeCol(column);
    let sql = "SELECT COUNT(" + col + ") AS aggregate FROM " + escTable;
    if (this._joins.length > 0) sql += " " + this._joins.join(" ");
    const { sql: whereSql, bindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const rows = await this._execute(sql, bindings) as Array<{ aggregate: number }>;
    return Number(rows[0]?.aggregate ?? 0);
  }

  async sum(column: string): Promise<number> { return this._aggregate("SUM", column); }
  async avg(column: string): Promise<number> { return this._aggregate("AVG", column); }
  async min(column: string): Promise<number> { return this._aggregate("MIN", column); }
  async max(column: string): Promise<number> { return this._aggregate("MAX", column); }

  private async _aggregate(fn: string, column: string): Promise<number> {
    const escTable = this._parseTableName(this._table);
    let sql = "SELECT " + fn + "(" + this._escapeCol(column) + ") AS aggregate FROM " + escTable;
    if (this._joins.length > 0) sql += " " + this._joins.join(" ");
    const { sql: whereSql, bindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const rows = await this._execute(sql, bindings) as Array<{ aggregate: number }>;
    return Number(rows[0]?.aggregate ?? 0);
  }

  async increment(column: string, amount = 1, extra: Record<string, unknown> = {}): Promise<number> {
    const col = this._escapeCol(column);
    const extraKeys = Object.keys(extra);
    const extraSql = extraKeys.map((k) => ", `" + k + "` = ?").join("");
    const extraVals = Object.values(extra);
    let sql = "UPDATE `" + this._table + "` SET " + col + " = " + col + " + ?" + extraSql;
    const { sql: whereSql, bindings: whereBindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const executor = this._connection || this._pool;
    const [result] = await (executor as Pool).query(sql, [amount, ...extraVals, ...whereBindings]);
    return (result as { affectedRows: number }).affectedRows;
  }

  async decrement(column: string, amount = 1, extra: Record<string, unknown> = {}): Promise<number> {
    return this.increment(column, -amount, extra);
  }

  async exists(): Promise<boolean> { return (await this.count()) > 0; }
  async doesntExist(): Promise<boolean> { return !(await this.exists()); }

  async raw(sql: string, bindings: unknown[] = []): Promise<unknown[]> {
    return this._execute(sql, bindings);
  }
}
