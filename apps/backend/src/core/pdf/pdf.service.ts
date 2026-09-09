import { Injectable, Logger } from "@nestjs/common";
import { Response } from "express";
import * as fs from "fs";
import * as path from "path";

const BENGALI_FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
  
  @page {
    size: A4;
    margin: 12mm;
  }

  body {
    font-family: 'Noto Sans Bengali', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
  }

  /* Complex Bengali Conjunct / Ligature Shaping */
  .bn-text, [lang="bn"] {
    font-feature-settings: "kern" 1, "liga" 1;
    font-family: 'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', sans-serif;
  }

  @media print {
    .no-print { display: none !important; }
    .page-break { page-break-after: always; }
  }
`;

export interface PdfOptions {
  format?: string;
  orientation?: "portrait" | "landscape";
  margin?: string;
  injectBengaliFont?: boolean;
  [key: string]: unknown;
}

export class PdfDocument {
  private options: PdfOptions;
  private styledHtml: string;

  constructor(htmlContent: string, options: PdfOptions = {}) {
    this.options = {
      format: options.format || "A4",
      orientation: options.orientation || "portrait",
      margin: options.margin || "12mm",
      injectBengaliFont: options.injectBengaliFont !== false,
      ...options,
    };
    this.styledHtml = this._prepareHtml(htmlContent);
  }

  private _prepareHtml(html: string): string {
    if (!this.options.injectBengaliFont) return html;
    const styleTag = `<style>${BENGALI_FONT_CSS}</style>`;

    if (html.includes("</head>")) {
      return html.replace("</head>", `${styleTag}</head>`);
    } else if (html.includes("<body")) {
      return html.replace(/<body[^>]*>/, `$&amp;${styleTag}`);
    } else {
      return `<!DOCTYPE html><html><head><meta charset="utf-8">${styleTag}</head><body>${html}</body></html>`;
    }
  }

  toHtml(): string {
    return this.styledHtml;
  }

  async toBuffer(): Promise<Buffer> {
    try {
      const puppeteer = require("puppeteer");
      const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
      const page = await browser.newPage();
      await page.setContent(this.styledHtml, { waitUntil: "networkidle0" });
      const buffer = await page.pdf({
        format: this.options.format,
        landscape: this.options.orientation === "landscape",
        printBackground: true,
        margin: { top: this.options.margin, right: this.options.margin, bottom: this.options.margin, left: this.options.margin },
      });
      await browser.close();
      return buffer;
    } catch {
      return Buffer.from(this.styledHtml, "utf-8");
    }
  }

  async download(res: Response, filename = "document.pdf"): Promise<void> {
    const safeName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);

    const buffer = await this.toBuffer();
    res.send(buffer);
  }

  async inline(res: Response, filename = "document.pdf"): Promise<void> {
    const safeName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);

    const buffer = await this.toBuffer();
    res.send(buffer);
  }

  async save(filePath: string): Promise<string> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const buffer = await this.toBuffer();
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  loadHtml(html: string, options: PdfOptions = {}): PdfDocument {
    return new PdfDocument(html, options);
  }

  async loadView(viewPath: string, data: Record<string, unknown> = {}, options: PdfOptions = {}): Promise<PdfDocument> {
    const viewsDir = path.join(process.cwd(), "views");
    let fullPath = path.join(viewsDir, viewPath);
    if (!fullPath.endsWith(".ejs")) {
      fullPath += ".ejs";
    }

    if (!fs.existsSync(fullPath)) {
      throw new Error(`PDF template view not found: ${fullPath}`);
    }

    let ejs: any;
    try {
      ejs = require("ejs");
    } catch {
      // Fallback simple string template replace if ejs not installed
      let content = fs.readFileSync(fullPath, "utf-8");
      for (const [k, v] of Object.entries(data)) {
        content = content.replace(new RegExp(`<%=\\s*${k}\\s*%>`, "g"), String(v));
      }
      return new PdfDocument(content, options);
    }

    const templateContent = fs.readFileSync(fullPath, "utf-8");
    const renderedHtml = ejs.render(templateContent, data, {
      views: [viewsDir],
      filename: fullPath,
    });

    return new PdfDocument(renderedHtml, options);
  }
}
