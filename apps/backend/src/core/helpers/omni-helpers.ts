import * as crypto from "crypto";
import * as path from "path";

/**
 * OmniFlow Global Utility Helpers
 * Inspired by NodeFlow-React helpers.js
 * Tree-shakeable utility functions for use anywhere in the application.
 */

// ----------------------------------------------
//  ENVIRONMENT
// ----------------------------------------------

export const env = (key: string, defaultValue: string | null = null): string | null => {
  return process.env[key] !== undefined ? (process.env[key] as string) : defaultValue;
};

// ----------------------------------------------
//  STRING UTILITIES
// ----------------------------------------------

export const slugify = (text: string): string => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const strRandom = (length = 16): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const strToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
};

export const strLimit = (text: string, limit = 100, end = "..."): string => {
  if (text.length <= limit) return text;
  return text.substring(0, limit) + end;
};

export const studlyCase = (str: string): string => {
  return str.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (c) => c.toUpperCase());
};

export const camelCase = (str: string): string => {
  const s = studlyCase(str);
  return s.charAt(0).toLowerCase() + s.slice(1);
};

export const snakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, (m, p1, offset) => (offset > 0 ? "_" + p1 : p1))
    .toLowerCase()
    .replace(/[-\s]+/g, "_");
};

// ----------------------------------------------
//  NUMBER / CURRENCY UTILITIES
// ----------------------------------------------

export const formatCurrency = (amount: number | string, symbol = "?"): string => {
  const val = parseFloat(String(amount)) || 0;
  return symbol + " " + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const numberToWords = (num: number): string => {
  const dictionary: Record<number, string> = {
    0: "Zero", 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven",
    8: "Eight", 9: "Nine", 10: "Ten", 11: "Eleven", 12: "Twelve", 13: "Thirteen", 14: "Fourteen",
    15: "Fifteen", 16: "Sixteen", 17: "Seventeen", 18: "Eighteen", 19: "Nineteen", 20: "Twenty",
    30: "Thirty", 40: "Forty", 50: "Fifty", 60: "Sixty", 70: "Seventy", 80: "Eighty", 90: "Ninety",
    100: "Hundred", 1000: "Thousand", 1000000: "Million", 1000000000: "Billion",
  };

  if (isNaN(num)) return "";
  num = parseFloat(String(num));
  if (num === 0) return "Zero";
  if (num < 0) return "Negative " + numberToWords(Math.abs(num));
  if (num < 21) return dictionary[num] || "";
  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const units = num % 10;
    return dictionary[tens] + (units ? "-" + dictionary[units] : "");
  }
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const r = num % 100;
    return dictionary[h] + " Hundred" + (r ? " and " + numberToWords(r) : "");
  }
  const units = [1000000000, 1000000, 1000];
  for (const unit of units) {
    if (num >= unit) {
      const q = Math.floor(num / unit);
      const r = num % unit;
      return numberToWords(q) + " " + dictionary[unit] + (r ? ", " + numberToWords(r) : "");
    }
  }
  return String(num);
};

export const round = (value: number, decimals = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// ----------------------------------------------
//  DATE UTILITIES
// ----------------------------------------------

export const formatDate = (dateStr: string | Date, formatPattern = "YYYY-MM-DD"): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return formatPattern
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", pad(date.getMonth() + 1))
    .replace("DD", pad(date.getDate()))
    .replace("HH", pad(date.getHours()))
    .replace("mm", pad(date.getMinutes()))
    .replace("ss", pad(date.getSeconds()));
};

export const now = (): string => {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
};

export const nowMs = (): number => Date.now();

export const diffInDays = (date1: Date | string, date2: Date | string = new Date()): number => {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date | string, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// ----------------------------------------------
//  ARRAY / OBJECT UTILITIES
// ----------------------------------------------

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((acc, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) return [...new Set(array)];
  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((k) => { if (k in obj) result[k] = obj[k]; });
  return result;
};

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((k) => delete (result as Record<string, unknown>)[k as string]);
  return result as Omit<T, K>;
};

// ----------------------------------------------
//  HASH / CRYPTO UTILITIES
// ----------------------------------------------

export const md5 = (value: string): string => {
  return crypto.createHash("md5").update(value).digest("hex");
};

export const sha256 = (value: string): string => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

export const hmacSha256 = (data: string, secret: string): string => {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

// ----------------------------------------------
//  URL / PATH UTILITIES
// ----------------------------------------------

export const baseUrl = (urlPath = ""): string => {
  const base = process.env.APP_URL || "http://localhost:" + (process.env.PORT || "4000");
  return base.replace(/\/$/, "") + "/" + String(urlPath).replace(/^\/+/, "");
};

export const storagePath = (...segments: string[]): string => {
  return path.join(process.cwd(), "storage", ...segments);
};

export const publicPath = (...segments: string[]): string => {
  return path.join(process.cwd(), "public", ...segments);
};

// ----------------------------------------------
//  VALIDATION UTILITIES
// ----------------------------------------------

export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isPhone = (value: string): boolean => /^(\+880|880|0)?[1-9]\d{9}$/.test(String(value));
export const isUrl = (value: string): boolean => { try { new URL(value); return true; } catch { return false; } };
export const isEmpty = (value: unknown): boolean => value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
