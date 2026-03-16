import {
  BadRequestException,
  Controller,
  ParseFilePipe,
  PayloadTooLargeException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import {
  CustomFileTypeValidator,
  MaxFileSizeValidator,
  MinFileSizeValidator,
} from './files.validator';
import { FileCleanupInterceptor } from './files.cleanup.interceptor';
import { UPLOAD_ERROR } from './files.errors';
import { ApiUploadFile } from './files.swagger';

/* Полагаю, что это нужно вывести в общий конфиг */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
];

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileCleanupInterceptor)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public',
        filename(req, file, callback) {
          callback(null, `${uuidv4() + extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiUploadFile()
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new MinFileSizeValidator({ minSize: 2 * 1024 }),
          new CustomFileTypeValidator({ fileType: ALLOWED_IMAGE_TYPES }),
        ],
        exceptionFactory: (error) => {
          if (error.includes(UPLOAD_ERROR.TOO_BIG)) {
            return new PayloadTooLargeException();
          }
          return new BadRequestException();
        },
      }),
    )
    file: Express.Multer.File,
  ) {
    return `/public/${file.filename}`;
  }
}
