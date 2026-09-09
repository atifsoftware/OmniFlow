import { Pool, PoolConnection } from "mysql2/promise";

/**
 * OmniFlow Fluent Query Builder
 * Supports both MySQL and PostgreSQL natively with automatic dialect detection,
 * identifier quoting, parameter placeholder conversion ($1 vs ?), and locking clauses.
 */

export interface WhereClause {
  boolean: "AND" | "OR";
  sql: string;
  bindings: unknown[];
}

export type DbDialect = "mysql" | "postgresql";

export class QueryBuilder {
  private _table: string;
  private _connection: any = null;
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
  private _pool: any;
  private _dbType: DbDialect = "mysql";

  constructor(table: string, pool: any, connection: any = null, dbType: DbDialect = "mysql") {
    this._table = table;
    this._pool = pool;
    this._connection = connection;
    this._dbType = dbType;
  }

  setDbType(type: DbDialect): this {
    this._dbType = type;
    return this;
  }

  getDbType(): DbDialect {
    return this._dbType;
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

  private _escapeIdentifier(name: string): string {
    if (name.includes(".")) {
      return name.split(".").map((part) => this._escapeIdentifier(part)).join(".");
    }
    if (this._dbType === "postgresql") {
      return '"' + name + '"';
    }
    return "`" + name + "`";
  }

  private _escapeCol(column: string): string {
    if (column.includes("(") || column.includes(" ") || column === "*") return column;
    return this._escapeIdentifier(column);
  }

  private _parseTableName(table: string): string {
    const lower = table.toLowerCase();
    if (lower.includes(" as ")) {
      const parts = table.split(/ as /i);
      return this._escapeIdentifier(parts[0].trim()) + " AS " + this._escapeIdentifier(parts[1].trim());
    }
    return this._escapeIdentifier(table);
  }

  formatPlaceholders(sql: string): string {
    if (this._dbType === "postgresql") {
      let idx = 0;
      return sql.replace(/\?/g, () => `$${++idx}`);
    }
    return sql;
  }

  where(column: string, operator?: unknown, value?: unknown): this {
    if (arguments.length === 2) {
      value = operator;
      operator = "=";
    }
    const col = this._escapeCol(column);
    this._wheres.push({
      boolean: "AND",
      sql: `${col} ${operator} ?`,
      bindings: [value],
    });
    return this;
  }

  orWhere(column: string, operator?: unknown, value?: unknown): this {
    if (arguments.length === 2) {
      value = operator;
      operator = "=";
    }
    const col = this._escapeCol(column);
    this._wheres.push({
      boolean: "OR",
      sql: `${col} ${operator} ?`,
      bindings: [value],
    });
    return this;
  }

  whereIn(column: string, values: unknown[]): this {
    if (values.length === 0) {
      this._wheres.push({ boolean: "AND", sql: "1 = 0", bindings: [] });
      return this;
    }
    const col = this._escapeCol(column);
    const placeholders = values.map(() => "?").join(", ");
    this._wheres.push({
      boolean: "AND",
      sql: `${col} IN (${placeholders})`,
      bindings: values,
    });
    return this;
  }

  whereNotIn(column: string, values: unknown[]): this {
    if (values.length === 0) return this;
    const col = this._escapeCol(column);
    const placeholders = values.map(() => "?").join(", ");
    this._wheres.push({
      boolean: "AND",
      sql: `${col} NOT IN (${placeholders})`,
      bindings: values,
    });
    return this;
  }

  whereNull(column: string): this {
    const col = this._escapeCol(column);
    this._wheres.push({ boolean: "AND", sql: `${col} IS NULL`, bindings: [] });
    return this;
  }

  whereNotNull(column: string): this {
    const col = this._escapeCol(column);
    this._wheres.push({ boolean: "AND", sql: `${col} IS NOT NULL`, bindings: [] });
    return this;
  }

  whereBetween(column: string, range: [unknown, unknown]): this {
    const col = this._escapeCol(column);
    this._wheres.push({
      boolean: "AND",
      sql: `${col} BETWEEN ? AND ?`,
      bindings: [range[0], range[1]],
    });
    return this;
  }

  whereLike(column: string, value: string): this {
    const col = this._escapeCol(column);
    const op = this._dbType === "postgresql" ? "ILIKE" : "LIKE";
    this._wheres.push({
      boolean: "AND",
      sql: `${col} ${op} ?`,
      bindings: [value],
    });
    return this;
  }

  whereRaw(sql: string, bindings: unknown[] = []): this {
    this._wheres.push({ boolean: "AND", sql, bindings });
    return this;
  }

  orWhereRaw(sql: string, bindings: unknown[] = []): this {
    this._wheres.push({ boolean: "OR", sql, bindings });
    return this;
  }

  join(table: string, first: string, operator: string, second: string, type = "INNER"): this {
    const escTable = this._parseTableName(table);
    const escFirst = this._escapeCol(first);
    const escSecond = this._escapeCol(second);
    this._joins.push(`${type} JOIN ${escTable} ON ${escFirst} ${operator} ${escSecond}`);
    return this;
  }

  leftJoin(table: string, first: string, operator: string, second: string): this {
    return this.join(table, first, operator, second, "LEFT");
  }

  rightJoin(table: string, first: string, operator: string, second: string): this {
    return this.join(table, first, operator, second, "RIGHT");
  }

  orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
    this._orders.push(`${this._escapeCol(column)} ${direction.toUpperCase()}`);
    return this;
  }

  orderByDesc(column: string): this {
    return this.orderBy(column, "DESC");
  }

  latest(column = "created_at"): this {
    return this.orderBy(column, "DESC");
  }

  oldest(column = "created_at"): this {
    return this.orderBy(column, "ASC");
  }

  groupBy(...columns: string[]): this {
    this._groupBy = "GROUP BY " + columns.map((c) => this._escapeCol(c)).join(", ");
    return this;
  }

  having(column: string, operator: string, value: unknown): this {
    this._having = `HAVING ${this._escapeCol(column)} ${operator} ?`;
    this._havingBindings.push(value);
    return this;
  }

  limit(count: number): this {
    this._limit = count;
    return this;
  }

  offset(count: number): this {
    this._offset = count;
    return this;
  }

  forPage(page: number, perPage = 15): this {
    return this.offset((page - 1) * perPage).limit(perPage);
  }

  forUpdate(): this {
    this._lock = "FOR UPDATE";
    return this;
  }

  sharedLock(): this {
    this._lock = this._dbType === "postgresql" ? "FOR SHARE" : "LOCK IN SHARE MODE";
    return this;
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

  toSqlWithBindings(): { sql: string; bindings: unknown[] } {
    const rawSql = this.toSql();
    const bindings = this.getBindings();
    return {
      sql: this._dbType === "postgresql" ? this.formatPlaceholders(rawSql) : rawSql,
      bindings,
    };
  }

  toRawSql(): string {
    const sql = this.toSql();
    const bindings = this.getBindings();
    let idx = 0;
    return sql.replace(/\?/g, () => {
      const val = bindings[idx++];
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "number") return String(val);
      if (typeof val === "boolean") return val ? "1" : "0";
      return "'" + String(val).replace(/'/g, "''") + "'";
    });
  }

  getBindings(): unknown[] {
    const { bindings } = this._compileWheres();
    return [...bindings, ...this._havingBindings];
  }

  private async _execute(sql: string, bindings: unknown[] = []): Promise<unknown[]> {
    const executor = this._connection || this._pool;
    if (this._dbType === "postgresql") {
      const formattedSql = this.formatPlaceholders(sql);
      const res = await (executor as any).query(formattedSql, bindings);
      return res.rows as unknown[];
    } else {
      const [rows] = await (executor as Pool).query(sql, bindings);
      return rows as unknown[];
    }
  }

  async get<T = Record<string, unknown>>(): Promise<T[]> {
    return (await this._execute(this.toSql(), this.getBindings())) as T[];
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    this.limit(1);
    const rows = await this.get<T>();
    return rows.length > 0 ? rows[0] : null;
  }

  async find<T = Record<string, unknown>>(id: unknown, primaryKey = "id"): Promise<T | null> {
    return this.where(primaryKey, id).first<T>();
  }

  async value<T = unknown>(column: string): Promise<T | null> {
    this.select(column);
    const row = (await this.first()) as Record<string, unknown> | null;
    return row ? (row[column] as T) : null;
  }

  async pluck<T = unknown>(column: string): Promise<T[]>;
  async pluck<T = unknown>(column: string, key: string): Promise<Record<string, T>>;
  async pluck<T = unknown>(column: string, key?: string): Promise<T[] | Record<string, T>> {
    this.select(key ? `${column}, ${key}` : column);
    const rows = (await this.get()) as Record<string, unknown>[];
    if (key) {
      const map: Record<string, T> = {};
      rows.forEach((r) => { map[String(r[key])] = r[column] as T; });
      return map;
    }
    return rows.map((r) => r[column] as T);
  }

  async paginate<T = Record<string, unknown>>(
    page = 1,
    perPage = 15
  ): Promise<{ data: T[]; total: number; page: number; perPage: number; lastPage: number }> {
    const total = await this.count();
    const data = await this.forPage(page, perPage).get<T>();
    return {
      data,
      total,
      page,
      perPage,
      lastPage: Math.ceil(total / perPage),
    };
  }

  async insert(data: Record<string, unknown>): Promise<number> {
    const keys = Object.keys(data);
    const isPg = this._dbType === "postgresql";
    const escTable = this._parseTableName(this._table);
    const escCols = keys.map((k) => this._escapeIdentifier(k)).join(", ");
    const placeholders = keys.map((_, i) => isPg ? `$${i + 1}` : "?").join(", ");
    const values = Object.values(data);

    let sql = `INSERT INTO ${escTable} (${escCols}) VALUES (${placeholders})`;
    if (isPg) {
      sql += " RETURNING id";
    }

    const executor = this._connection || this._pool;
    if (isPg) {
      const res = await (executor as any).query(sql, values);
      return res.rows[0]?.id;
    } else {
      const [result] = await (executor as Pool).query(sql, values);
      return (result as { insertId: number }).insertId;
    }
  }

  async update(data: Record<string, unknown>): Promise<number> {
    const keys = Object.keys(data);
    const isPg = this._dbType === "postgresql";
    const escTable = this._parseTableName(this._table);
    const assignments = keys.map((k) => `${this._escapeIdentifier(k)} = ?`).join(", ");
    let sql = `UPDATE ${escTable} SET ${assignments}`;
    const { sql: whereSql, bindings: whereBindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const allBindings = [...Object.values(data), ...whereBindings];

    const executor = this._connection || this._pool;
    if (isPg) {
      const formattedSql = this.formatPlaceholders(sql);
      const res = await (executor as any).query(formattedSql, allBindings);
      return res.rowCount ?? 0;
    } else {
      const [result] = await (executor as Pool).query(sql, allBindings);
      return (result as { affectedRows: number }).affectedRows;
    }
  }

  async delete(): Promise<number> {
    const escTable = this._parseTableName(this._table);
    let sql = `DELETE FROM ${escTable}`;
    const { sql: whereSql, bindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;

    const executor = this._connection || this._pool;
    if (this._dbType === "postgresql") {
      const formattedSql = this.formatPlaceholders(sql);
      const res = await (executor as any).query(formattedSql, bindings);
      return res.rowCount ?? 0;
    } else {
      const [result] = await (executor as Pool).query(sql, bindings);
      return (result as { affectedRows: number }).affectedRows;
    }
  }

  async count(column = "*"): Promise<number> {
    const escCol = column === "*" ? "*" : this._escapeCol(column);
    const escTable = this._parseTableName(this._table);
    let sql = `SELECT COUNT(${escCol}) AS total FROM ${escTable}`;
    if (this._joins.length > 0) sql += " " + this._joins.join(" ");
    const { sql: whereSql, bindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const rows = (await this._execute(sql, bindings)) as Array<{ total: number }>;
    return Number(rows[0]?.total ?? 0);
  }

  async sum(column: string): Promise<number> {
    return this._aggregate("SUM", column);
  }

  async avg(column: string): Promise<number> {
    return this._aggregate("AVG", column);
  }

  async min(column: string): Promise<number> {
    return this._aggregate("MIN", column);
  }

  async max(column: string): Promise<number> {
    return this._aggregate("MAX", column);
  }

  private async _aggregate(func: string, column: string): Promise<number> {
    const escCol = this._escapeCol(column);
    const escTable = this._parseTableName(this._table);
    let sql = `SELECT ${func}(${escCol}) AS aggregate FROM ${escTable}`;
    if (this._joins.length > 0) sql += " " + this._joins.join(" ");
    const { sql: whereSql, bindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;
    const rows = (await this._execute(sql, bindings)) as Array<{ aggregate: number }>;
    return Number(rows[0]?.aggregate ?? 0);
  }

  async increment(column: string, amount = 1, extra: Record<string, unknown> = {}): Promise<number> {
    const col = this._escapeCol(column);
    const escTable = this._parseTableName(this._table);
    const extraKeys = Object.keys(extra);
    const extraSql = extraKeys.map((k) => `, ${this._escapeIdentifier(k)} = ?`).join("");
    const extraVals = Object.values(extra);
    let sql = `UPDATE ${escTable} SET ${col} = ${col} + ?${extraSql}`;
    const { sql: whereSql, bindings: whereBindings } = this._compileWheres();
    if (whereSql) sql += " WHERE " + whereSql;

    const allBindings = [amount, ...extraVals, ...whereBindings];
    const executor = this._connection || this._pool;
    if (this._dbType === "postgresql") {
      const formattedSql = this.formatPlaceholders(sql);
      const res = await (executor as any).query(formattedSql, allBindings);
      return res.rowCount ?? 0;
    } else {
      const [result] = await (executor as Pool).query(sql, allBindings);
      return (result as { affectedRows: number }).affectedRows;
    }
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
