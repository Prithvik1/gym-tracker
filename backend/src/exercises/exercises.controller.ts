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
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { MuscleGroup } from './exercise.entity';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(@Query('muscle_group') muscleGroup?: MuscleGroup) {
    return this.exercisesService.findAll(muscleGroup);
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateExerciseDto) {
    return this.exercisesService.create((req.user as User).id, dto);
  }
}
