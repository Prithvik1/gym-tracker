import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, errorMessage } from '../auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GradientButton from '@/components/kokonutui/gradient-button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email, password);
      navigate(user.training_level ? '/' : '/training-level', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <GradientButton
              type="submit"
              variant="orange"
              disabled={submitting}
              label={submitting ? 'Logging in…' : 'Log in'}
              className="w-full"
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link className="font-medium text-primary hover:underline" to="/signup">
              Don&apos;t have an account? Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
