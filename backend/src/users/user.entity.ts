import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TrainingLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum Goal {
  BULK = 'bulk',
  CUT = 'cut',
  MAINTAIN = 'maintain',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: TrainingLevel, nullable: true })
  training_level!: TrainingLevel | null;

  @Column({ type: 'enum', enum: Goal, nullable: true })
  goal!: Goal | null;

  @Column({ type: 'float', nullable: true })
  weight!: number | null;

  @Column({ type: 'float', nullable: true })
  height!: number | null;

  @Column({ type: 'int', nullable: true })
  age!: number | null;

  @Column({ type: 'varchar', nullable: true })
  sex!: string | null;

  @CreateDateColumn()
  created_at!: Date;
}

export function toPublicUser(user: User) {
  const { password_hash: _password_hash, ...publicUser } = user;
  return publicUser;
}
