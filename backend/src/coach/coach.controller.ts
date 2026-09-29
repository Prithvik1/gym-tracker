import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/user.entity';
import { CoachService } from './coach.service';
import { SuggestWorkoutDto } from './dto/suggest-workout.dto';

@Controller('coach')
@UseGuards(JwtAuthGuard)
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('suggest-workout')
  suggestWorkout(@Req() req: Request, @Body() dto: SuggestWorkoutDto) {
    return this.coachService.suggestWorkout((req.user as User).id, dto);
  }
}
