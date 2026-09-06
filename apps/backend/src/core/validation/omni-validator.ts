import { OmniDbService } from "../database/omni-db.service";

/**
 * OmniFlow Request Validator
 * Inspired by NodeFlow-React Validator.js
 * Supports sync + async (DB-based unique/exists) validation.
 * Default error messages in Bengali.
 *
 * Usage:
 *   const v = await OmniValidator.makeAsync(req.body, {
 *     name: "required|min:3|max:100",
 *     email: "required|email|unique:users,email",
 *     role: "required|in:admin,manager,staff",
 *   });
 *   if (v.fails()) throw new BadRequestException(v.errors());
 */

export class OmniValidator {
  static defaultMessages: Record<string, string> = {
    required: ":field ???? ?????? ???? ???? ????",
    email: ":field ?????? ???? ???? ????? ?????? ??? ????",
    min: ":field ??????? :param ??????? ??? ????",
    max: ":field ???????? :param ??????? ??? ????",
    numeric: ":field ?????? ?????? ??? ????",
    integer: ":field ?????? ??????????? ??? ????",
    string: ":field ?????? ???? ??????? ??? ????",
    boolean: ":field ?????? true ?? false ??? ????",
    date: ":field ???? ????? ????",
    url: ":field ?????? ?????????? ???? ????",
    in: "????????? :field-?? ???? ????",
    not_in: "????????? :field-?? ?????????? ????",
    unique: ":field-?? ???????? ??????? ???????",
    exists: "????????? :field-?? ???? ????",
    confirmed: ":field ?????????? ????? ???",
    between: ":field ?????? :param ??? :param2 ?? ????? ??? ????",
    regex: ":field ????????? ???? ????",
    nullable: "",
    array: ":field ?????? ???? ?????? ??? ????",
    alpha: ":field ????????? ???? ????? ??????",
    alpha_num: ":field ????????? ???? ? ?????? ????? ??????",
    digits: ":field ?????? :param ??????? ??? ????",
  };

  private _data: Record<string, unknown>;
  private _rules: Record<string, string | string[]>;
  private _errors: Record<string, string[]> = {};
  private _messages: Record<string, string>;
  private _fieldLabels: Record<string, string> = {};
  private static _db: OmniDbService;

  constructor(data: Record<string, unknown>, rules: Record<string, string | string[]>) {
    this._data = data;
    this._rules = rules;
    this._messages = { ...OmniValidator.defaultMessages };
  }

  static setDb(db: OmniDbService): void {
    OmniValidator._db = db;
  }

  setMessages(messages: Record<string, string>): this {
    this._messages = { ...OmniValidator.defaultMessages, ...messages };
    return this;
  }

  setFieldLabels(labels: Record<string, string>): this {
    this._fieldLabels = labels;
    return this;
  }

  /**
   * Sync factory — skips DB rules (unique, exists)
   */
  static make(
    data: Record<string, unknown>,
    rules: Record<string, string | string[]>,
    messages: Record<string, string> = {},
    labels: Record<string, string> = {},
  ): OmniValidator {
    const v = new OmniValidator(data, rules);
    if (Object.keys(messages).length > 0) v.setMessages(messages);
    if (Object.keys(labels).length > 0) v.setFieldLabels(labels);
    v.validate();
    return v;
  }

  /**
   * Async factory — supports DB-backed unique & exists rules
   */
  static async makeAsync(
    data: Record<string, unknown>,
    rules: Record<string, string | string[]>,
    messages: Record<string, string> = {},
    labels: Record<string, string> = {},
  ): Promise<OmniValidator> {
    const v = new OmniValidator(data, rules);
    if (Object.keys(messages).length > 0) v.setMessages(messages);
    if (Object.keys(labels).length > 0) v.setFieldLabels(labels);
    await v.validateAsync();
    return v;
  }

  validate(): boolean {
    this._errors = {};
    for (const [field, ruleString] of Object.entries(this._rules)) {
      const rules = typeof ruleString === "string" ? ruleString.split("|") : ruleString;
      const value = this._getValue(field);
      for (const rule of rules) {
        const { name: ruleName, params } = this._parseRule(rule);
        if (ruleName === "nullable") continue;
        if (ruleName !== "required" && (value === null || value === undefined || value === "")) continue;
        if (["unique", "exists"].includes(ruleName)) continue;
        if (!this._passes(ruleName, value, params, field)) {
          this._addError(field, ruleName, params);
        }
      }
    }
    return Object.keys(this._errors).length === 0;
  }

  async validateAsync(): Promise<boolean> {
    this._errors = {};
    for (const [field, ruleString] of Object.entries(this._rules)) {
      const rules = typeof ruleString === "string" ? ruleString.split("|") : ruleString;
      const value = this._getValue(field);
      for (const rule of rules) {
        const { name: ruleName, params } = this._parseRule(rule);
        if (ruleName === "nullable") continue;
        if (ruleName !== "required" && (value === null || value === undefined || value === "")) continue;

        let passed: boolean;
        if (ruleName === "unique") {
          passed = await this._isUnique(value, params);
        } else if (ruleName === "exists") {
          passed = await this._existsInDb(value, params);
        } else {
          passed = this._passes(ruleName, value, params, field);
        }
        if (!passed) this._addError(field, ruleName, params);
      }
    }
    return Object.keys(this._errors).length === 0;
  }

  fails(): boolean { return Object.keys(this._errors).length > 0; }
  passes(): boolean { return !this.fails(); }
  errors(): Record<string, string[]> { return this._errors; }
  firstError(field: string): string | null { return this._errors[field]?.[0] ?? null; }
  hasErrors(field?: string): boolean {
    if (field) return !!this._errors[field];
    return this.fails();
  }

  /**
   * Throws a BadRequestException with validation errors — NestJS compatible
   */
  throwIfFails(): void {
    if (this.fails()) {
      const { BadRequestException } = require("@nestjs/common");
      throw new BadRequestException({ message: "Validation failed.", errors: this._errors });
    }
  }

  private _getValue(field: string): unknown {
    return this._data[field] !== undefined ? this._data[field] : null;
  }

  private _parseRule(rule: string): { name: string; params: string[] } {
    if (rule.includes(":")) {
      const colonIdx = rule.indexOf(":");
      const name = rule.substring(0, colonIdx);
      const params = rule.substring(colonIdx + 1).split(",");
      return { name, params };
    }
    return { name: rule, params: [] };
  }

  private _passes(ruleName: string, value: unknown, params: string[], field: string): boolean {
    switch (ruleName) {
      case "required":
        return value !== null && value !== undefined && value !== "" && value !== false;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      case "min": {
        const minVal = Number(params[0]);
        if (typeof value === "number") return value >= minVal;
        return String(value).length >= minVal;
      }
      case "max": {
        const maxVal = Number(params[0]);
        if (typeof value === "number") return value <= maxVal;
        return String(value).length <= maxVal;
      }
      case "numeric": return !isNaN(Number(value));
      case "integer": return Number.isInteger(Number(value)) && !isNaN(Number(value));
      case "string": return typeof value === "string";
      case "boolean": return typeof value === "boolean" || value === "true" || value === "false" || value === 1 || value === 0;
      case "date": return !isNaN(Date.parse(String(value)));
      case "url": { try { new URL(String(value)); return true; } catch { return false; } }
      case "in": return params.includes(String(value));
      case "not_in": return !params.includes(String(value));
      case "confirmed": {
        const confirmValue = this._getValue(field + "_confirmation");
        return value === confirmValue;
      }
      case "between": {
        const len = typeof value === "number" ? value : String(value).length;
        return len >= Number(params[0]) && len <= Number(params[1]);
      }
      case "regex": {
        const pattern = new RegExp(params[0]);
        return pattern.test(String(value));
      }
      case "array": return Array.isArray(value);
      case "alpha": return /^[a-zA-Z]+$/.test(String(value));
      case "alpha_num": return /^[a-zA-Z0-9]+$/.test(String(value));
      case "digits": return /^\d+$/.test(String(value)) && String(value).length === Number(params[0]);
      default: return true;
    }
  }

  private async _isUnique(value: unknown, params: string[]): Promise<boolean> {
    if (!OmniValidator._db || params.length === 0) return true;
    const table = params[0];
    const column = params[1] || "email";
    const ignoreId = params[2] || null;
    const idColumn = params[3] || "id";
    let qb = OmniValidator._db.table(table).where(column, value);
    if (ignoreId) qb = qb.where(idColumn, "!=", ignoreId);
    const count = await qb.count();
    return count === 0;
  }

  private async _existsInDb(value: unknown, params: string[]): Promise<boolean> {
    if (!OmniValidator._db || params.length === 0) return true;
    const table = params[0];
    const column = params[1] || "id";
    const count = await OmniValidator._db.table(table).where(column, value).count();
    return count > 0;
  }

  private _addError(field: string, ruleName: string, params: string[]): void {
    const label = this._fieldLabels[field] || field;
    let message =
      this._messages[field + "." + ruleName] ||
      this._messages[ruleName] ||
      "The " + field + " field is invalid.";

    message = message.replace(/:field/g, label);
    if (params[0] !== undefined) message = message.replace(/:param\b/g, params[0]);
    if (params[1] !== undefined) message = message.replace(/:param2/g, params[1]);

    if (!this._errors[field]) this._errors[field] = [];
    this._errors[field].push(message);
  }
}
