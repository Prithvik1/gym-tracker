import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../auth';
import { api, type CoachSuggestion } from '../api';
import { useStaggerIn } from '../hooks/useStaggerIn';
import AILoadingState from '../components/kokonutui/ai-loading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GradientButton from '@/components/kokonutui/gradient-button';

export default function Coach() {
  const navigate = useNavigate();
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<CoachSuggestion | null>(null);
  const resultRef = useStaggerIn<HTMLDivElement>('[data-slot="card"]', [suggestion]);

  async function getSuggestion() {
    setLoading(true);
    setError(null);
    try {
      setSuggestion(await api.suggestWorkout(focus || undefined));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function logThis() {
    navigate('/log', { state: { prefillEntries: suggestion?.exercises } });
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 text-2xl font-semibold">Ask the Coach</h1>
      <div className="mb-4 flex flex-col gap-1.5">
        <Label htmlFor="focus">What do you want to train today? (optional)</Label>
        <Input
          id="focus"
          placeholder="e.g. legs only, 30 minutes, dumbbells only"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
        />
      </div>
      <GradientButton
        variant="orange"
        disabled={loading}
        label={loading ? 'Thinking…' : 'Get Suggestion'}
        onClick={getSuggestion}
      />

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      {loading && (
        <Card className="mt-5">
          <CardContent>
            <AILoadingState />
          </CardContent>
        </Card>
      )}

      {suggestion && (
        <div className="mt-7" ref={resultRef}>
          <h2 className="text-xl font-semibold">{suggestion.title}</h2>
          <p className="mt-1 text-muted-foreground">{suggestion.focus_area}</p>
          <div className="mt-3.5 flex flex-col gap-2.5">
            {suggestion.exercises.map((ex, i) => (
              <Card key={i}>
                <CardContent>
                  <div className="font-semibold">{ex.name}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {ex.sets} sets × {ex.reps} reps
                    {ex.notes ? ` — ${ex.notes}` : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3.5 text-muted-foreground italic">{suggestion.rationale}</p>
          <Button className="mt-4" variant="outline" onClick={logThis}>
            Log this workout
          </Button>
        </div>
      )}
    </div>
  );
}
