import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OmniAiService } from './omni-ai.service';
import { OmniResponse } from '../response/omni-response';
import { Public } from '../decorators/public.decorator';

@ApiTags('AI & Intelligence')
@Controller('ai')
export class OmniAiController {
  constructor(private readonly aiService: OmniAiService) {}

  /**
   * POST /api/v1/ai/ask
   * Query Gemini AI with a prompt and optional context
   */
  @Post('ask')
  @Public()
  @ApiOperation({ summary: 'Ask Gemini AI a prompt or business question' })
  async ask(@Body() body: { prompt: string; systemPrompt?: string }) {
    if (!body.prompt || !body.prompt.trim()) {
      throw new BadRequestException('Prompt is required');
    }

    const text = await this.aiService.ask(
      body.prompt.trim(),
      body.systemPrompt,
      {},
      60, // cache 60s for duplicate questions
    );

    return OmniResponse.success({
      prompt: body.prompt,
      response: text,
    });
  }

  /**
   * POST /api/v1/ai/description
   * Automatically generate product description and SEO tags
   */
  @Post('description')
  @Public()
  @ApiOperation({ summary: 'Generate automated product description and SEO copy' })
  async generateDescription(
    @Body() body: { name: string; category?: string; keywords?: string[] },
  ) {
    if (!body.name) {
      throw new BadRequestException('Product name is required');
    }

    const prompt = `Write an engaging, SEO-optimized e-commerce product description for:
Product: "${body.name}"
Category: "${body.category || 'General'}"
Keywords: ${(body.keywords || []).join(', ') || 'quality, durable'}

Provide:
1. Catchy headline
2. 2-paragraph compelling description
3. 4 key bullet points
4. Suggested meta description (under 160 characters)`;

    const text = await this.aiService.ask(
      prompt,
      'You are an expert e-commerce copywriter and SEO strategist.',
      { temperature: 0.7 },
      300,
    );

    return OmniResponse.success({
      productName: body.name,
      generatedContent: text,
    });
  }

  /**
   * GET /api/v1/ai/status
   * Check Gemini AI engine configuration and availability
   */
  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Get Gemini AI engine status' })
  getStatus() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const configured = Boolean(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE');

    return OmniResponse.success({
      engine: 'Google Gemini',
      configured,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
      status: configured ? 'ONLINE' : 'NEEDS_API_KEY',
    });
  }
}
