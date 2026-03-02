import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { TAuthRequest } from '../auth/auth.types';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Request() req: TAuthRequest,
  ) {
    return this.skillsService.update(+id, updateSkillDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  async remove(
    @Param('id') id: string,
    @Request() req: TAuthRequest
) {

    const skill = await this.skillsService.findOne(+id);
    const userId = req.user.email;

    if (!userId || !skill) {
      throw new ForbiddenException("Can`t find resources");
    }

    if (skill.owner.email != req.user.email) {
      throw new ForbiddenException("Can`t auth for request");
    }

    return this.skillsService.remove(+id);
  }
}
