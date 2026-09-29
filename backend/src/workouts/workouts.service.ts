import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { MuscleGroup } from '../exercises/exercise.entity';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { WeightUnit } from './workout-log-entry.entity';
import { WorkoutLog } from './workout-log.entity';

const PUSH_GROUPS = new Set([
  MuscleGroup.CHEST,
  MuscleGroup.SHOULDERS,
  MuscleGroup.TRICEPS,
]);
const PULL_GROUPS = new Set([MuscleGroup.BACK, MuscleGroup.BICEPS]);
const LEG_GROUPS = new Set([
  MuscleGroup.QUADS,
  MuscleGroup.HAMSTRINGS,
  MuscleGroup.GLUTES,
  MuscleGroup.CALVES,
]);
// The groups an all-round program should hit regularly; calves/core/arms are
// lower-priority so they don't drive imbalance nudges.
const MAJOR_GROUPS = [
  MuscleGroup.CHEST,
  MuscleGroup.BACK,
  MuscleGroup.SHOULDERS,
  MuscleGroup.QUADS,
  MuscleGroup.HAMSTRINGS,
  MuscleGroup.GLUTES,
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Labels a day's set of trained muscle groups as a split day, purely from which groups dominate. */
export function detectSplitLabel(muscleGroups: MuscleGroup[]): string {
  const groups = [...new Set(muscleGroups)];
  if (groups.length === 0) return 'Rest';
  if (groups.length === 1) return `${capitalize(groups[0])} Day`;

  const pushCount = groups.filter((g) => PUSH_GROUPS.has(g)).length;
  const pullCount = groups.filter((g) => PULL_GROUPS.has(g)).length;
  const legCount = groups.filter((g) => LEG_GROUPS.has(g)).length;
  const total = groups.length;

  if (pushCount >= 2 && pushCount / total >= 0.6) return 'Push';
  if (pullCount >= 2 && pullCount / total >= 0.6) return 'Pull';
  if (legCount >= 2 && legCount / total >= 0.6) return 'Legs';
  return 'Full Body';
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

/** Flags major muscle groups that haven't been trained within `thresholdDays`. */
export function computeImbalances(
  lastTrainedByGroup: Partial<Record<MuscleGroup, Date>>,
  now: Date,
  thresholdDays = 14,
): string[] {
  const messages: string[] = [];
  for (const group of MAJOR_GROUPS) {
    const last = lastTrainedByGroup[group];
    const daysSince = last ? daysBetween(last, now) : Infinity;
    if (daysSince >= thresholdDays) {
      const suffix = last ? `in ${daysSince} days` : 'yet';
      messages.push(`You haven't trained ${group} ${suffix}`);
    }
  }
  return messages;
}

interface WorkoutLogEntryRow {
  date: string;
  muscle_group: MuscleGroup;
  sets: number;
}

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutLog)
    private readonly workoutLogsRepository: Repository<WorkoutLog>,
  ) {}

  create(userId: string, dto: CreateWorkoutLogDto): Promise<WorkoutLog> {
    const log = this.workoutLogsRepository.create({
      user_id: userId,
      date: dto.date,
      notes: dto.notes ?? null,
      entries: dto.entries.map((e) => ({
        exercise_id: e.exercise_id,
        weight: e.weight ?? null,
        weight_unit: e.weight_unit ?? WeightUnit.KG,
        sets: e.sets,
        reps: e.reps,
        notes: e.notes ?? null,
      })),
    });
    return this.workoutLogsRepository.save(log);
  }

  findForUser(
    userId: string,
    range: 'week' | 'month' = 'week',
  ): Promise<WorkoutLog[]> {
    const days = range === 'month' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.workoutLogsRepository.find({
      where: {
        user_id: userId,
        date: MoreThanOrEqual(since.toISOString().slice(0, 10)),
      },
      order: { date: 'DESC' },
    });
  }

  async getInsights(userId: string) {
    const logs = await this.workoutLogsRepository.find({
      where: { user_id: userId },
      order: { date: 'DESC' },
      take: 20,
    });

    const rows: WorkoutLogEntryRow[] = logs.flatMap((log) =>
      log.entries.map((entry) => ({
        date: log.date,
        muscle_group: entry.exercise.muscle_group,
        sets: entry.sets,
      })),
    );

    const groupsByDate = new Map<string, Set<MuscleGroup>>();
    for (const row of rows) {
      if (!groupsByDate.has(row.date)) groupsByDate.set(row.date, new Set());
      groupsByDate.get(row.date)!.add(row.muscle_group);
    }
    const datesDesc = [...groupsByDate.keys()].sort().reverse();
    const recentPattern = datesDesc.slice(0, 7).map((date) => ({
      date,
      label: detectSplitLabel([...groupsByDate.get(date)!]),
    }));
    const detectedSplit = recentPattern[0]?.label ?? null;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    const muscleVolume7d: Record<string, number> = {};
    for (const row of rows) {
      if (row.date < sevenDaysAgoStr) continue;
      muscleVolume7d[row.muscle_group] =
        (muscleVolume7d[row.muscle_group] ?? 0) + row.sets;
    }

    const lastTrainedByGroup: Partial<Record<MuscleGroup, Date>> = {};
    for (const row of rows) {
      const rowDate = new Date(row.date);
      const existing = lastTrainedByGroup[row.muscle_group];
      if (!existing || rowDate > existing) {
        lastTrainedByGroup[row.muscle_group] = rowDate;
      }
    }
    const imbalances = computeImbalances(lastTrainedByGroup, now);

    return {
      detected_split: detectedSplit,
      recent_pattern: recentPattern,
      muscle_volume_7d: muscleVolume7d,
      imbalances,
    };
  }
}
