import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

/**
 * OmniFlow Image Processor Service
 * Inspired by NodeFlow-React ImageProcessor.js
 * Handles image upload, resize, crop, thumbnail generation,
 * and WebP conversion using the `sharp` library.
 *
 * Usage:
 *   const url = await this.imageService.upload(file, "products");
 *   const url = await this.imageService.from(buffer).cropCenter(800, 600).toWebP("products");
 */
@Injectable()
export class OmniImageService {
  private readonly logger = new Logger(OmniImageService.name);

  /**
   * Start a fluent image processing chain from a file object (Multer) or Buffer
   */
  from(fileOrBuffer: Express.Multer.File | Buffer): OmniImageProcessor {
    const buffer = Buffer.isBuffer(fileOrBuffer)
      ? fileOrBuffer
      : fileOrBuffer.buffer;
    return new OmniImageProcessor(buffer);
  }

  /**
   * Simple static upload helper — upload + optional resize → WebP
   *
   * @param file   Multer file object
   * @param folder Subfolder inside public/uploads/
   * @param width  Resize width (optional)
   * @param height Resize height (optional)
   * @param quality WebP quality (1-100, default 82)
   */
  async upload(
    file: Express.Multer.File,
    folder = "general",
    width?: number,
    height?: number,
    quality = 82,
  ): Promise<string> {
    const processor = this.from(file);
    if (width && height) {
      processor.cropCenter(width, height);
    } else if (width || height) {
      processor.resize(width ?? undefined, height ?? undefined);
    }
    return processor.quality(quality).toWebP(folder);
  }

  /**
   * Upload multiple files at once
   */
  async uploadMany(
    files: Express.Multer.File[],
    folder = "general",
    width?: number,
    height?: number,
  ): Promise<string[]> {
    const uploads = files.map((f) => this.upload(f, folder, width, height));
    return Promise.all(uploads);
  }

  /**
   * Delete an uploaded file by its relative path
   */
  async delete(relativePath: string): Promise<boolean> {
    const fullPath = path.join(process.cwd(), "public", relativePath);
    if (!fs.existsSync(fullPath)) return false;
    fs.unlinkSync(fullPath);
    return true;
  }

  /**
   * Get full disk path from a relative uploads path
   */
  diskPath(relativePath: string): string {
    return path.join(process.cwd(), "public", relativePath);
  }

  /**
   * Get public URL for an uploaded file
   */
  url(relativePath: string): string {
    const base = process.env.APP_URL || "http://localhost:" + (process.env.PORT || "4000");
    return base.replace(/\/$/, "") + "/" + relativePath.replace(/^\/+/, "");
  }
}

// ──────────────────────────────────────────────
//  OmniImageProcessor — Fluent Chainable API
// ──────────────────────────────────────────────

export class OmniImageProcessor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _sharp: any;
  private _quality = 82;

  constructor(buffer: Buffer) {
    // Dynamic import of sharp to avoid issues if it's not installed
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require("sharp");
      this._sharp = sharp(buffer);
    } catch {
      throw new Error(
        "OmniImageService requires `sharp` package. Run: npm install sharp",
      );
    }
  }

  /**
   * Resize image while maintaining aspect ratio
   */
  resize(width?: number, height?: number): this {
    this._sharp = this._sharp.resize({
      width,
      height,
      fit: "inside",
      withoutEnlargement: true,
    });
    return this;
  }

  /**
   * Crop image from center to exact dimensions (for thumbnails, avatars)
   */
  cropCenter(width: number, height: number): this {
    this._sharp = this._sharp.resize({
      width,
      height,
      fit: "cover",
      position: "center",
    });
    return this;
  }

  /**
   * Smart crop using entropy/attention detection
   */
  smartCrop(width: number, height: number): this {
    this._sharp = this._sharp.resize({
      width,
      height,
      fit: "cover",
      position: "attention",
    });
    return this;
  }

  /**
   * Add a blurred background behind the image (for non-cropping resize)
   */
  fitContain(width: number, height: number, background = { r: 255, g: 255, b: 255, alpha: 1 }): this {
    this._sharp = this._sharp.resize({
      width,
      height,
      fit: "contain",
      background,
    });
    return this;
  }

  /**
   * Rotate the image by degrees
   */
  rotate(degrees: number): this {
    this._sharp = this._sharp.rotate(degrees);
    return this;
  }

  /**
   * Flip horizontally
   */
  flip(): this {
    this._sharp = this._sharp.flop();
    return this;
  }

  /**
   * Convert to grayscale
   */
  grayscale(): this {
    this._sharp = this._sharp.grayscale();
    return this;
  }

  /**
   * Blur the image
   */
  blur(sigma = 3): this {
    this._sharp = this._sharp.blur(sigma);
    return this;
  }

  /**
   * Sharpen the image
   */
  sharpen(): this {
    this._sharp = this._sharp.sharpen();
    return this;
  }

  /**
   * Set WebP output quality
   */
  quality(q: number): this {
    this._quality = Math.min(100, Math.max(1, q));
    return this;
  }

  /**
   * Save as WebP and return the relative URL path (ready for DB storage)
   *
   * @param folder  Subfolder inside /public/uploads/
   * @param filename Custom filename (auto-generated if omitted)
   */
  async toWebP(folder = "general", filename?: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const name = filename
      ? filename.replace(/\.[^/.]+$/, "") + ".webp"
      : `${folder}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.webp`;

    const fullPath = path.join(uploadsDir, name);
    const relativePath = `uploads/${folder}/${name}`;

    await this._sharp.webp({ quality: this._quality }).toFile(fullPath);

    return relativePath;
  }

  /**
   * Save as JPEG
   */
  async toJpeg(folder = "general", filename?: string, jpegQuality = 90): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const name = filename
      ? filename.replace(/\.[^/.]+$/, "") + ".jpg"
      : `${folder}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.jpg`;

    const fullPath = path.join(uploadsDir, name);
    await this._sharp.jpeg({ quality: jpegQuality, progressive: true }).toFile(fullPath);
    return `uploads/${folder}/${name}`;
  }

  /**
   * Save as PNG
   */
  async toPng(folder = "general", filename?: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const name = filename
      ? filename.replace(/\.[^/.]+$/, "") + ".png"
      : `${folder}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.png`;

    const fullPath = path.join(uploadsDir, name);
    await this._sharp.png({ compressionLevel: 7 }).toFile(fullPath);
    return `uploads/${folder}/${name}`;
  }

  /**
   * Get image metadata (width, height, format, size)
   */
  async metadata(): Promise<Record<string, unknown>> {
    return this._sharp.metadata();
  }

  /**
   * Get raw buffer output
   */
  async toBuffer(): Promise<Buffer> {
    return this._sharp.webp({ quality: this._quality }).toBuffer();
  }
}
