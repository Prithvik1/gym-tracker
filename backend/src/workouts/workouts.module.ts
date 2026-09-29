import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLog } from './workout-log.entity';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutLog])],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
