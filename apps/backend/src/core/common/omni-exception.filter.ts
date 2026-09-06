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
import { OmniContextService } from "../context/omni-context.service";

/**
 * OmniFlow Intelligent Exception Filter
 * Catches all HTTP and unexpected errors.
 *
 * - JSON error for API / programmatic requests
 * - Beautiful HTML debug page in development (with code preview, suggestions, stack trace)
 * - Levenshtein variable typo detection
 * - SQL and connection error analysis
 */
@Catch()
export class OmniExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OmniExceptionFilter.name);

  constructor(private readonly contextService: OmniContextService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const traceId = this.contextService?.getTraceId?.() || "N/A";

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = "An unexpected error occurred.";
    let errorName = "InternalServerError";
    let stack = "";
    let extraErrors: Record<string, unknown> = {};

    if (isHttpException) {
      errorName = exception.name || "HttpException";
      const resp = exception.getResponse();
      if (typeof resp === "string") {
        message = resp;
      } else if (typeof resp === "object" && resp !== null) {
        const r = resp as Record<string, unknown>;
        message = (r.message as string) || JSON.stringify(resp);
        if (r.errors) extraErrors = r.errors as Record<string, unknown>;
      }
      stack = exception.stack || "";
    } else if (exception instanceof Error) {
      errorName = exception.name || "Error";
      message = exception.message;
      stack = exception.stack || "";
    }

    if (status >= 500) {
      this.logger.error(`[${req.method}] ${req.url} | ${status} | ${message}`, stack);
    }

    const isDev =
      process.env.NODE_ENV !== "production" &&
      process.env.APP_ENV !== "production";

    // API / JSON response
    const isApi =
      (req.headers["accept"] || "").includes("application/json") ||
      (req.headers["content-type"] || "").includes("application/json") ||
      req.path.startsWith("/api/") ||
      req.headers["x-requested-with"] === "XMLHttpRequest";

    if (isApi) {
      res.status(status).json({
        success: false,
        message,
        code: errorName,
        trace_id: traceId,
        ...(Object.keys(extraErrors).length > 0 ? { errors: extraErrors } : {}),
        ...(isDev && stack
          ? { stack: stack.split("\n").slice(0, 6) }
          : {}),
      });
      return;
    }

    // Development only: HTML debug page (never rendered in production)
    if (isDev) {
      const { file, line } = this._parseStack(stack);
      const codeCtx = this._getCodeContext(file, line);
      const { causes, autoFix } = this._analyzeSuggestions(message, file);
      res.status(status).type("html").send(
        this._buildHtml(status, errorName, message, file, line, stack, codeCtx, causes, autoFix, req, traceId),
      );
      return;
    }

    res.status(status).json({ success: false, message, trace_id: traceId });
  }

  // ── Helpers ──────────────────────────────────

  private _parseStack(stack: string): { file: string; line: number } {
    const m = stack.match(/at\s+.*?\((.*?):(\d+):\d+\)/) || stack.match(/at\s+(.*?):(\d+):\d+/);
    return m ? { file: m[1], line: parseInt(m[2]) } : { file: "unknown", line: 0 };
  }

  private _getCodeContext(filePath: string, errorLine: number, ctx = 5): string | null {
    try {
      if (!filePath || filePath === "unknown" || !fs.existsSync(filePath)) return null;
      const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
      const start = Math.max(0, errorLine - ctx - 1);
      const end = Math.min(lines.length, errorLine + ctx);
      return lines
        .slice(start, end)
        .map((l, i) => {
          const n = start + i + 1;
          return `${n === errorLine ? " >>> " : "     "}${n}: ${l}`;
        })
        .join("\n");
    } catch { return null; }
  }

  private _levenshtein(a: string, b: string): number {
    const m: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
      Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );
    for (let i = 1; i <= b.length; i++)
      for (let j = 1; j <= a.length; j++)
        m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1] : 1 + Math.min(m[i-1][j-1], m[i][j-1], m[i-1][j]);
    return m[b.length][a.length];
  }

  private _findSimilarVars(filePath: string, name: string): string[] {
    try {
      if (!filePath || !fs.existsSync(filePath)) return [];
      const vars = new Set<string>();
      for (const m of fs.readFileSync(filePath, "utf8").matchAll(/\b(?:const|let|var|this\.)(\w+)\b/g))
        vars.add(m[1]);
      return [...vars].filter((v) => { const d = this._levenshtein(name, v); return d > 0 && d <= 2; });
    } catch { return []; }
  }

  private _analyzeSuggestions(message: string, file: string): { causes: string[]; autoFix?: string } {
    const causes: string[] = [];
    let autoFix: string | undefined;

    if (message.includes("is not defined") || message.includes("Cannot read properties of undefined")) {
      const m = message.match(/['"]?(\w+)['"]?\s+is not defined/);
      if (m) {
        causes.push(`'${m[1]}' is not declared in this scope — check imports or typos.`);
        const sim = this._findSimilarVars(file, m[1]);
        if (sim.length) autoFix = `Did you mean: ${sim.join(", ")}?`;
      }
    }
    if (message.toLowerCase().includes("er_no_such_table") || message.toLowerCase().includes("unknown column")) {
      causes.push("Database table or column does not exist."); causes.push("Run migrations or check DB schema.");
    }
    if (message.includes("ECONNREFUSED")) {
      causes.push("Cannot connect to MySQL — is the server running?"); causes.push("Check DB_HOST / DB_PORT in .env.");
    }
    if (message.includes("Cannot find module")) {
      causes.push("Missing import or npm package."); causes.push("Run npm install and verify the path.");
    }
    if (message.toLowerCase().includes("validation")) {
      causes.push("Request payload did not pass validation rules.");
    }
    if (causes.length === 0) causes.push("Check the stack trace below for the exact error location.");

    return { causes, autoFix };
  }

  private _buildHtml(
    status: number, name: string, message: string, file: string, line: number,
    stack: string, code: string | null, causes: string[], autoFix: string | undefined,
    req: Request, traceId: string,
  ): string {
    const esc = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const borderColor = status >= 500 ? "#ef4444" : "#f59e0b";
    const icon = status >= 500 ? "🚨" : "⚠️";
    const gUrl = `https://www.google.com/search?q=${encodeURIComponent("NestJS TypeScript " + message)}`;
    const soUrl = `https://stackoverflow.com/search?q=${encodeURIComponent("NestJS " + message)}`;

    const codeHtml = code
      ? esc(code).replace(/(^|\n)(\s*&gt;&gt;&gt;.*)/gm, '$1<span class="el">$2</span>')
      : "<em style='opacity:.5'>Code context unavailable for this runtime file.</em>";

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>OmniFlow Debugger — ${name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f172a;color:#e2e8f0;font-family:'Fira Code',Consolas,monospace;padding:32px;font-size:14px;line-height:1.7}
  .w{max-width:1100px;margin:0 auto}
  .c{background:rgba(30,41,59,.9);border:2px solid ${borderColor};border-radius:14px;padding:26px;margin-bottom:20px;box-shadow:0 25px 50px rgba(0,0,0,.5)}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:18px;margin-bottom:20px}
  h1{font-size:22px;color:${borderColor};font-weight:700} .meta{font-size:12px;opacity:.55;margin-top:4px}
  a.btn{display:inline-block;padding:5px 14px;border-radius:8px;text-decoration:none;color:#fff;font-size:12px;font-weight:700;margin-left:6px}
  .bg{background:#4285F4}.so{background:#F48024}
  .lb{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px;font-weight:700}
  .mb{background:rgba(239,68,68,.08);border-left:5px solid ${borderColor};padding:14px 18px;border-radius:8px;font-size:15px;color:#fca5a5}
  .code{background:#0b0f19;padding:18px;border-radius:10px;border-left:6px solid ${borderColor};overflow-x:auto} pre{white-space:pre-wrap;word-break:break-all;font-size:13px}
  .el{color:#f43f5e;font-weight:700;background:rgba(244,63,94,.1);display:block;border-radius:3px}
  .sb{background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.25);border-left:5px solid #10b981;padding:18px 22px;border-radius:10px}
  .sb h3{color:#10b981;margin-bottom:10px;font-size:15px} .sb ul{padding-left:20px} .sb li{margin-bottom:5px}
  .af{color:#f43f5e;font-weight:700;list-style:"🔧 "}
  .st{background:rgba(0,0,0,.45);padding:16px;border-radius:10px;max-height:280px;overflow-y:auto;font-size:12px;color:#64748b;border:1px solid rgba(255,255,255,.05)}
  h2{font-size:15px;font-weight:700;color:#cbd5e1;margin-bottom:14px}
  details summary{cursor:pointer;color:#94a3b8;font-weight:700;outline:none;padding:8px 12px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:8px;user-select:none}
  details pre{padding:10px;font-size:12px;color:#94a3b8;background:rgba(0,0,0,.2);border-radius:6px;margin-top:6px}
  .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;margin-left:8px;background:rgba(239,68,68,.2);color:${borderColor}}
</style></head><body><div class="w">

<div class="c"><div class="hd">
  <div>
    <h1>${icon} ${name}<span class="badge">${status}</span></h1>
    <div class="meta">${req.method} ${req.url} &nbsp;|&nbsp; Trace: ${traceId} &nbsp;|&nbsp; ${new Date().toISOString()}</div>
  </div>
  <div><a href="${gUrl}" target="_blank" class="btn bg">🔍 Google</a><a href="${soUrl}" target="_blank" class="btn so">🥞 Stack Overflow</a></div>
</div>
<div class="lb">Error Message</div>
<div class="mb">${esc(message)}</div>
<div style="margin-top:14px;font-size:13px;opacity:.55">📄 ${path.basename(file)} &nbsp; Line <strong>${line}</strong></div>
</div>

${code ? `<div class="c"><h2>💻 Code Preview</h2><div class="code"><pre>${codeHtml}</pre></div></div>` : ""}

<div class="c"><div class="sb">
  <h3>💡 OmniFlow Intelligent Suggestions</h3>
  <ul>
    ${autoFix ? `<li class="af">${esc(autoFix)}</li>` : ""}
    ${causes.map((c) => `<li>${esc(c)}</li>`).join("")}
  </ul>
</div></div>

<div class="c"><h2>📋 Stack Trace</h2>
  <div class="st"><pre>${esc(stack)}</pre></div>
</div>

<div class="c"><h2>🌐 Request Snapshot</h2>
  <details><summary>Headers (${Object.keys(req.headers).length})</summary><pre>${esc(JSON.stringify(req.headers,null,2))}</pre></details>
  <details><summary>Query (${Object.keys(req.query).length})</summary><pre>${esc(JSON.stringify(req.query,null,2))}</pre></details>
  <details><summary>Body (${Object.keys(req.body||{}).length})</summary><pre>${esc(JSON.stringify(req.body||{},null,2))}</pre></details>
  <details><summary>Environment</summary><pre>NODE_ENV=${process.env.NODE_ENV||"N/A"}
APP_ENV=${process.env.APP_ENV||"N/A"}
DB_HOST=${process.env.DB_HOST||"N/A"}
DB_NAME=${process.env.DB_NAME||"N/A"}
PORT=${process.env.PORT||"N/A"}</pre></details>
</div>

</div></body></html>`;
  }
}
