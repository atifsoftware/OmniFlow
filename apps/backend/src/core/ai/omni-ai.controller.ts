import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OmniAiService } from './omni-ai.service';
import { Public } from '../decorators/public.decorator';

export class AskAiDto {
  prompt!: string;
  systemPrompt?: string;
  cacheSeconds?: number;
}

export class GenerateDescriptionDto {
  productName!: string;
  category?: string;
  features?: string[];
}

@ApiTags('AI & Gemini Intelligence')
@Controller('ai')
export class OmniAiController {
  constructor(private readonly aiService: OmniAiService) {}

  @Public()
  @Post('ask')
  @ApiOperation({ summary: 'Send prompt to Google Gemini AI and get generated response' })
  async ask(@Body() dto: AskAiDto) {
    const text = await this.aiService.ask(dto.prompt, dto.systemPrompt, {}, dto.cacheSeconds || 300);
    return {
      prompt: dto.prompt,
      text,
    };
  }

  @Public()
  @Post('description')
  @ApiOperation({ summary: 'Generate intelligent product description for E-Commerce' })
  async generateProductDescription(@Body() dto: GenerateDescriptionDto) {
    const systemPrompt =
      'You are an expert enterprise e-commerce copywriter. Write a persuasive, SEO-optimized product description.';
    const prompt = `Write a high-converting product description for:
Product Name: ${dto.productName}
Category: ${dto.category || 'General'}
Key Features: ${dto.features?.join(', ') || 'N/A'}

Provide:
1. Hook & Overview
2. Bullet Points of Key Features
3. Why Buy This Product`;

    const description = await this.aiService.ask(prompt, systemPrompt, {}, 600);
    return {
      productName: dto.productName,
      description,
    };
  }

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Check Gemini AI connection status' })
  getStatus() {
    const isConfigured = Boolean(process.env.GEMINI_API_KEY);
    return {
      engine: 'Google Gemini AI (Native HTTPS)',
      configured: isConfigured,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
      status: isConfigured ? 'READY' : 'API_KEY_MISSING',
    };
  }
}
