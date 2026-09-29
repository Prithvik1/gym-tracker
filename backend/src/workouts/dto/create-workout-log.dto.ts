import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateWorkoutLogEntryDto } from './create-workout-log-entry.dto';

export class CreateWorkoutLogDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutLogEntryDto)
  entries!: CreateWorkoutLogEntryDto[];
}
