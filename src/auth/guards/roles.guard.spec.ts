import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/users.enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

const createContext = (user: object | null): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('должен быть определён', () => {
    expect(guard).toBeDefined();
  });

  it('должен пропускать запрос если роли не заданы', () => {
    reflector.getAllAndOverride.mockReturnValue(null);

    const result = guard.canActivate(createContext(null));

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [{}, {}]);
  });

  it('должен пропускать запрос если роль пользователя совпадает с требуемой', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    const result = guard.canActivate(createContext({ role: UserRole.ADMIN }));

    expect(result).toBe(true);
  });

  it('должен выбрасывать ForbiddenException если пользователь не найден в запросе', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => guard.canActivate(createContext(null))).toThrow(
      new ForbiddenException('User not found'),
    );
  });

  it('должен выбрасывать ForbiddenException если роль пользователя не совпадает с требуемой', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

    expect(() => guard.canActivate(createContext({ role: UserRole.USER }))).toThrow(
      ForbiddenException,
    );
  });

  it('должен пропускать запрос если одна из нескольких требуемых ролей совпадает', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN, UserRole.USER]);

    const result = guard.canActivate(createContext({ role: UserRole.USER }));

    expect(result).toBe(true);
  });
});
