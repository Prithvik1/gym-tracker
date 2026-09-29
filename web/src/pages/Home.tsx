import { useNavigate } from 'react-router-dom';
import { Dumbbell, BarChart3, History, Bot } from 'lucide-react';
import { useAuth } from '../auth';
import { useStaggerIn } from '../hooks/useStaggerIn';
import { Card } from '@/components/ui/card';

const actions = [
  {
    to: '/log',
    icon: Dumbbell,
    title: 'Log Workout',
    subtitle: 'Record exercises, sets, reps, and weight',
  },
  {
    to: '/insights',
    icon: BarChart3,
    title: 'My Split & Balance',
    subtitle: 'Your training split, auto-detected from your logs',
  },
  { to: '/history', icon: History, title: 'History', subtitle: 'Past workouts' },
  {
    to: '/coach',
    icon: Bot,
    title: 'Ask the Coach',
    subtitle: 'Get an AI-suggested workout for today',
  },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const level = user?.training_level ?? '';
  const gridRef = useStaggerIn<HTMLDivElement>('.action-card');

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">
        Training level:{' '}
        <strong className="text-foreground">
          {level[0]?.toUpperCase() + level.slice(1)}
        </strong>
      </p>
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        ref={gridRef}
      >
        {actions.map((action) => (
          <Card
            className="action-card cursor-pointer flex-row items-center gap-4 p-5 transition-colors hover:border-primary/50"
            key={action.to}
            onClick={() => navigate(action.to)}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <action.icon className="size-6" />
            </div>
            <div>
              <div className="font-semibold">{action.title}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{action.subtitle}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
