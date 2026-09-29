import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { errorMessage } from '../auth';
import { api, type WorkoutLog, type WorkoutLogEntry } from '../api';
import { useStaggerIn } from '../hooks/useStaggerIn';
import SmoothTab from '../components/kokonutui/smooth-tab';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const RANGE_TABS = [
  {
    id: 'week',
    title: 'Past week',
    description: 'Everything logged in the last 7 days.',
    color: 'bg-primary hover:bg-primary/90',
  },
  {
    id: 'month',
    title: 'Past month',
    description: 'Everything logged in the last 30 days.',
    color: 'bg-primary hover:bg-primary/90',
  },
];

function entrySummary(entry: WorkoutLogEntry) {
  const parts = [`${entry.sets} sets × ${entry.reps} reps`];
  if (entry.weight != null) parts.push(`@ ${entry.weight}${entry.weight_unit}`);
  const summary = parts.join(' ');
  return entry.notes ? `${summary} — ${entry.notes}` : summary;
}

export default function WorkoutHistory() {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getWorkoutLogs(range)
      .then(setLogs)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [range]);

  const listRef = useStaggerIn<HTMLDivElement>('[data-slot="accordion-item"]', [logs]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Workout History</h1>
      <div className="mb-5">
        <SmoothTab
          items={RANGE_TABS}
          defaultTabId={range}
          onChange={(id) => setRange(id as 'week' | 'month')}
        />
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
      ) : (
        <Accordion ref={listRef}>
          {logs.map((log) => (
            <AccordionItem className="mb-3 rounded-xl border bg-card px-4 last:mb-0" key={log.id} value={log.id}>
              <AccordionTrigger className="hover:no-underline">
                <div>
                  <div className="font-semibold">{log.date}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {log.entries.length} exercise{log.entries.length === 1 ? '' : 's'}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {log.entries.map((entry, i) => (
                  <div className="py-1.5" key={i}>
                    <div className="font-medium">{entry.exercise?.name ?? 'Exercise'}</div>
                    <div className="text-muted-foreground">{entrySummary(entry)}</div>
                  </div>
                ))}
                {log.notes && (
                  <p className="mt-2 text-muted-foreground">Notes: {log.notes}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
