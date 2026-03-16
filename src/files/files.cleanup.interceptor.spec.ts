import { Test, TestingModule } from '@nestjs/testing';
import { FileCleanupInterceptor } from './files.cleanup.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { throwError, of } from 'rxjs';

// Mock fs module
jest.mock('fs', () => {
  const mockExistsSync = jest.fn();
  const mockUnlinkSync = jest.fn();
  return {
    existsSync: mockExistsSync,
    unlinkSync: mockUnlinkSync,
    __mockExistsSync: mockExistsSync,
    __mockUnlinkSync: mockUnlinkSync,
  };
});

import * as fs from 'fs';

const mockExistsSync = (fs as any).__mockExistsSync as jest.Mock;
const mockUnlinkSync = (fs as any).__mockUnlinkSync as jest.Mock;

describe('FileCleanupInterceptor', () => {
  let interceptor: FileCleanupInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileCleanupInterceptor],
    }).compile();

    interceptor = module.get<FileCleanupInterceptor>(FileCleanupInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    let mockExecutionContext: ExecutionContext;
    let mockCallHandler: { handle: jest.Mock };
    const mockFile = { path: '/tmp/testfile.jpg' };

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            file: mockFile,
          }),
        }),
      } as unknown as ExecutionContext;

      mockCallHandler = {
        handle: jest.fn(),
      };
    });

    it('should delete file on error', (done) => {
      const error = new Error('Test error');
      mockExistsSync.mockReturnValue(true);
      mockCallHandler.handle.mockReturnValue(throwError(() => error));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler as unknown as CallHandler,
      );

      result$.subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockExistsSync).toHaveBeenCalledWith(mockFile.path);
          expect(mockUnlinkSync).toHaveBeenCalledWith(mockFile.path);
          done();
        },
      });
    });

    it('should not delete file if file does not exist', (done) => {
      mockExistsSync.mockReturnValue(false);
      const error = new Error('Test error');
      mockCallHandler.handle.mockReturnValue(throwError(() => error));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler as unknown as CallHandler,
      );

      result$.subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockExistsSync).toHaveBeenCalledWith(mockFile.path);
          expect(mockUnlinkSync).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should not delete file on success', () => {
      mockCallHandler.handle.mockReturnValue(of('success'));

      interceptor.intercept(
        mockExecutionContext,
        mockCallHandler as unknown as CallHandler,
      );

      expect(mockExistsSync).not.toHaveBeenCalled();
      expect(mockUnlinkSync).not.toHaveBeenCalled();
    });
  });
});
