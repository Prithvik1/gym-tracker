import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MuscleGroup } from '../exercise.entity';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(MuscleGroup)
  muscle_group!: MuscleGroup;
}
