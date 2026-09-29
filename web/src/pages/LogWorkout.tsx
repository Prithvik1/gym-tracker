import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { errorMessage } from '../auth';
import { api } from '../api';
import type { CoachExercise, Exercise } from '../api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GradientButton from '@/components/kokonutui/gradient-button';

interface EntryDraft {
  exerciseName: string;
  exerciseId: string | null;
  sets: string;
  reps: string;
  weight: string;
  weightUnit: 'kg' | 'lb';
  notes: string;
}

function emptyEntry(): EntryDraft {
  return { exerciseName: '', exerciseId: null, sets: '3', reps: '10', weight: '', weightUnit: 'kg', notes: '' };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefillEntries?: CoachExercise[] } | null)?.prefillEntries;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState<EntryDraft[]>([emptyEntry()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getExercises()
      .then((list) => {
        setExercises(list);
        if (prefill && prefill.length > 0) {
          setEntries(
            prefill.map((p) => {
              const match = list.find((ex) => ex.name.toLowerCase() === p.name.toLowerCase());
              return {
                exerciseName: match?.name ?? p.name,
                exerciseId: match?.id ?? null,
                sets: String(p.sets ?? 3),
                reps: String(p.reps ?? 10),
                weight: '',
                weightUnit: 'kg',
                notes: match ? p.notes ?? '' : [p.name, p.notes ?? ''].filter(Boolean).join(' — '),
              };
            }),
          );
        }
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoadingExercises(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateEntry(index: number, patch: Partial<EntryDraft>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function setExerciseName(index: number, name: string) {
    const match = exercises.find((ex) => ex.name.toLowerCase() === name.toLowerCase());
    updateEntry(index, { exerciseName: name, exerciseId: match?.id ?? null });
  }

  async function save() {
    setError(null);
    const payload = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e.exerciseId) {
        setError(`Pick an exercise for row ${i + 1}`);
        return;
      }
      const sets = Number.parseInt(e.sets, 10);
      const reps = Number.parseInt(e.reps, 10);
      if (Number.isNaN(sets) || Number.isNaN(reps)) {
        setError(`Enter valid sets and reps for row ${i + 1}`);
        return;
      }
      payload.push({
        exercise_id: e.exerciseId,
        weight_unit: e.weightUnit,
        sets,
        reps,
        ...(e.weight ? { weight: Number.parseFloat(e.weight) } : {}),
        ...(e.notes ? { notes: e.notes } : {}),
      });
    }
    setSaving(true);
    try {
      await api.createWorkoutLog(date, payload);
      navigate('/history');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loadingExercises) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-2xl font-semibold">Log Workout</h1>
      <div className="mb-4 flex max-w-[220px] flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <datalist id="exercise-options">
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.name} />
        ))}
      </datalist>

      <div className="my-4 flex flex-col gap-3">
        {entries.map((entry, index) => (
          <Card key={index}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Exercise</Label>
                  <Input
                    list="exercise-options"
                    value={entry.exerciseName}
                    onChange={(e) => setExerciseName(index, e.target.value)}
                  />
                </div>
                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove exercise"
                    onClick={() => setEntries((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    value={entry.sets}
                    onChange={(e) => updateEntry(index, { sets: e.target.value })}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    value={entry.reps}
                    onChange={(e) => updateEntry(index, { reps: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Weight (optional)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={entry.weight}
                    onChange={(e) => updateEntry(index, { weight: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Unit</Label>
                  <Select
                    value={entry.weightUnit}
                    onValueChange={(value) =>
                      updateEntry(index, { weightUnit: value as 'kg' | 'lb' })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Notes (optional)</Label>
                <Input
                  value={entry.notes}
                  onChange={(e) => updateEntry(index, { notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={() => setEntries((prev) => [...prev, emptyEntry()])}>
        + Add exercise
      </Button>

      {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}

      <div className="mt-5">
        <GradientButton
          variant="orange"
          disabled={saving}
          label={saving ? 'Saving…' : 'Save Workout'}
          className="w-full"
          onClick={save}
        />
      </div>
    </div>
  );
}
