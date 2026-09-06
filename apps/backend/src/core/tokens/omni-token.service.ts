import { Injectable, OnModuleInit, Logger, UnauthorizedException } from "@nestjs/common";
import * as crypto from "crypto";
import { OmniDbService } from "../database/omni-db.service";

const TOKEN_TABLE = "personal_access_tokens";
const TOKEN_PREFIX = "omni_pat_";

export interface TokenRecord {
  id: number;
  tokenable_type: string;
  tokenable_id: string;
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
 * Supports UUID user IDs (VARCHAR(36)).
 */
@Injectable()
export class OmniTokenService implements OnModuleInit {
  private readonly logger = new Logger(OmniTokenService.name);

  constructor(private readonly db: OmniDbService) {}

  async onModuleInit() {
    await this._ensureTable();
  }

  private async _ensureTable(): Promise<void> {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS \`${TOKEN_TABLE}\` (
          \`id\`             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`tokenable_type\` VARCHAR(100) NOT NULL DEFAULT 'User',
          \`tokenable_id\`   VARCHAR(36) NOT NULL,
          \`name\`           VARCHAR(255) NOT NULL,
          \`token\`          VARCHAR(64) NOT NULL UNIQUE,
          \`abilities\`      TEXT NOT NULL,
          \`last_used_at\`   TIMESTAMP NULL DEFAULT NULL,
          \`expires_at\`     TIMESTAMP NULL DEFAULT NULL,
          \`created_at\`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_token (\`token\`),
          INDEX idx_user (\`tokenable_id\`, \`tokenable_type\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Modify column if previously created with BIGINT
      try {
        await this.db.query(`
          ALTER TABLE \`${TOKEN_TABLE}\` MODIFY COLUMN \`tokenable_id\` VARCHAR(36) NOT NULL
        `);
      } catch {
        // Table already has correct column type or other non-fatal error
      }

      this.logger.log("Personal Access Tokens table ready (UUID support enabled).");
    } catch (err: any) {
      this.logger.error("Failed to initialize Personal Access Tokens table", err);
    }
  }

  private _ts(date = new Date()): string {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  private _hashToken(plainToken: string): string {
    return crypto.createHash("sha256").update(plainToken).digest("hex");
  }

  /**
   * Generate and store a new personal access token for a user (UUID string or number)
   */
  async createToken(
    userId: string | number,
    name: string,
    abilities: string[] = ["*"],
    expiresInDays?: number,
  ): Promise<CreatedToken> {
    const idStr = String(userId);
    const plainToken = TOKEN_PREFIX + crypto.randomBytes(30).toString("hex");
    const hashedToken = this._hashToken(plainToken);

    const expiresAt = expiresInDays
      ? this._ts(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
      : null;

    const insertId = await this.db.table(TOKEN_TABLE).insert({
      tokenable_type: "User",
      tokenable_id: idStr,
      name,
      token: hashedToken,
      abilities: JSON.stringify(abilities),
      expires_at: expiresAt,
      created_at: this._ts(),
    });

    const record = await this.db.table(TOKEN_TABLE).where("id", insertId).first<TokenRecord>();
    this.logger.log(`Token created for user ${idStr}: "${name}"`);

    return { plainTextToken: plainToken, tokenRecord: record! };
  }

  /**
   * Authenticate a plain-text token — returns user ID and abilities if valid
   */
  async authenticateToken(plainToken: string): Promise<{ userId: string; abilities: string[]; tokenId: number }> {
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

    return { userId: String(record.tokenable_id), abilities, tokenId: record.id };
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
  async getUserTokens(userId: string | number): Promise<TokenRecord[]> {
    return this.db.table(TOKEN_TABLE)
      .where("tokenable_id", String(userId))
      .orderByDesc("created_at")
      .get<TokenRecord>();
  }

  /**
   * Revoke a token by ID (must belong to the user)
   */
  async revokeToken(userId: string | number, tokenId: number): Promise<boolean> {
    const affected = await this.db.table(TOKEN_TABLE)
      .where("id", tokenId)
      .where("tokenable_id", String(userId))
      .delete();
    return affected > 0;
  }

  /**
   * Revoke ALL tokens for a user (e.g. on password change)
   */
  async revokeAllTokens(userId: string | number): Promise<number> {
    return this.db.table(TOKEN_TABLE).where("tokenable_id", String(userId)).delete();
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
  async tokenStats(userId: string | number): Promise<Record<string, unknown>> {
    const tokens = await this.getUserTokens(userId);
    const now = new Date();
    return {
      total: tokens.length,
      active: tokens.filter((t) => !t.expires_at || new Date(t.expires_at) > now).length,
      expired: tokens.filter((t) => t.expires_at && new Date(t.expires_at) <= now).length,
    };
  }
}
