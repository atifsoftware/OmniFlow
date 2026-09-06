import {
  Controller, Post, Delete, Get, Param, Body, Req, ParseIntPipe, UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { OmniTokenService } from "./omni-token.service";
import { OmniResponse } from "../response/omni-response";

@ApiTags("Personal Access Tokens")
@ApiBearerAuth()
@Controller("auth/tokens")
export class TokenController {
  constructor(private readonly tokenService: OmniTokenService) {}

  /**
   * Create a new personal access token for the authenticated user
   * POST /api/auth/tokens
   */
  @Post()
  @ApiOperation({ summary: "Create a new API token" })
  async createToken(
    @Body() body: { name: string; abilities?: string[]; expires_in_days?: number },
    @Req() req: Record<string, unknown>,
  ) {
    const user = req.user as Record<string, unknown>;
    const userId = String(user.id);
    const result = await this.tokenService.createToken(
      userId,
      body.name,
      body.abilities,
      body.expires_in_days,
    );

    return OmniResponse.created(
      {
        token: result.plainTextToken,
        name: result.tokenRecord.name,
        abilities: JSON.parse(result.tokenRecord.abilities),
        expires_at: result.tokenRecord.expires_at,
        created_at: result.tokenRecord.created_at,
      },
      "API token created. Copy it now — it will not be shown again.",
    );
  }

  /**
   * List all tokens for the authenticated user
   * GET /api/auth/tokens
   */
  @Get()
  @ApiOperation({ summary: "List all API tokens" })
  async listTokens(@Req() req: Record<string, unknown>) {
    const user = req.user as Record<string, unknown>;
    const tokens = await this.tokenService.getUserTokens(String(user.id));

    const masked = tokens.map((t) => ({
      id: t.id,
      name: t.name,
      abilities: JSON.parse(t.abilities),
      last_used_at: t.last_used_at,
      expires_at: t.expires_at,
      created_at: t.created_at,
    }));

    return OmniResponse.success(masked);
  }

  /**
   * Revoke a token by ID
   * DELETE /api/auth/tokens/:id
   */
  @Delete(":id")
  @ApiOperation({ summary: "Revoke a specific API token" })
  async revokeToken(
    @Param("id", ParseIntPipe) tokenId: number,
    @Req() req: Record<string, unknown>,
  ) {
    const user = req.user as Record<string, unknown>;
    const success = await this.tokenService.revokeToken(String(user.id), tokenId);
    if (!success) return OmniResponse.notFound("Token");
    return OmniResponse.noContent("Token revoked successfully.");
  }

  /**
   * Revoke all tokens for the authenticated user
   * DELETE /api/auth/tokens
   */
  @Delete()
  @ApiOperation({ summary: "Revoke ALL API tokens (logout everywhere)" })
  async revokeAll(@Req() req: Record<string, unknown>) {
    const user = req.user as Record<string, unknown>;
    const count = await this.tokenService.revokeAllTokens(String(user.id));
    return OmniResponse.noContent(`${count} token(s) revoked.`);
  }
}
