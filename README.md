# Gym Progress Tracker

A full-stack fitness tracker that personalizes training by experience level,
logs workouts in detail, and uses AI to turn free-text meals into calorie
estimates and to suggest workouts. Built with **NestJS**, **PostgreSQL**, and
**React**.

**Live demo:** _coming soon — deploying to Railway (API) + Vercel (web)_

📋 [Build & deploy roadmap](ROADMAP.md) · 📄 [Phase 1 spec](gym-progress-tracker-phase-1-spec.md)

## Tech stack

- **Backend:** NestJS (TypeScript), TypeORM, PostgreSQL, JWT auth (bcrypt)
- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui
- **AI:** Google Gemini (`gemini-2.5-flash`) — workout suggestions & meal calorie parsing
- **Infra:** Docker, GitHub Actions CI, Railway (API + DB), Vercel (web)

## Features

**Built**

- Email/password auth with JWT and hashed passwords
- Training-level onboarding (beginner / intermediate / advanced) → tailored home
- Exercise library (seeded) + user-created custom exercises
- Detailed workout logging (sets, reps, weight, unit, notes) + history
- Training insights — 7-day muscle-group volume, imbalance & split detection
- AI coach — suggests today's workout from your level, goal, and recent training

**In progress** (see [ROADMAP.md](ROADMAP.md))

- Goal & body-stats editing
- Meal logging + AI calorie/macro estimation
- Calorie targets + daily/weekly summary
- Advanced split builder

## Run locally

Requires Docker (for Postgres), Node 22, and a [Gemini API key](https://aistudio.google.com/apikey) (free tier).

```bash
docker compose up -d                       # Postgres

cd backend && cp .env.example .env         # first time; add your GEMINI_API_KEY
npm install && npm run start:dev           # http://localhost:3000

cd ../web && cp .env.example .env          # first time
npm install && npm run dev                 # http://localhost:5173
```

## Project layout

```
backend/            NestJS API (auth, users, exercises, workouts, coach)
web/                React app (Vite)
docker-compose.yml  Local Postgres
ROADMAP.md          Build & deploy plan
```

## Development workflow

`main` is always deployable — CI (lint + tests + build) runs on every pull
request, and merges to `main` auto-deploy (API → Railway, web → Vercel).

One feature per branch:

```bash
git checkout -b feature/<name>   # branch off main
# build the feature, commit as you go
git push -u origin feature/<name>
# open a PR → CI runs → review → merge to main
```
