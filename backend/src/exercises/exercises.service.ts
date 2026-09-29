import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { Exercise, MuscleGroup } from './exercise.entity';

const SEED_EXERCISES: Array<{ name: string; muscle_group: MuscleGroup }> = [
  { name: 'Bench Press', muscle_group: MuscleGroup.CHEST },
  { name: 'Push-Up', muscle_group: MuscleGroup.CHEST },
  { name: 'Barbell Row', muscle_group: MuscleGroup.BACK },
  { name: 'Lat Pulldown', muscle_group: MuscleGroup.BACK },
  { name: 'Overhead Press', muscle_group: MuscleGroup.SHOULDERS },
  { name: 'Lateral Raise', muscle_group: MuscleGroup.SHOULDERS },
  { name: 'Barbell Curl', muscle_group: MuscleGroup.BICEPS },
  { name: 'Hammer Curl', muscle_group: MuscleGroup.BICEPS },
  { name: 'Tricep Pushdown', muscle_group: MuscleGroup.TRICEPS },
  { name: 'Skull Crusher', muscle_group: MuscleGroup.TRICEPS },
  { name: 'Back Squat', muscle_group: MuscleGroup.QUADS },
  { name: 'Leg Press', muscle_group: MuscleGroup.QUADS },
  { name: 'Romanian Deadlift', muscle_group: MuscleGroup.HAMSTRINGS },
  { name: 'Leg Curl', muscle_group: MuscleGroup.HAMSTRINGS },
  { name: 'Hip Thrust', muscle_group: MuscleGroup.GLUTES },
  { name: 'Glute Bridge', muscle_group: MuscleGroup.GLUTES },
  { name: 'Standing Calf Raise', muscle_group: MuscleGroup.CALVES },
  { name: 'Seated Calf Raise', muscle_group: MuscleGroup.CALVES },
  { name: 'Plank', muscle_group: MuscleGroup.CORE },
  { name: 'Hanging Leg Raise', muscle_group: MuscleGroup.CORE },
];

@Injectable()
export class ExercisesService implements OnModuleInit {
  constructor(
    @InjectRepository(Exercise)
    private readonly exercisesRepository: Repository<Exercise>,
  ) {}

  async onModuleInit() {
    const count = await this.exercisesRepository.count();
    if (count > 0) return;
    const seeded = SEED_EXERCISES.map((e) =>
      this.exercisesRepository.create({
        ...e,
        is_custom: false,
        created_by_user_id: null,
      }),
    );
    await this.exercisesRepository.save(seeded);
  }

  findAll(muscleGroup?: MuscleGroup): Promise<Exercise[]> {
    return this.exercisesRepository.find({
      where: muscleGroup ? { muscle_group: muscleGroup } : {},
      order: { name: 'ASC' },
    });
  }

  create(userId: string, dto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.exercisesRepository.create({
      name: dto.name,
      muscle_group: dto.muscle_group,
      is_custom: true,
      created_by_user_id: userId,
    });
    return this.exercisesRepository.save(exercise);
  }
}
