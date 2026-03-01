import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SkillsService } from './../skills.service';
import { OwnerGuardException } from '../exceptions/OwnerGuardException';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private skillsService: SkillsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const skillId = +request.params.id;

    if (!userId || !skillId) {
      throw new OwnerGuardException;
    }

    const skill = await this.skillsService.findOneForUser(skillId, userId);
    
    if (!skill) {
      throw new OwnerGuardException;
    }

    return true;
  }
}