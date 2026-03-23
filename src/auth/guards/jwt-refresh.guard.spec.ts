import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtRefreshGuard } from './jwt-refresh.guard';

describe('JwtRefreshGuard', () => {
  let guard: JwtRefreshGuard;

  beforeEach(() => {
    guard = new JwtRefreshGuard();
  });

  it('должен быть определён', () => {
    expect(guard).toBeDefined();
  });

  it('должен расширять AuthGuard со стратегией jwt-refresh', () => {
    expect(guard).toBeInstanceOf(AuthGuard('jwt-refresh'));
  });

  it('должен вызывать super.canActivate при валидном контексте', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid.refresh.token' },
        }),
      }),
    } as ExecutionContext;

    const canActivateSpy = jest
      .spyOn(AuthGuard('jwt-refresh').prototype, 'canActivate')
      .mockReturnValue(true);

    guard.canActivate(mockContext);

    expect(canActivateSpy).toHaveBeenCalledWith(mockContext);
    canActivateSpy.mockRestore();
  });

  it('должен возвращать false если refresh-токен не передан', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    const canActivateSpy = jest
      .spyOn(AuthGuard('jwt-refresh').prototype, 'canActivate')
      .mockReturnValue(false);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
    canActivateSpy.mockRestore();
  });
});
