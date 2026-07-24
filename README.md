# Gym Progress Tracker

See [gym-progress-tracker-phase-1-spec.md](gym-progress-tracker-phase-1-spec.md) for the full spec.

Implemented so far (build-order step 1): auth + user profile + training-level onboarding.

## Run it

```bash
docker compose up -d                # Postgres
cd backend && cp .env.example .env  # first time only
npm install && npm run start        # http://localhost:3000

cd mobile && flutter run -d chrome  # or -d <device>
```

## Next (build-order steps 2+)

Exercise library + level-specific home pages, workout logging, split builder,
meal logging + AI parsing, calorie targets — see spec section 7.
