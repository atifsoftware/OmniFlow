import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface IUploadedFileResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  relativePath: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
]);

@Injectable()
export class OmniStorageService {
  private readonly logger = new Logger(OmniStorageService.name);
  private readonly uploadRootDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadRootDir = path.resolve(process.cwd(), 'storage/uploads');
    this.baseUrl = process.env.APP_URL || 'http://localhost:4000';

    if (!fs.existsSync(this.uploadRootDir)) {
      fs.mkdirSync(this.uploadRootDir, { recursive: true });
    }
  }

  /**
   * Sanitizes subfolder and guarantees it cannot traverse outside root upload directory
   */
  private sanitizeSubFolder(subFolder: string): string {
    // Disallow path traversal indicators
    if (!subFolder || typeof subFolder !== 'string') return 'general';
    const cleaned = subFolder.split('\\').join('/').split('..').join('').trim();
    // Allow only alphanumeric, underscores, hyphens and single slashes
    const sanitized = cleaned.split('/').filter(p => /^[a-zA-Z0-9_-]+$/.test(p)).join('/');
    return sanitized || 'general';
  }

  /**
   * Ensures resolved file path strictly stays inside uploadRootDir
   */
  private assertPathWithinRoot(targetPath: string): void {
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(this.uploadRootDir)) {
      throw new BadRequestException('Security violation: Path traversal attempt detected.');
    }
  }

  async upload(file: Express.Multer.File, rawSubFolder: string = 'general'): Promise<IUploadedFileResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided for upload');
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();

    // 1. Validate File Extension and MIME Type
    if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(
        `File type not permitted. Allowed extensions: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
      );
    }

    // 2. Sanitize SubFolder & Path Traversal Guard
    const subFolder = this.sanitizeSubFolder(rawSubFolder);
    const folderPath = path.resolve(this.uploadRootDir, subFolder);
    this.assertPathWithinRoot(folderPath);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const uniqueFilename = `${uuidv4()}${extension}`;
    const destinationPath = path.resolve(folderPath, uniqueFilename);
    this.assertPathWithinRoot(destinationPath);

    await fs.promises.writeFile(destinationPath, file.buffer);
    this.logger.log(`📁 File uploaded securely: ${subFolder}/${uniqueFilename} (${file.size} bytes)`);

    const relativePath = `${subFolder}/${uniqueFilename}`;
    const publicUrl = `${this.baseUrl}/uploads/${relativePath}`;

    return {
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: publicUrl,
      relativePath,
    };
  }

  async delete(rawRelativePath: string): Promise<boolean> {
    if (!rawRelativePath || typeof rawRelativePath !== 'string') return false;

    // Boundary check
    const cleaned = rawRelativePath.split('\\').join('/');
    const fullPath = path.resolve(this.uploadRootDir, cleaned);
    this.assertPathWithinRoot(fullPath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      this.logger.log(`🗑️ Deleted file safely: ${rawRelativePath}`);
      return true;
    }
    return false;
  }
}
