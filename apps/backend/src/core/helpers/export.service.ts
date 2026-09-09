import { Injectable } from "@nestjs/common";
import { Response } from "express";
import * as fs from "fs";
import * as path from "path";

export interface ExportColumn<T = any> {
  key: string;
  label: string;
  formatter?: (val: any, row: T) => string;
}

@Injectable()
export class ExportService {
  static sanitizeCell(value: unknown): string {
    if (value === null || value === undefined) return '""';
    let str = String(value);

    // Prevent CSV Formula Injection vulnerability in Excel/Calc
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }

    // Escape existing double quotes
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  static formatRow(values: unknown[]): string {
    return values.map((v) => this.sanitizeCell(v)).join(",") + "\r\n";
  }

  async toCsvStream<T = any>(
    dataSource: T[] | AsyncIterable<T>,
    columns: ExportColumn<T>[],
    res: Response,
    filename = "export.csv"
  ): Promise<void> {
    const safeFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(safeFilename)}"`);

    // Write UTF-8 BOM for Microsoft Excel native Bengali/Unicode support
    res.write("\uFEFF");

    const headerRow = columns.map((c) => c.label || c.key);
    res.write(ExportService.formatRow(headerRow));

    const processRow = (item: any): string => {
      const rowValues = columns.map((col) => {
        let val = item[col.key];
        if (typeof col.formatter === "function") {
          val = col.formatter(val, item);
        }
        return val;
      });
      return ExportService.formatRow(rowValues);
    };

    if (Array.isArray(dataSource)) {
      for (const item of dataSource) {
        if (!res.write(processRow(item))) {
          await new Promise((resolve) => res.once("drain", resolve));
        }
      }
      res.end();
      return;
    }

    if ((dataSource as any)[Symbol.asyncIterator]) {
      for await (const item of dataSource as AsyncIterable<T>) {
        if (!res.write(processRow(item))) {
          await new Promise((resolve) => res.once("drain", resolve));
        }
      }
      res.end();
      return;
    }

    res.end();
  }
}
