import { Injectable, Logger } from "@nestjs/common";
import * as https from "https";
import { OmniCacheService } from "../cache/omni-cache.service";

export interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

export interface AiMessage {
  role: "user" | "model";
  content: string;
}

/**
 * OmniFlow AI Service — Google Gemini Integration
 * Inspired by NodeFlow-React Gemini.js
 * Zero dependency — uses native Node.js HTTPS client.
 *
 * Features:
 *  - Single prompt → response
 *  - Multi-turn chat conversation
 *  - Response caching (avoid duplicate API calls)
 *  - Structured JSON output extraction
 *  - Retry on transient failure
 *  - Bengali / multilingual support
 *
 * Usage:
 *   const response = await aiService.ask("Write a product description for iPhone 15 Pro");
 *   const json = await aiService.structured({ name: "product" }, schema);
 *   const chat = aiService.chat("You are a helpful ERP assistant.");
 *   chat.say("How do I process a return?");
 */
@Injectable()
export class OmniAiService {
  private readonly logger = new Logger(OmniAiService.name);
  private readonly apiKey: string;
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

  constructor(private readonly cache: OmniCacheService) {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    if (!this.apiKey) {
      this.logger.warn("GEMINI_API_KEY is not set. OmniAiService will not function.");
    }
  }

  /**
   * Ask a single question and get a text response
   *
   * @param prompt       The user's question or instruction
   * @param systemPrompt Optional system context / persona
   * @param config       Optional Gemini model config
   */
  async ask(
    prompt: string,
    systemPrompt?: string,
    config: GeminiConfig = {},
    cacheSeconds?: number,
  ): Promise<string> {
    if (!this.apiKey) return "Error: GEMINI_API_KEY is not configured.";

    // Cache support
    if (cacheSeconds) {
      const cacheKey = "omni_ai_" + Buffer.from(prompt + (systemPrompt || "")).toString("base64").slice(0, 40);
      const cached = this.cache.get<string>(cacheKey);
      if (cached) return cached;

      const result = await this._request([{ role: "user", parts: [{ text: prompt }] }], systemPrompt, config);
      this.cache.set(cacheKey, result, cacheSeconds);
      return result;
    }

    return this._request([{ role: "user", parts: [{ text: prompt }] }], systemPrompt, config);
  }

  /**
   * Ask for a structured JSON response with schema instructions
   */
  async structured<T = Record<string, unknown>>(
    input: Record<string, unknown>,
    schema: string,
    systemPrompt?: string,
  ): Promise<T | null> {
    const prompt = `You are a JSON generator. Return ONLY valid JSON, no markdown, no explanation.\n\nSchema: ${schema}\n\nInput: ${JSON.stringify(input, null, 2)}`;
    const raw = await this.ask(prompt, systemPrompt || "Return only valid JSON.");
    try {
      const clean = raw.replace(/```json\n?|```\n?/g, "").trim();
      return JSON.parse(clean) as T;
    } catch {
      this.logger.error("Failed to parse AI JSON response", raw);
      return null;
    }
  }

  /**
   * Translate text to another language
   */
  async translate(text: string, targetLanguage: string): Promise<string> {
    return this.ask(
      `Translate the following text to ${targetLanguage}. Return only the translated text:\n\n${text}`,
    );
  }

  /**
   * Summarize long text into a short summary
   */
  async summarize(text: string, maxSentences = 3): Promise<string> {
    return this.ask(`Summarize the following text in ${maxSentences} sentences or less:\n\n${text}`);
  }

  /**
   * Generate a product description from product details
   */
  async generateProductDescription(
    productName: string,
    features: string[],
    targetAudience = "general consumers",
    language = "English",
  ): Promise<string> {
    const prompt = `Write a compelling product description for an e-commerce website in ${language}.

Product: ${productName}
Key Features: ${features.join(", ")}
Target Audience: ${targetAudience}

Make it engaging, SEO-friendly, and under 150 words.`;

    return this.ask(prompt);
  }

  /**
   * Analyze customer sentiment from a review text
   */
  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; summary: string } | null> {
    return this.structured<{ sentiment: string; score: number; summary: string }>(
      { text },
      '{ "sentiment": "positive|negative|neutral", "score": 0.0-1.0, "summary": "one sentence" }',
    );
  }

  /**
   * Generate SQL query from natural language
   */
  async naturalLanguageToSql(question: string, tableSchema: string): Promise<string> {
    const prompt = `Given this database schema:\n${tableSchema}\n\nWrite a MySQL SELECT query for: "${question}"\n\nReturn ONLY the SQL query, no explanation.`;
    return this.ask(prompt);
  }

  /**
   * Create a multi-turn chat session
   */
  chat(systemPrompt?: string, config: GeminiConfig = {}): OmniAiChat {
    return new OmniAiChat(this, systemPrompt, config);
  }

  // ──────────────────────────────────────────────
  //  INTERNAL HTTP REQUEST
  // ──────────────────────────────────────────────

  async _request(
    contents: Array<{ role: string; parts: Array<{ text: string }> }>,
    systemInstruction?: string,
    config: GeminiConfig = {},
    retries = 2,
  ): Promise<string> {
    const model = config.model || process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
    const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;

    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: config.temperature ?? 0.7,
        topK: config.topK ?? 40,
        topP: config.topP ?? 0.95,
        maxOutputTokens: config.maxOutputTokens ?? 2048,
      },
    };

    if (systemInstruction) {
      payload.system_instruction = { parts: [{ text: systemInstruction }] };
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this._httpsPost(url, payload);
        return result;
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    return "Error: Unexpected AI service failure.";
  }

  private _httpsPost(url: string, payload: Record<string, unknown>): Promise<string> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(payload);
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      };

      const req = https.request(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              const errMsg = (parsed.error?.message as string) || `API Error ${res.statusCode}`;
              return resolve(`Error: ${errMsg}`);
            }
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            resolve(text || "Error: Empty response from Gemini.");
          } catch (e) {
            reject(new Error("Failed to parse Gemini response: " + (e as Error).message));
          }
        });
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }
}

// ──────────────────────────────────────────────
//  MULTI-TURN CHAT SESSION
// ──────────────────────────────────────────────

export class OmniAiChat {
  private history: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  constructor(
    private readonly ai: OmniAiService,
    private readonly systemPrompt?: string,
    private readonly config: GeminiConfig = {},
  ) {}

  /**
   * Send a message in the conversation
   */
  async say(message: string): Promise<string> {
    this.history.push({ role: "user", parts: [{ text: message }] });

    const response = await this.ai._request(this.history, this.systemPrompt, this.config);

    this.history.push({ role: "model", parts: [{ text: response }] });
    return response;
  }

  /**
   * Get full conversation history
   */
  getHistory(): AiMessage[] {
    return this.history.map((h) => ({
      role: h.role as "user" | "model",
      content: h.parts[0]?.text || "",
    }));
  }

  /**
   * Clear conversation history
   */
  reset(): void {
    this.history = [];
  }
}
