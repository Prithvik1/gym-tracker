import { IsEnum } from 'class-validator';
import { TrainingLevel } from '../user.entity';

export class UpdateTrainingLevelDto {
  @IsEnum(TrainingLevel)
  training_level!: TrainingLevel;
}
