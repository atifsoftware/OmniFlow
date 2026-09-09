import { OmniDbService } from "./omni-db.service";
import { QueryBuilder } from "./query-builder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelConstructor = new (...args: any[]) => BaseModel;

export class BaseModel {
  static table = "";
  static primaryKey = "id";
  static hidden: string[] = [];
  static fillable: string[] = [];
  static softDeletes = false;
  static _globalScopes: Map<string, (builder: QueryBuilder) => void> = new Map();
  static _db: OmniDbService;

  protected _attributes: Record<string, unknown> = {};
  protected _exists = false;

  constructor(attributes: Record<string, unknown> = {}) {
    this._fill(attributes);
  }

  protected _fill(attributes: Record<string, unknown>): this {
    for (const [key, value] of Object.entries(attributes)) {
      this._attributes[key] = value;
    }
    return this;
  }

  get(key: string): unknown {
    return this._attributes[key] !== undefined ? this._attributes[key] : null;
  }

  set(key: string, value: unknown): this {
    this._attributes[key] = value;
    return this;
  }

  getAttributes(): Record<string, unknown> {
    return { ...this._attributes };
  }

  static getTable(): string {
    if (this.table) return this.table;
    const name = this.name.replace(/([A-Z])/g, (m, p1, offset) =>
      offset > 0 ? "_" + p1.toLowerCase() : p1.toLowerCase()
    );
    return name + "s";
  }


  static addGlobalScope(name: string, scope: (builder: QueryBuilder) => void): void {
    if (!this._globalScopes) {
      this._globalScopes = new Map();
    }
    this._globalScopes.set(name, scope);
  }

  static withoutGlobalScope(name: string): OmniQueryProxy {
    const proxy = this.query();
    proxy.ignoreScope(name);
    return proxy;
  }

  static query(): OmniQueryProxy {
    const ModelClass = this as typeof BaseModel;
    const qb = ModelClass._db.table(ModelClass.getTable());
    return new OmniQueryProxy(ModelClass, qb);
  }

  static async all(): Promise<BaseModel[]> {
    return this.query().get();
  }

  static async find(id: unknown): Promise<BaseModel | null> {
    return this.query().where(this.primaryKey, id).first();
  }

  static async findOrFail(id: unknown): Promise<BaseModel> {
    const result = await this.find(id);
    if (!result) throw new Error(this.name + " with id=" + id + " not found.");
    return result;
  }

  static async create(data: Record<string, unknown>): Promise<BaseModel> {
    const insertId = await this._db.table(this.getTable()).insert(data);
    return (await this.find(insertId)) as BaseModel;
  }

  static async updateById(id: unknown, data: Record<string, unknown>): Promise<number> {
    return this._db.table(this.getTable()).where(this.primaryKey, id).update(data);
  }

  static async destroy(id: unknown): Promise<number> {
    if (this.softDeletes) {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      return this._db.table(this.getTable()).where(this.primaryKey, id).update({ deleted_at: now });
    }
    return this._db.table(this.getTable()).where(this.primaryKey, id).delete();
  }

  async save(): Promise<boolean> {
    const ctor = this.constructor as typeof BaseModel;
    const pk = ctor.primaryKey;
    if (this._exists) {
      const id = this._attributes[pk];
      if (!id) throw new Error("Primary key missing for update.");
      await ctor._db.table(ctor.getTable()).where(pk, id).update(this._attributes);
    } else {
      const insertId = await ctor._db.table(ctor.getTable()).insert(this._attributes);
      if (insertId) {
        this._attributes[pk] = insertId;
        this._exists = true;
      }
    }
    return true;
  }

  async delete(): Promise<boolean> {
    if (!this._exists) return false;
    const ctor = this.constructor as typeof BaseModel;
    const pk = ctor.primaryKey;
    const id = this._attributes[pk];
    if (ctor.softDeletes) {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      await ctor._db.table(ctor.getTable()).where(pk, id).update({ deleted_at: now });
      this._attributes["deleted_at"] = now;
      return true;
    }
    await ctor._db.table(ctor.getTable()).where(pk, id).delete();
    return true;
  }

  async restore(): Promise<boolean> {
    const ctor = this.constructor as typeof BaseModel;
    if (!ctor.softDeletes || !this._exists) return false;
    const pk = ctor.primaryKey;
    const id = this._attributes[pk];
    await ctor._db.table(ctor.getTable()).where(pk, id).update({ deleted_at: null });
    this._attributes["deleted_at"] = null;
    return true;
  }

  hasMany(RelatedModel: typeof BaseModel, foreignKey: string, localKey?: string): OmniRelation {
    const lk = localKey || (this.constructor as typeof BaseModel).primaryKey;
    return new OmniRelation("hasMany", RelatedModel, foreignKey, lk, this);
  }

  hasOne(RelatedModel: typeof BaseModel, foreignKey: string, localKey?: string): OmniRelation {
    const lk = localKey || (this.constructor as typeof BaseModel).primaryKey;
    return new OmniRelation("hasOne", RelatedModel, foreignKey, lk, this);
  }

  belongsTo(RelatedModel: typeof BaseModel, foreignKey: string, ownerKey?: string): OmniRelation {
    const ok = ownerKey || RelatedModel.primaryKey;
    return new OmniRelation("belongsTo", RelatedModel, foreignKey, ok, this);
  }

  toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    const hidden = (this.constructor as typeof BaseModel).hidden || [];
    for (const [key, value] of Object.entries(this._attributes)) {
      if (hidden.includes(key)) continue;
      if (value instanceof BaseModel) {
        data[key] = value.toJSON();
      } else if (Array.isArray(value)) {
        data[key] = value.map((v) => (v instanceof BaseModel ? v.toJSON() : v));
      } else {
        data[key] = value;
      }
    }
    return data;
  }

  toArray(): Record<string, unknown> {
    return this.toJSON();
  }
}

export class OmniRelation {
  constructor(
    public type: string,
    public RelatedModel: typeof BaseModel,
    public foreignKey: string,
    public localKey: string,
    private parentInstance: BaseModel,
  ) {}

  async resolve(): Promise<BaseModel | BaseModel[] | null> {
    const localValue = this.parentInstance.get(this.localKey);
    if (localValue === undefined || localValue === null) {
      return this.type === "hasMany" ? [] : null;
    }
    if (this.type === "hasMany") {
      return this.RelatedModel.query().where(this.foreignKey, localValue).get();
    }
    if (this.type === "hasOne") {
      return this.RelatedModel.query().where(this.foreignKey, localValue).first();
    }
    return this.RelatedModel.query().where(this.RelatedModel.primaryKey, localValue).first();
  }

  then(resolve: (value: BaseModel | BaseModel[] | null) => void, reject: (err: unknown) => void): void {
    this.resolve().then(resolve).catch(reject);
  }
}

export class OmniQueryProxy {
  private _eagerLoads: string[] = [];
  private _ignoredScopes: Set<string> = new Set();
  private _scopesApplied = false;

  ignoreScope(name: string): this {
    this._ignoredScopes.add(name);
    return this;
  }
  private _withTrashed = false;
  private _onlyTrashed = false;

  constructor(
    private ModelClass: typeof BaseModel,
    private qb: QueryBuilder,
  ) {}

  with(...relations: string[]): this {
    this._eagerLoads = [...this._eagerLoads, ...relations];
    return this;
  }

  withTrashed(): this { this._withTrashed = true; return this; }
  onlyTrashed(): this { this._onlyTrashed = true; return this; }

  where(column: string, operator?: unknown, value?: unknown): this { this.qb.where(column, operator, value); return this; }
  orWhere(col: string, op?: unknown, val?: unknown): this { this.qb.orWhere(col, op, val); return this; }
  whereIn(col: string, vals: unknown[]): this { this.qb.whereIn(col, vals); return this; }
  whereNotIn(col: string, vals: unknown[]): this { this.qb.whereNotIn(col, vals); return this; }
  whereNull(col: string): this { this.qb.whereNull(col); return this; }
  whereNotNull(col: string): this { this.qb.whereNotNull(col); return this; }
  whereBetween(col: string, range: [unknown, unknown]): this { this.qb.whereBetween(col, range); return this; }
  whereLike(col: string, val: string): this { this.qb.whereLike(col, val); return this; }
  whereRaw(sql: string, b?: unknown[]): this { this.qb.whereRaw(sql, b); return this; }
  orderBy(col: string, dir?: "ASC" | "DESC"): this { this.qb.orderBy(col, dir); return this; }
  orderByDesc(col: string): this { this.qb.orderByDesc(col); return this; }
  latest(col?: string): this { this.qb.latest(col); return this; }
  oldest(col?: string): this { this.qb.oldest(col); return this; }
  limit(n: number): this { this.qb.limit(n); return this; }
  offset(n: number): this { this.qb.offset(n); return this; }
  forPage(page: number, perPage?: number): this { this.qb.forPage(page, perPage); return this; }
  select(...fields: string[]): this { this.qb.select(...fields); return this; }
  join(t: string, f: string, op?: string, s?: string, type?: string): this { this.qb.join(t, f, op, s, type); return this; }
  leftJoin(t: string, f: string, op?: string, s?: string): this { this.qb.leftJoin(t, f, op, s); return this; }
  groupBy(col: string): this { this.qb.groupBy(col); return this; }
  having(col: string, op: string, val: unknown): this { this.qb.having(col, op, val); return this; }
  when(cond: unknown, cb: (qb: this) => void, def?: (qb: this) => void): this {
    if (cond) { cb(this); } else if (def) { def(this); }
    return this;
  }

  private _applyCriteria(): void {
    if (this.ModelClass.softDeletes) {
      if (this._onlyTrashed) {
        this.qb.whereNotNull("deleted_at");
      } else if (!this._withTrashed) {
        this.qb.whereNull("deleted_at");
      }
    }
  }

  private _hydrate(rows: Record<string, unknown>[]): BaseModel[] {
    return rows.map((r) => {
      const Ctor = this.ModelClass as ModelConstructor;
      const inst = new Ctor(r);
      (inst as unknown as { _exists: boolean })._exists = true;
      return inst;
    });
  }

  private _applyScopes(): void {
    if (this._scopesApplied) return;
    this._scopesApplied = true;
    const scopes = this.ModelClass._globalScopes;
    if (scopes) {
      for (const [name, scope] of scopes.entries()) {
        if (!this._ignoredScopes.has(name)) {
          scope(this.qb);
        }
      }
    }
  }

  async get(): Promise<BaseModel[]> {
    this._applyScopes();
    this._applyCriteria();
    const rows = await this.qb.get<Record<string, unknown>>();
    const instances = this._hydrate(rows);
    if (this._eagerLoads.length > 0 && instances.length > 0) {
      for (const relation of this._eagerLoads) {
        await this._eagerLoad(instances, relation);
      }
    }
    return instances;
  }

  async first(): Promise<BaseModel | null> {
    this._applyScopes();
    this._applyCriteria();
    this.qb.limit(1);
    const rows = await this.qb.get<Record<string, unknown>>();
    if (rows.length === 0) return null;
    const instance = this._hydrate(rows)[0];
    if (this._eagerLoads.length > 0) {
      for (const relation of this._eagerLoads) {
        await this._eagerLoad([instance], relation);
      }
    }
    return instance;
  }

  async firstOrFail(): Promise<BaseModel> {
    const result = await this.first();
    if (!result) throw new Error("No record found in: " + this.ModelClass.getTable());
    return result;
  }

  async count(): Promise<number> { this._applyCriteria(); return this.qb.count(); }
  async sum(column: string): Promise<number> { this._applyCriteria(); return this.qb.sum(column); }
  async avg(column: string): Promise<number> { this._applyCriteria(); return this.qb.avg(column); }
  async min(column: string): Promise<number> { this._applyCriteria(); return this.qb.min(column); }
  async max(column: string): Promise<number> { this._applyCriteria(); return this.qb.max(column); }
  async exists(): Promise<boolean> { this._applyCriteria(); return this.qb.exists(); }
  async pluck<V = unknown>(column: string): Promise<V[]> { return this.qb.pluck<V>(column); }

  async update(data: Record<string, unknown>): Promise<number> {
    this._applyCriteria();
    return this.qb.update(data);
  }

  async delete(): Promise<number> {
    if (this.ModelClass.softDeletes) {
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      this._applyCriteria();
      return this.qb.update({ deleted_at: now });
    }
    this._applyCriteria();
    return this.qb.delete();
  }

  async increment(column: string, amount = 1): Promise<number> {
    this._applyCriteria();
    return this.qb.increment(column, amount);
  }

  async decrement(column: string, amount = 1): Promise<number> {
    this._applyCriteria();
    return this.qb.decrement(column, amount);
  }

  private async _eagerLoad(instances: BaseModel[], relationName: string): Promise<void> {
    const Ctor = this.ModelClass as ModelConstructor;
    const dummy = new Ctor();
    const methodFn = (dummy as unknown as Record<string, unknown>)[relationName];
    if (typeof methodFn !== "function") return;

    const relationObj = (methodFn as () => OmniRelation).call(dummy);
    const { type, RelatedModel, foreignKey, localKey } = relationObj;

    const parentKeys = [
      ...new Set(instances.map((inst) => inst.get(localKey)).filter((k) => k !== null && k !== undefined)),
    ];

    if (parentKeys.length === 0) {
      instances.forEach((inst) => {
        (inst as unknown as Record<string, unknown>)[relationName] = type === "hasMany" ? [] : null;
      });
      return;
    }

    let related: BaseModel[];
    if (type === "belongsTo") {
      related = await RelatedModel.query().whereIn(RelatedModel.primaryKey, parentKeys).get();
    } else {
      related = await RelatedModel.query().whereIn(foreignKey, parentKeys).get();
    }

    instances.forEach((inst) => {
      const val = inst.get(localKey);
      if (type === "hasMany") {
        (inst as unknown as Record<string, unknown>)[relationName] = related.filter(
          (r) => String(r.get(foreignKey)) === String(val),
        );
      } else if (type === "hasOne") {
        (inst as unknown as Record<string, unknown>)[relationName] =
          related.find((r) => String(r.get(foreignKey)) === String(val)) || null;
      } else {
        (inst as unknown as Record<string, unknown>)[relationName] =
          related.find((r) => String(r.get(RelatedModel.primaryKey)) === String(val)) || null;
      }
    });
  }
}
