import { FileValidator, Logger } from '@nestjs/common';

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
    const max = this.validationOptions.maxSize / 1024 / 1024;
    return `Размер файла не может привышать ${max}Мб`;
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
