import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/user.entity';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { WorkoutsService } from './workouts.service';

@Controller('workout-logs')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWorkoutLogDto) {
    return this.workoutsService.create((req.user as User).id, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query('range') range?: 'week' | 'month') {
    return this.workoutsService.findForUser((req.user as User).id, range);
  }

  @Get('insights')
  getInsights(@Req() req: Request) {
    return this.workoutsService.getInsights((req.user as User).id);
  }
}
