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

  async upload(file: Express.Multer.File, subFolder: string = 'general'): Promise<IUploadedFileResult> {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }

    const folderPath = path.join(this.uploadRootDir, subFolder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${uuidv4()}${extension}`;
    const destinationPath = path.join(folderPath, uniqueFilename);

    await fs.promises.writeFile(destinationPath, file.buffer);
    this.logger.log(`📁 File uploaded successfully: ${uniqueFilename} (${file.size} bytes)`);

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

  async delete(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadRootDir, relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      this.logger.log(`🗑️ Deleted file: ${relativePath}`);
      return true;
    }
    return false;
  }
}
