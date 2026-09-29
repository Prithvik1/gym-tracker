import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exercise } from '../exercises/exercise.entity';
import { WorkoutLog } from './workout-log.entity';

export enum WeightUnit {
  KG = 'kg',
  LB = 'lb',
}

@Entity()
export class WorkoutLogEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => WorkoutLog, (log) => log.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_log_id' })
  workout_log!: WorkoutLog;

  @Column({ type: 'uuid' })
  workout_log_id!: string;

  @ManyToOne(() => Exercise, { eager: true })
  @JoinColumn({ name: 'exercise_id' })
  exercise!: Exercise;

  @Column({ type: 'uuid' })
  exercise_id!: string;

  @Column({ type: 'float', nullable: true })
  weight!: number | null;

  @Column({ type: 'enum', enum: WeightUnit, default: WeightUnit.KG })
  weight_unit!: WeightUnit;

  @Column({ type: 'int' })
  sets!: number;

  @Column({ type: 'int' })
  reps!: number;

  @Column({ type: 'varchar', nullable: true })
  notes!: string | null;
}
