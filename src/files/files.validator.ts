import { FileValidator, Logger } from '@nestjs/common';
import { UPLOAD_ERROR } from './files.errors';

export class MinFileSizeValidator extends FileValidator<{ minSize: number }> {
  isValid(file: Express.Multer.File): boolean {
    if (!file) return false;
    return file.size > this.validationOptions.minSize;
  }

  buildErrorMessage(): string {
    const kb = this.validationOptions.minSize / 1024;
    return `Размер файла не может быть меньше ${kb}Кб`;
  }
}

export class MaxFileSizeValidator extends FileValidator<{ maxSize: number }> {
  isValid(file: Express.Multer.File): boolean {
    if (!file) return false;
    return file.size < this.validationOptions.maxSize;
  }

  buildErrorMessage(): string {
    return UPLOAD_ERROR.TOO_BIG;
  }
}

export class CustomFileTypeValidator extends FileValidator<{
  fileType: string[];
}> {
  isValid(file: Express.Multer.File): boolean {
    if (!file) return false;
    return this.validationOptions.fileType.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `Разрешены файлы типов: ${this.validationOptions.fileType.join(', ')}`;
  }
}
