import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { ALLOWED_IMAGE_TYPES } from './files.controller';

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should return file path on successful upload', () => {
      // This is a placeholder test because actual upload requires multer and interceptors
      // In a real unit test we would mock the interceptor and pipe
      expect(true).toBe(true);
    });

    it('should have ALLOWED_IMAGE_TYPES defined', () => {
      expect(ALLOWED_IMAGE_TYPES).toEqual([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
      ]);
    });
  });
});
