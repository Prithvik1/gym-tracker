import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';

@Module({
  imports: [ConfigModule, UsersModule, WorkoutsModule],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
