import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OmniStorageService } from './omni-storage.service';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Storage & Media')
@Controller('storage')
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: OmniStorageService) {}

  @Post('upload')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Upload single file / image to OmniStorage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string = 'media',
  ) {
    return this.storageService.upload(file, folder);
  }

  @Post('upload-multiple')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Upload multiple files (up to 5)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 5, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder: string = 'media',
  ) {
    const results = await Promise.all(
      files.map((file) => this.storageService.upload(file, folder)),
    );
    return results;
  }
}
