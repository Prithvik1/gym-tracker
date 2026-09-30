import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CoachModule } from './coach/coach.module';
import { Exercise } from './exercises/exercise.entity';
import { ExercisesModule } from './exercises/exercises.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { WorkoutLogEntry } from './workouts/workout-log-entry.entity';
import { WorkoutLog } from './workouts/workout-log.entity';
import { WorkoutsModule } from './workouts/workouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'gymtracker'),
        password: configService.get('DB_PASSWORD', 'gymtracker'),
        database: configService.get('DB_NAME', 'gymtracker'),
        // Managed Postgres (Neon, Render external) requires SSL; local/Docker
        // don't. ponytail: rejectUnauthorized:false trusts the host cert
        // without CA pinning — standard for these providers; pin a CA if ever
        // security-critical.
        ssl:
          configService.get('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        entities: [User, Exercise, WorkoutLog, WorkoutLogEntry],
        // ponytail: synchronize auto-generates schema from entities for fast
        // iteration; switch to real migrations before this touches prod data.
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ExercisesModule,
    WorkoutsModule,
    CoachModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
