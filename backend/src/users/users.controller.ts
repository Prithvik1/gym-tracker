import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateTrainingLevelDto } from './dto/update-training-level.dto';
import { toPublicUser, User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMe(@Req() req: Request) {
    return toPublicUser(req.user as User);
  }

  @Put('training-level')
  async setTrainingLevel(
    @Req() req: Request,
    @Body() dto: UpdateTrainingLevelDto,
  ) {
    const user = await this.usersService.setTrainingLevel(
      (req.user as User).id,
      dto.training_level,
    );
    return toPublicUser(user);
  }
}
