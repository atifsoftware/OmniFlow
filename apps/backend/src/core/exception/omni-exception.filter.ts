import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

/**
 * OmniFlow Intelligent Exception Filter
 * Inspired by NodeFlow-React errorHandler.js
 *
 * Features:
 *  - JSON error for API requests
 *  - Beautiful HTML debug page for browser (dev mode)
 *  - Code preview around error line
 *  - Variable typo detection (Levenshtein distance)
 *  - SQL error analysis
 *  - Google + StackOverflow quick-search links
 *  - Full env/request snapshot
 */
@Catch()
export class OmniExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OmniExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = "An unexpected error occurred.";
    let errorName = "InternalServerError";
    let stack = "";
    let extraData: Record<string, unknown> = {};

    if (isHttpException) {
      errorName = exception.name || "HttpException";
      const exResp = exception.getResponse();
      if (typeof exResp === "string") {
        message = exResp;
      } else if (typeof exResp === "object" && exResp !== null) {
        message = (exResp as Record<string, unknown>).message as string || JSON.stringify(exResp);
        extraData = exResp as Record<string, unknown>;
      }
      stack = exception.stack || "";
    } else if (exception instanceof Error) {
      errorName = exception.name || "Error";
      message = exception.message;
      stack = exception.stack || "";
    }

    // Log errors
    if (status >= 500) {
      this.logger.error(`[${req.method}] ${req.url} → ${status} — ${message}`, stack);
    }

    // API response (JSON)
    const isApi =
      req.headers["accept"]?.includes("application/json") ||
      req.headers["content-type"]?.includes("application/json") ||
      req.path.startsWith("/api/") ||
      (req.headers["x-requested-with"] === "XMLHttpRequest");

    if (isApi) {
      res.status(status).json({
        success: false,
        message,
        code: errorName,
        ...(Object.keys(extraData).length > 0 ? { errors: extraData } : {}),
        ...(process.env.APP_ENV === "development" ? { stack: stack.split("\n").slice(0, 5) } : {}),
      });
      return;
    }

    // Development HTML debug page
    if (process.env.APP_ENV === "development" || process.env.NODE_ENV !== "production") {
      const { file, line } = this._parseStack(stack);
      const codeContext = this._getCodeContext(file, line);
      const suggestions = this._analyzeSuggestions(message, file);
      const html = this._buildDebugPage(status, errorName, message, file, line, stack, codeContext, suggestions, req);
      res.status(status).type("html").send(html);
      return;
    }

    // Production: plain JSON
    res.status(status).json({ success: false, message });
  }

  // ──────────────────────────────────────────────
  //  PRIVATE HELPERS
  // ──────────────────────────────────────────────

  private _parseStack(stack: string): { file: string; line: number } {
    const match =
      stack.match(/at\s+.*?\((.*?):(\d+):\d+\)/) ||
      stack.match(/at\s+(.*?):(\d+):\d+/);
    if (match) {
      return { file: match[1], line: parseInt(match[2]) };
    }
    return { file: "unknown", line: 0 };
  }

  private _getCodeContext(filePath: string, errorLine: number, contextLines = 5): string | null {
    try {
      if (!filePath || filePath === "unknown" || !fs.existsSync(filePath)) return null;
      const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
      const start = Math.max(0, errorLine - contextLines - 1);
      const end = Math.min(lines.length, errorLine + contextLines);
      return lines
        .slice(start, end)
        .map((l, i) => {
          const lineNo = start + i + 1;
          const marker = lineNo === errorLine ? " >>> " : "     ";
          return `${marker}${lineNo}: ${l}`;
        })
        .join("\n");
    } catch {
      return null;
    }
  }

  private _levenshtein(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
      Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : 1 + Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]);
      }
    }
    return matrix[b.length][a.length];
  }

  private _findSimilarVariables(filePath: string, varName: string): string[] {
    try {
      if (!filePath || !fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, "utf8");
      const vars = new Set<string>();
      for (const m of content.matchAll(/\b(?:const|let|var|this\.)(\w+)\b/g)) {
        vars.add(m[1]);
      }
      return [...vars].filter((v) => {
        const d = this._levenshtein(varName, v);
        return d > 0 && d <= 2;
      });
    } catch {
      return [];
    }
  }

  private _analyzeSuggestions(message: string, filePath: string): { causes: string[]; autoFix?: string } {
    const causes: string[] = [];
    let autoFix: string | undefined;

    if (message.includes("is not defined") || message.includes("Cannot read properties of undefined")) {
      const match = message.match(/['"]?(\w+)['"]?\s+is not defined/);
      if (match) {
        const varName = match[1];
        causes.push(`'${varName}' is not declared in this scope.`);
        causes.push("Check for missing import or typo in variable name.");
        const similar = this._findSimilarVariables(filePath, varName);
        if (similar.length > 0) autoFix = `Did you mean: ${similar.join(", ")}?`;
      }
    }
    if (message.toLowerCase().includes("sql") || message.toLowerCase().includes("er_no_such_table")) {
      causes.push("Database table or column does not exist.");
      causes.push("Check your migration files and DB_NAME in .env.");
    }
    if (message.includes("ECONNREFUSED")) {
      causes.push("Cannot connect to MySQL — is the database server running?");
      causes.push("Verify DB_HOST and DB_PORT in .env.");
    }
    if (message.includes("Cannot find module")) {
      causes.push("Missing npm package or incorrect import path.");
      causes.push("Run `npm install` or check the import path.");
    }
    if (message.includes("ValidationError") || message.includes("Validation failed")) {
      causes.push("Request data did not pass validation rules.");
    }
    if (causes.length === 0) {
      causes.push("Check the stack trace below for the exact location of the error.");
    }

    return { causes, autoFix };
  }

  private _buildDebugPage(
    status: number,
    errorName: string,
    message: string,
    file: string,
    line: number,
    stack: string,
    codeContext: string | null,
    suggestions: { causes: string[]; autoFix?: string },
    req: Request,
  ): string {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent("NestJS TypeScript " + message)}`;
    const soUrl = `https://stackoverflow.com/search?q=${encodeURIComponent("NestJS " + message)}`;

    const codeHtml = codeContext
      ? codeContext
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/(^|\n)(\s*>>>.*)/gm, '$1<span class="err-line">$2</span>')
      : "<em>Code context unavailable for this file.</em>";

    const causesHtml = suggestions.causes.map((c) => `<li>${c}</li>`).join("");
    const autoFixHtml = suggestions.autoFix
      ? `<li class="autofix">🚀 ${suggestions.autoFix}</li>`
      : "";

    const stackHtml = stack
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const isServerError = status >= 500;
    const borderColor = isServerError ? "#ef4444" : "#f59e0b";
    const titleIcon = isServerError ? "🚨" : "⚠️";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OmniFlow Debugger — ${errorName}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0f172a;color:#e2e8f0;font-family:'Fira Code',Consolas,monospace;padding:32px;line-height:1.7;font-size:14px}
    .wrap{max-width:1100px;margin:0 auto}
    .card{background:rgba(30,41,59,0.85);border:2px solid ${borderColor};border-radius:14px;padding:28px;margin-bottom:22px;box-shadow:0 25px 50px rgba(0,0,0,.5)}
    .header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:20px;margin-bottom:22px}
    h1{font-size:22px;color:${borderColor};font-weight:700}
    .meta{font-size:13px;opacity:.65;margin-top:4px}
    .btns a{display:inline-block;padding:6px 16px;border-radius:8px;text-decoration:none;color:#fff;font-size:12px;font-weight:700;margin-left:6px}
    .btn-g{background:#4285F4}.btn-so{background:#F48024}
    .label{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:8px;font-weight:700}
    .msg-box{background:rgba(239,68,68,.08);border-left:5px solid ${borderColor};padding:14px 18px;border-radius:8px;font-size:15px;color:#fca5a5}
    pre{white-space:pre-wrap;word-break:break-all;font-size:13px}
    .code-wrap{background:#0b0f19;border-radius:10px;padding:20px;border-left:6px solid ${borderColor};overflow-x:auto}
    .err-line{color:#f43f5e;font-weight:700;background:rgba(244,63,94,.1);display:block;border-radius:3px}
    .suggest-box{background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.25);border-left:5px solid #10b981;padding:18px 22px;border-radius:10px}
    .suggest-box h3{color:#10b981;margin-bottom:10px;font-size:15px}
    .suggest-box ul{padding-left:20px}
    .suggest-box li{margin-bottom:6px}.autofix{color:#f43f5e;font-weight:700;list-style:"🔧 "}
    .stack-wrap{background:rgba(0,0,0,.45);padding:18px;border-radius:10px;max-height:280px;overflow-y:auto;font-size:12px;color:#64748b;border:1px solid rgba(255,255,255,.05)}
    details summary{cursor:pointer;color:#94a3b8;font-weight:700;outline:none;user-select:none;padding:8px 12px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:8px}
    details pre{padding:12px;font-size:12px;color:#94a3b8;background:rgba(0,0,0,.25);border-radius:6px;margin-top:6px}
    .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;margin-left:8px}
    .badge-err{background:#ef444430;color:#ef4444}.badge-ok{background:#10b98120;color:#10b981}
    .pill{display:inline-block;padding:3px 12px;border-radius:999px;font-size:11px;background:rgba(255,255,255,.07);margin:2px}
    h2{font-size:15px;font-weight:700;color:#cbd5e1;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  </style>
</head>
<body>
<div class="wrap">

  <div class="card">
    <div class="header">
      <div>
        <h1>${titleIcon} ${errorName} <span class="badge badge-err">${status}</span></h1>
        <div class="meta">${req.method} ${req.url} &nbsp;|&nbsp; ${new Date().toISOString()}</div>
      </div>
      <div class="btns">
        <a href="${googleUrl}" target="_blank" class="btn-g">🔍 Google</a>
        <a href="${soUrl}" target="_blank" class="btn-so">🥞 Stack Overflow</a>
      </div>
    </div>

    <div class="label">Error Message</div>
    <div class="msg-box">${message}</div>

    <div style="margin-top:16px;font-size:13px;opacity:.65">
      📄 ${path.basename(file)} &nbsp; Line <strong>${line}</strong>
    </div>
  </div>

  ${codeHtml ? `
  <div class="card">
    <h2>💻 Code Preview</h2>
    <div class="code-wrap"><pre>${codeHtml}</pre></div>
  </div>` : ""}

  <div class="card">
    <div class="suggest-box">
      <h3>💡 OmniFlow Intelligent Suggestions</h3>
      <ul>${autoFixHtml}${causesHtml}</ul>
    </div>
  </div>

  <div class="card">
    <h2>📋 Stack Trace</h2>
    <div class="stack-wrap"><pre>${stackHtml}</pre></div>
  </div>

  <div class="card">
    <h2>🌐 Request Snapshot</h2>
    <details>
      <summary>HTTP Headers (${Object.keys(req.headers).length})</summary>
      <pre>${JSON.stringify(req.headers, null, 2)}</pre>
    </details>
    <details>
      <summary>Query Parameters (${Object.keys(req.query).length})</summary>
      <pre>${JSON.stringify(req.query, null, 2)}</pre>
    </details>
    <details>
      <summary>Request Body (${Object.keys(req.body || {}).length})</summary>
      <pre>${JSON.stringify(req.body || {}, null, 2)}</pre>
    </details>
    <details>
      <summary>Environment</summary>
      <pre>NODE_ENV=${process.env.NODE_ENV || "N/A"}
APP_ENV=${process.env.APP_ENV || "N/A"}
DB_HOST=${process.env.DB_HOST || "N/A"}
DB_NAME=${process.env.DB_NAME || "N/A"}
PORT=${process.env.PORT || "N/A"}</pre>
    </details>
  </div>

</div>
</body>
</html>`;
  }
}
