import { Injectable, OnModuleInit, Logger, UnauthorizedException } from "@nestjs/common";
import * as crypto from "crypto";
import { OmniDbService } from "../database/omni-db.service";

const TOKEN_TABLE = "personal_access_tokens";
const TOKEN_PREFIX = "omni_pat_";

export interface TokenRecord {
  id: number;
  tokenable_type: string;
  tokenable_id: number;
  name: string;
  token: string;
  abilities: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface CreatedToken {
  plainTextToken: string;
  tokenRecord: TokenRecord;
}

/**
 * OmniFlow Personal Access Token Service
 * Laravel Sanctum-inspired API Key Authentication system.
 * Stores SHA-256 hashed tokens — plain tokens are never persisted.
 *
 * Usage:
 *   // Create
 *   const { plainTextToken } = await tokenService.createToken(user, "Mobile App", ["read:orders"]);
 *
 *   // Authenticate (in guard)
 *   const user = await tokenService.authenticateToken("omni_pat_xxxxx");
 *
 *   // Revoke
 *   await tokenService.revokeToken(userId, tokenId);
 */
@Injectable()
export class OmniTokenService implements OnModuleInit {
  private readonly logger = new Logger(OmniTokenService.name);

  constructor(private readonly db: OmniDbService) {}

  async onModuleInit() {
    await this._ensureTable();
  }

  private async _ensureTable(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS \`${TOKEN_TABLE}\` (
        \`id\`             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`tokenable_type\` VARCHAR(100) NOT NULL DEFAULT 'User',
        \`tokenable_id\`   BIGINT UNSIGNED NOT NULL,
        \`name\`           VARCHAR(255) NOT NULL,
        \`token\`          VARCHAR(64) NOT NULL UNIQUE,
        \`abilities\`      TEXT NOT NULL DEFAULT '["*"]',
        \`last_used_at\`   TIMESTAMP NULL DEFAULT NULL,
        \`expires_at\`     TIMESTAMP NULL DEFAULT NULL,
        \`created_at\`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (\`token\`),
        INDEX idx_user (\`tokenable_id\`, \`tokenable_type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    this.logger.log("Personal Access Tokens table ready.");
  }

  private _ts(date = new Date()): string {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  private _hashToken(plainToken: string): string {
    return crypto.createHash("sha256").update(plainToken).digest("hex");
  }

  /**
   * Generate and store a new personal access token for a user
   */
  async createToken(
    userId: number,
    name: string,
    abilities: string[] = ["*"],
    expiresInDays?: number,
  ): Promise<CreatedToken> {
    const plainToken = TOKEN_PREFIX + crypto.randomBytes(30).toString("hex");
    const hashedToken = this._hashToken(plainToken);

    const expiresAt = expiresInDays
      ? this._ts(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
      : null;

    const insertId = await this.db.table(TOKEN_TABLE).insert({
      tokenable_type: "User",
      tokenable_id: userId,
      name,
      token: hashedToken,
      abilities: JSON.stringify(abilities),
      expires_at: expiresAt,
      created_at: this._ts(),
    });

    const record = await this.db.table(TOKEN_TABLE).where("id", insertId).first<TokenRecord>();
    this.logger.log(`Token created for user #${userId}: "${name}"`);

    return { plainTextToken: plainToken, tokenRecord: record! };
  }

  /**
   * Authenticate a plain-text token — returns the user record if valid
   */
  async authenticateToken(plainToken: string): Promise<{ userId: number; abilities: string[]; tokenId: number }> {
    if (!plainToken.startsWith(TOKEN_PREFIX)) {
      throw new UnauthorizedException("Invalid token format.");
    }

    const hashed = this._hashToken(plainToken);
    const record = await this.db.table(TOKEN_TABLE).where("token", hashed).first<TokenRecord>();

    if (!record) {
      throw new UnauthorizedException("Token is invalid or revoked.");
    }

    // Check expiry
    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      await this.db.table(TOKEN_TABLE).where("id", record.id).delete();
      throw new UnauthorizedException("Token has expired.");
    }

    // Update last_used_at in background (non-blocking)
    this.db.table(TOKEN_TABLE)
      .where("id", record.id)
      .update({ last_used_at: this._ts() })
      .catch((err) => this.logger.error("Failed to update last_used_at", err));

    let abilities: string[] = ["*"];
    try {
      abilities = JSON.parse(record.abilities);
    } catch { /* keep default */ }

    return { userId: record.tokenable_id, abilities, tokenId: record.id };
  }

  /**
   * Check if a token has a specific ability/scope
   */
  can(abilities: string[], ability: string): boolean {
    return abilities.includes("*") || abilities.includes(ability);
  }

  /**
   * Get all tokens for a user
   */
  async getUserTokens(userId: number): Promise<TokenRecord[]> {
    return this.db.table(TOKEN_TABLE)
      .where("tokenable_id", userId)
      .orderByDesc("created_at")
      .get<TokenRecord>();
  }

  /**
   * Revoke a token by ID (must belong to the user)
   */
  async revokeToken(userId: number, tokenId: number): Promise<boolean> {
    const affected = await this.db.table(TOKEN_TABLE)
      .where("id", tokenId)
      .where("tokenable_id", userId)
      .delete();
    return affected > 0;
  }

  /**
   * Revoke ALL tokens for a user (e.g. on password change)
   */
  async revokeAllTokens(userId: number): Promise<number> {
    return this.db.table(TOKEN_TABLE).where("tokenable_id", userId).delete();
  }

  /**
   * Purge all expired tokens (run as a scheduled job)
   */
  async pruneExpired(): Promise<number> {
    return this.db.table(TOKEN_TABLE).whereRaw("expires_at IS NOT NULL AND expires_at < NOW()").delete();
  }

  /**
   * Get token stats for a user
   */
  async tokenStats(userId: number): Promise<Record<string, unknown>> {
    const tokens = await this.getUserTokens(userId);
    const now = new Date();
    return {
      total: tokens.length,
      active: tokens.filter((t) => !t.expires_at || new Date(t.expires_at) > now).length,
      expired: tokens.filter((t) => t.expires_at && new Date(t.expires_at) <= now).length,
    };
  }
}
