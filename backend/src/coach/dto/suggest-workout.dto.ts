import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SuggestWorkoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  focus?: string;
}
