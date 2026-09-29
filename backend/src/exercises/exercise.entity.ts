import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  QUADS = 'quads',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  CORE = 'core',
}

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: MuscleGroup })
  muscle_group!: MuscleGroup;

  @Column({ default: false })
  is_custom!: boolean;

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id!: string | null;
}
