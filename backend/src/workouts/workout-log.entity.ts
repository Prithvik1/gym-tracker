import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkoutLogEntry } from './workout-log-entry.entity';

@Entity()
export class WorkoutLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', nullable: true })
  notes!: string | null;

  @OneToMany(() => WorkoutLogEntry, (entry) => entry.workout_log, {
    cascade: true,
    eager: true,
  })
  entries!: WorkoutLogEntry[];

  @CreateDateColumn()
  created_at!: Date;
}
