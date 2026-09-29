import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { Loader2 } from 'lucide-react';
import { errorMessage } from '../auth';
import { api, type Insights } from '../api';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

function useFadeIn<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    animate(ref.current, { opacity: [0, 1], y: [12, 0], duration: 450, ease: 'outQuad' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export default function SplitInsights() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const cardRef = useFadeIn<HTMLDivElement>([insights]);

  function load() {
    setLoading(true);
    setError(null);
    setBarsVisible(false);
    api
      .getInsights()
      .then(setInsights)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    if (!insights) return;
    const frame = requestAnimationFrame(() => setBarsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [insights]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !insights) {
    return <p className="text-sm font-medium text-destructive">{error}</p>;
  }

  const volume = insights.muscle_volume_7d;
  const maxVolume = Math.max(0, ...Object.values(volume));

  return (
    <div>
      <Card ref={cardRef}>
        <CardContent>
          <p className="mb-2 font-semibold">Your Split, Auto-Detected</p>
          <h1 className="text-2xl font-bold">
            {insights.detected_split ?? 'Log a workout to see your split'}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            No split to plan ahead of time — it emerges from what you actually train.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 mb-3 font-semibold">Muscle Balance (last 7 days)</p>
      {Object.keys(volume).length === 0 ? (
        <p className="text-sm text-muted-foreground">No sets logged in the last 7 days.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(volume).map(([group, sets]) => (
            <div className="flex items-center gap-3" key={group}>
              <div className="w-24 shrink-0 text-sm">{group[0].toUpperCase() + group.slice(1)}</div>
              <Progress
                className="flex-1"
                value={barsVisible ? (maxVolume === 0 ? 0 : (sets / maxVolume) * 100) : 0}
              />
              <div className="w-16 shrink-0 text-right text-sm text-muted-foreground">
                {sets} sets
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.imbalances.length > 0 && (
        <>
          <p className="mt-6 mb-3 font-semibold">Nudges</p>
          <div className="flex flex-wrap gap-2">
            {insights.imbalances.map((msg) => (
              <Badge key={msg}>{msg}</Badge>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
