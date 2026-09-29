import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, errorMessage } from '../auth';
import GradientButton from '@/components/kokonutui/gradient-button';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function TrainingLevel() {
  const { setTrainingLevel } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function select(level: string) {
    setSubmitting(true);
    setError(null);
    try {
      await setTrainingLevel(level);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-center text-xl font-semibold">
        How would you describe your training experience?
      </h1>
      <div className="flex flex-col gap-3">
        {LEVELS.map((level) => (
          <GradientButton
            key={level}
            variant="orange"
            disabled={submitting}
            label={level[0].toUpperCase() + level.slice(1)}
            className="w-full"
            onClick={() => select(level)}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
