# Gym Progress Tracker

See [gym-progress-tracker-phase-1-spec.md](gym-progress-tracker-phase-1-spec.md) for the full spec.

Implemented so far (build-order step 1): auth + user profile + training-level onboarding.

## Run it

```bash
docker compose up -d                # Postgres
cd backend && cp .env.example .env  # first time only
npm install && npm run start        # http://localhost:3000

cd web && cp .env.example .env      # first time only
npm install && npm run dev          # http://localhost:5173
```

`web/` is the React app for the browser. A mobile app (iOS/Android) is
planned once the web app is feature-complete.

## Next: deploy + remaining features

See **[ROADMAP.md](ROADMAP.md)** — the full build & deploy plan: how to ship
this end-to-end (Railway + Vercel, Docker, CI) and every feature still to build
(goal/stats, meal logging + AI calories, calorie targets, split builder), each
with exact files, entities, and endpoints.
