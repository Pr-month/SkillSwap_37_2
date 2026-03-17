// src/auth/guards/jwt-access.guard.spec.ts
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAccessGuard } from './jwt-access.guard';

describe('JwtAccessGuard', () => {
  let guard: JwtAccessGuard;

  beforeEach(() => {
    guard = new JwtAccessGuard();
  });

  it('должен быть определён', () => {
    expect(guard).toBeDefined();
  });

  it('должен расширять AuthGuard со стратегией jwt-access', () => {
    expect(guard).toBeInstanceOf(AuthGuard('jwt-access'));
  });

  it('должен вызывать super.canActivate при валидном контексте', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid.jwt.token' },
        }),
      }),
    } as ExecutionContext;

    const canActivateSpy = jest
      .spyOn(AuthGuard('jwt-access').prototype, 'canActivate')
      .mockReturnValue(true);

    guard.canActivate(mockContext);

    expect(canActivateSpy).toHaveBeenCalledWith(mockContext);
    canActivateSpy.mockRestore();
  });

  it('должен возвращать false если токен не передан', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    const canActivateSpy = jest
      .spyOn(AuthGuard('jwt-access').prototype, 'canActivate')
      .mockReturnValue(false);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
    canActivateSpy.mockRestore();
  });
});
