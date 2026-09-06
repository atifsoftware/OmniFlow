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

@Injectable()
export class OmniStorageService {
  private readonly logger = new Logger(OmniStorageService.name);
  private readonly uploadRootDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadRootDir = path.join(process.cwd(), 'storage/uploads');
    this.baseUrl = process.env.APP_URL || 'http://localhost:4000';

    if (!fs.existsSync(this.uploadRootDir)) {
      fs.mkdirSync(this.uploadRootDir, { recursive: true });
    }
  }

  private readonly ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/csv',
  ]);

  private readonly ALLOWED_EXTENSIONS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.pdf',
    '.csv',
  ]);

  async upload(file: Express.Multer.File, subFolder: string = 'general'): Promise<IUploadedFileResult> {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }

    // 1. Validate file extension and MIME type
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = (file.mimetype || '').toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.has(extension) || !this.ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(
        `File type "${extension}" (${mimeType}) is not allowed. Supported formats: ${Array.from(this.ALLOWED_EXTENSIONS).join(', ')}`,
      );
    }

    // 2. Prevent directory traversal in subFolder
    if (subFolder.includes('..')) {
      throw new BadRequestException('Directory traversal sequences ("..") are strictly prohibited');
    }

    const cleanSubFolder = path.normalize(subFolder).replace(/^[/\\]+/, '');
    const folderPath = path.resolve(this.uploadRootDir, cleanSubFolder);
    if (!folderPath.startsWith(this.uploadRootDir)) {
      throw new BadRequestException('Invalid upload directory path');
    }

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const uniqueFilename = `${uuidv4()}${extension}`;
    const destinationPath = path.join(folderPath, uniqueFilename);

    await fs.promises.writeFile(destinationPath, file.buffer);
    this.logger.log(`📁 File uploaded successfully: ${uniqueFilename} (${file.size} bytes)`);

    const relativePath = cleanSubFolder ? `${cleanSubFolder}/${uniqueFilename}` : uniqueFilename;
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

  async delete(relativePath: string): Promise<boolean> {
    if (relativePath.includes('..')) {
      throw new BadRequestException('Directory traversal sequences ("..") are strictly prohibited');
    }

    const cleanRelative = path.normalize(relativePath).replace(/^[/\\]+/, '');
    const fullPath = path.resolve(this.uploadRootDir, cleanRelative);

    // Ensure target path is strictly within the upload root directory
    if (!fullPath.startsWith(this.uploadRootDir)) {
      throw new BadRequestException('Invalid file path for deletion');
    }

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      this.logger.log(`🗑️ Deleted file: ${cleanRelative}`);
      return true;
    }
    return false;
  }
}
