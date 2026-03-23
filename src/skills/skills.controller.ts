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
  ParseUUIDPipe,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { TAuthRequest } from '../auth/auth.types';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import { UsersService } from '../users/users.service';
import {
  ApiCreateSkill,
  ApiFindAllSkills,
  ApiFindOneSkill,
  ApiUpdateSkill,
  ApiDeleteSkill,
  ApiAddFavoriteSkill,
  ApiRemoveFavoriteSkill,
} from './skills.swagger';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  @ApiCreateSkill()
  create(@Body() createSkillDto: CreateSkillDto, @Request() req: TAuthRequest) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Get()
  @ApiFindAllSkills()
  findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  @ApiFindOneSkill()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillsService.findOne(id);
  }

  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  @ApiUpdateSkill()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Request() req: TAuthRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  @ApiDeleteSkill()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: TAuthRequest,
  ) {
    await this.skillsService.findOneAndCheckOwner(id, req.user);
    return this.skillsService.remove(id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAccessGuard)
  @ApiAddFavoriteSkill()
  addFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: TAuthRequest,
  ) {
    return this.userService.addFavorite(id, req.user.sub);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAccessGuard)
  @ApiRemoveFavoriteSkill()
  removeFavorite(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: TAuthRequest,
  ) {
    return this.userService.removeFavorite(id, req.user.sub);
  }
}
