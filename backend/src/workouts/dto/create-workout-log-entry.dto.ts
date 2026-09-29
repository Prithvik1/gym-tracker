import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { WeightUnit } from '../workout-log-entry.entity';

export class CreateWorkoutLogEntryDto {
  @IsUUID()
  exercise_id!: string;

  @IsOptional()
  @IsPositive()
  weight?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  weight_unit?: WeightUnit;

  @IsInt()
  @Min(1)
  sets!: number;

  @IsInt()
  @Min(1)
  reps!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
