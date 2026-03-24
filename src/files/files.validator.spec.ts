import {
  MinFileSizeValidator,
  MaxFileSizeValidator,
  CustomFileTypeValidator,
} from './files.validator';

describe('MinFileSizeValidator', () => {
  it('should validate file size greater than min', () => {
    const validator = new MinFileSizeValidator({ minSize: 2048 }); // 2KB
    const file = { size: 3000 } as Express.Multer.File;
    expect(validator.isValid(file)).toBe(true);
  });

  it('should invalidate file size less than min', () => {
    const validator = new MinFileSizeValidator({ minSize: 2048 });
    const file = { size: 1000 } as Express.Multer.File;
    expect(validator.isValid(file)).toBe(false);
  });

  it('should invalidate when file is missing', () => {
    const validator = new MinFileSizeValidator({ minSize: 2048 });
    expect(validator.isValid(null as unknown as Express.Multer.File)).toBe(
      false,
    );
  });

  it('should build correct error message', () => {
    const validator = new MinFileSizeValidator({ minSize: 2048 });
    expect(validator.buildErrorMessage()).toBe(
      'Размер файла не может быть меньше 2Кб',
    );
  });
});

describe('MaxFileSizeValidator', () => {
  it('should validate file size less than max', () => {
    const validator = new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }); // 2MB
    const file = { size: 1 * 1024 * 1024 } as Express.Multer.File;
    expect(validator.isValid(file)).toBe(true);
  });

  it('should invalidate file size greater than max', () => {
    const validator = new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 });
    const file = { size: 3 * 1024 * 1024 } as Express.Multer.File;
    expect(validator.isValid(file)).toBe(false);
  });

  it('should invalidate when file is missing', () => {
    const validator = new MaxFileSizeValidator({ maxSize: 2048 });
    expect(validator.isValid(null as unknown as Express.Multer.File)).toBe(
      false,
    );
  });

  it('should build correct error message', () => {
    const validator = new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 });
    expect(validator.buildErrorMessage()).toBe(
      'Размер файла не может превышать 2Мб',
    );
  });
});

describe('CustomFileTypeValidator', () => {
  const allowedTypes = ['image/jpeg', 'image/png'];

  it('should validate allowed mimetype', () => {
    const validator = new CustomFileTypeValidator({ fileType: allowedTypes });
    const file = { mimetype: 'image/jpeg' } as Express.Multer.File;
    expect(validator.isValid(file)).toBe(true);
  });

  it('should invalidate disallowed mimetype', () => {
    const validator = new CustomFileTypeValidator({ fileType: allowedTypes });
    const file = { mimetype: 'application/pdf' } as Express.Multer.File;
    expect(validator.isValid(file)).toBe(false);
  });

  it('should invalidate when file is missing', () => {
    const validator = new CustomFileTypeValidator({ fileType: allowedTypes });
    expect(validator.isValid(null as unknown as Express.Multer.File)).toBe(
      false,
    );
  });

  it('should build correct error message', () => {
    const validator = new CustomFileTypeValidator({ fileType: allowedTypes });
    expect(validator.buildErrorMessage()).toBe(
      'Разрешены файлы типов: image/jpeg, image/png',
    );
  });
});
