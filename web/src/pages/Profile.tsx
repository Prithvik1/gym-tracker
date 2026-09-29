import { useAuth } from '../auth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

function capitalize(value: string | null) {
  return value ? value[0].toUpperCase() + value.slice(1) : 'Not set';
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(iso));
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const rows: [string, string][] = [
    ['Training level', capitalize(user.training_level)],
    ['Goal', capitalize(user.goal)],
    ['Weight', user.weight != null ? String(user.weight) : 'Not set'],
    ['Height', user.height != null ? String(user.height) : 'Not set'],
    ['Age', user.age != null ? String(user.age) : 'Not set'],
    ['Sex', capitalize(user.sex)],
    ['Member since', formatDate(user.created_at)],
  ];

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 text-2xl font-semibold">Profile</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-2 pb-4 text-center">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </CardContent>
        <Separator />
        <CardContent className="pt-4">
          {rows.map(([label, value], i) => (
            <div key={label}>
              {i > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
