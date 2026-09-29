# Gym Tracker — Build & Deploy Roadmap

The single doc to follow to get this **deployed end-to-end** and finish the
Phase 1 features. Each item is a checklist with exact file paths, entity fields,
endpoints, and a "done when" so building is copy-paste fast.

Order to work in:
1. **[§1 Ship it](#1-ship-it-deploy-end-to-end)** — deploy first. This clears the resume gate (deployed + GitHub + live URL + Docker + CI). Do it now, with only what's already built.
2. **[§2 Features left](#2-features-still-to-build)** — build the rest, deploying each as you go (CI auto-deploys).

Legend: `[ ]` todo · `[~]` partially done · `[x]` done · `ponytail:` a deliberate shortcut + when to upgrade it.

---

## 0. Where it stands today

| Area | State | Notes |
|---|---|---|
| Auth (signup/login, JWT, bcrypt) | `[x]` | `backend/src/auth/` |
| User profile: set training level | `[x]` | `PUT /users/me/training-level` |
| User profile: set goal + body stats | `[ ]` | entity fields exist, **no endpoint/UI** (Profile is read-only) |
| Exercise library (20 seeded) + custom | `[x]` | `GET/POST /exercises`, auto-seed on boot |
| Workout logging + history | `[x]` | `POST/GET /workout-logs` |
| Workout insights (imbalance/split detect) | `[x]` | `GET /workout-logs/insights` |
| AI Coach (workout suggestion) | `[x]` | `POST /coach/suggest-workout`, **Gemini** (`gemini-2.5-flash`) |
| Meal logging + AI calorie parsing | `[ ]` | **not built** — flagship spec feature |
| Calorie targets + daily/weekly summary | `[ ]` | **not built** |
| Advanced split builder | `[ ]` | **not built** (insights ≠ builder) |
| Web app (React/Vite/Tailwind/shadcn) | `[x]` | 9 pages wired, protected routes |
| **Deployment (Docker, host, CI, prod DB)** | `[ ]` | **§1 — the goal** |

Stack: **NestJS + TypeORM + PostgreSQL** (backend), **React + Vite** (web),
**Gemini** for all AI (not Claude — no Anthropic key; reuse the coach pattern).

---

## 1. Ship it: deploy end-to-end

Recommended path (fastest, both have free tiers): **backend + Postgres on
Railway**, **web on Vercel**. Alt in one line: put the web on Railway too as a
second service — one dashboard, no Vercel.

### 1.1 Backend Dockerfile — `backend/Dockerfile`

Gives you the "Docker in evidence" the resume wants and a reproducible build.

```dockerfile
# backend/Dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

- `[ ]` Add `backend/.dockerignore`: `node_modules`, `dist`, `.env`, `*.log`.
- Using `node:22-slim` (Debian), not alpine — `bcrypt` is a native module and its prebuilds are painless on glibc. `ponytail: slim over alpine to dodge bcrypt/musl node-gyp builds; revisit only if image size matters.`
- **Done when:** `docker build -t gym-backend backend/ && docker run --rm -p 3000:3000 --env-file backend/.env gym-backend` boots and `GET /` returns.

### 1.2 Backend + Postgres on Railway

- `[ ]` Push repo to GitHub (public) first — Railway/Vercel deploy from it, and the resume needs the link.
- `[ ]` Railway → New Project → **Provision PostgreSQL** (adds a Postgres service with `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE`).
- `[ ]` Add service → Deploy from GitHub repo → set **Root Directory = `backend`** (Railway auto-uses the Dockerfile).
- `[ ]` Backend service → Variables — reference the Postgres service so no secrets are copied by hand:
  ```
  DB_HOST=${{Postgres.PGHOST}}
  DB_PORT=${{Postgres.PGPORT}}
  DB_USERNAME=${{Postgres.PGUSER}}
  DB_PASSWORD=${{Postgres.PGPASSWORD}}
  DB_NAME=${{Postgres.PGDATABASE}}
  JWT_SECRET=<generate: openssl rand -hex 32>
  GEMINI_API_KEY=<your key>
  WEB_ORIGIN=<vercel url, fill after 1.3>
  ```
  Railway injects `PORT` itself; `main.ts` already reads `process.env.PORT`.
  `ponytail:` the app reads discrete `DB_*` vars, so we map them here — no code change. Alt: add `url: process.env.DATABASE_URL` support in `app.module.ts` if you'd rather use one var.
- `[ ]` `synchronize: true` (in `app.module.ts`) auto-creates the schema on first boot against the fresh Railway DB — fine for launch. `ponytail: keep synchronize until real users exist; switch to TypeORM migrations before the first schema change on live data or you risk dropping columns.`
- **Done when:** Railway gives a public backend URL and `GET https://<backend>/` responds.

### 1.3 Web on Vercel

- `[ ]` Add `web/vercel.json` (SPA fallback — react-router uses `BrowserRouter`, so deep links must serve `index.html`):
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- `[ ]` Vercel → Import repo → **Root Directory = `web`**, framework preset **Vite** (build `npm run build`, output `dist`).
- `[ ]` Env var: `VITE_API_BASE_URL=https://<railway-backend-url>` (Vite inlines it at **build** time — redeploy after changing).
- `[ ]` Back in Railway, set `WEB_ORIGIN` to the Vercel URL (for CORS, §1.4).
- **Done when:** the Vercel URL loads, signup works against the live backend, and a hard refresh on `/history` doesn't 404.

### 1.4 Prod hardening (small, do before sharing the link)

- `[ ]` **Lock down CORS.** `backend/src/main.ts` currently `app.enableCors()` (any origin). Change to:
  ```ts
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? true, credentials: true });
  ```
  (`?? true` keeps local dev open when the var is unset.)
- `[x]` Health check — `GET /` already exists; point the platform health check at it if asked.
- `[ ]` Confirm `JWT_SECRET` in prod is the generated value, **not** `change-me-in-production`.

### 1.5 CI — `.github/workflows/ci.yml`

Gives the "CI/CD in evidence" the resume wants; Railway + Vercel already
auto-deploy on push to `main`, so this is the test/lint gate in front of that.

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  backend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: backend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: backend/package-lock.json }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
  web:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: web } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: web/package-lock.json }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

- **Done when:** the badge is green on a PR. Add to root README: `![CI](https://github.com/<you>/gym-tracker/actions/workflows/ci.yml/badge.svg)`.

### 1.6 After deploy — update the front-page README

- `[ ]` Add the **live URL** + **GitHub link** + CI badge to `README.md` (this is literally the resume gate: `Gym App | github.com/you/gym-tracker | <live-url>`).
- `[ ]` Keep this ROADMAP for the build log; the README is the public face.

---

## 2. Features still to build

Build order chosen so each feature unlocks the next (stats → targets → meals).
Each subsection lists **backend files → API → web files**. AI features **reuse
the existing Gemini pattern** in `backend/src/coach/coach.service.ts` (client
setup, `responseJsonSchema`, `finishReason` guard) — copy it, don't reinvent.

### 2.1 Goal + body stats (prerequisite for calorie targets)

Fields already exist on `User` (`goal`, `weight`, `height`, `age`, `sex`); only
the endpoint + UI are missing. Profile page currently shows them read-only as
"Not set".

- `[ ]` `backend/src/users/dto/update-profile.dto.ts` — optional `goal` (enum `Goal`), `weight`, `height`, `age` (numbers), `sex` (string), all `@IsOptional`.
- `[ ]` `users.service.ts` — `updateProfile(userId, dto)`: merge non-null fields, save, return.
- `[ ]` `users.controller.ts` — `PUT /users/me` (or `/users/me/profile`) → `updateProfile`, return `toPublicUser`.
- `[ ]` `web/src/api.ts` — `updateProfile(fields)` mirroring `setTrainingLevel`.
- `[ ]` `web/src/pages/Profile.tsx` — make rows editable (add an "Edit" state; `Goal` = `Select` of bulk/cut/maintain; number `Input`s for weight/height/age; `Select` male/female for sex). Reuse existing shadcn `Input`/`Select`/`Button`. On save, call `updateProfile` and refresh `useAuth` user.
- **Done when:** editing Profile persists and survives reload.

### 2.2 Meal logging + AI calorie parsing (flagship spec feature — §2.4/§5)

New 3rd data table (also satisfies the resume's "3-table schema"). Mirror the
coach module structure.

- `[ ]` `backend/src/meals/meal-log.entity.ts`:
  ```
  id uuid pk · user_id uuid · date date · raw_text text
  parsed_calories int · parsed_protein_g float · parsed_carbs_g float · parsed_fat_g float
  ai_confidence varchar · items_identified text[] (or jsonb) · created_at
  ```
  Register in `app.module.ts` `entities: [...]`.
- `[ ]` `backend/src/meals/meals.module.ts`, `meals.service.ts`, `meals.controller.ts`, `dto/create-meal-log.dto.ts` (`{ raw_text: string; date?: string }`).
- `[ ]` `meals.service.ts` — inject a Gemini client (copy from `coach.service.ts`). Prompt: "nutrition estimator, return strict JSON, assume common Indian portions, flag low confidence on vague input." Use `responseJsonSchema`:
  ```
  { calories:int, protein_g:int, carbs_g:int, fat_g:int,
    confidence: "low"|"medium"|"high", items_identified: string[] }
  ```
  Guard `finishReason`/empty text like coach does; `JSON.parse`. Then persist raw + parsed and return.
  `ponytail: single Gemini call, no retry; add one retry-on-parse-fail (spec §5.3) only if malformed JSON shows up in practice.`
- `[ ]` API: `POST /meal-logs` (parse+store, return result for user to confirm/edit), `GET /meal-logs?date=YYYY-MM-DD`, `GET /meal-logs/summary?range=week`.
- `[ ]` **Editable estimates** (spec insists): return parsed values to the client and let the user tweak before finalize — either a `PUT /meal-logs/:id` or accept edited values on create. Simplest: `POST` returns the estimate un-finalized, a second `POST /meal-logs/:id/confirm` (or the create already stores + a `PUT` edits). Pick the `PUT` route.
- `[ ]` `web/src/pages/Meals.tsx` + route in `App.tsx` + nav item in `Layout.tsx`. Textarea → submit → show parsed macros in editable fields (reuse `ai-loading.tsx` for the spinner) → confirm. List today's meals with a daily total.
- `[ ]` `web/src/api.ts` — `logMeal`, `getMeals(date)`, `getMealSummary(range)`, plus types.
- **Done when:** typing "2 rotis, dal, bowl of curd" returns editable macros and they save + appear in today's list.

### 2.3 Calorie targets + daily/weekly summary (spec §2.4/§7.6)

Depends on §2.1 (stats) and §2.2 (meals).

- `[ ]` `backend/src/users/calorie.ts` — pure `mifflinStJeor({weight,height,age,sex})` → BMR, then `target(goal)` (×activity factor; bulk +300–500, cut −300–500, maintain 0). Keep it a plain function. **Leave one runnable check** (`assert` on a known input) per ponytail — money/formula path.
- `[ ]` Expose target: add `calorie_target` to the dashboard (§2.5) or `GET /users/me/calorie-target`. 400 if stats missing → UI nudges to fill Profile.
- `[ ]` Web: on Meals page show **today's total vs target** (reuse shadcn `Progress`), and a weekly view from `GET /meal-logs/summary`.
- **Done when:** target computes from Profile stats and the day's meals show progress against it.

### 2.4 Advanced split builder (spec §2.2 Advanced / §4)

Only for `training_level = advanced`. Two more tables.

- `[ ]` `backend/src/splits/split.entity.ts`: `id · user_id · name · day_of_week (nullable) · order`.
- `[ ]` `split-exercise.entity.ts`: `id · split_id (FK, cascade) · exercise_id (FK) · target_sets · target_reps`.
- `[ ]` `splits.module/service/controller` + DTOs. Register entities in `app.module.ts`.
- `[ ]` API: `POST /splits`, `GET /splits/me`, `PUT /splits/:id`, `POST /splits/:id/exercises` — all `@UseGuards(JwtAuthGuard)`, scoped to `req.user.id`.
- `[ ]` Web: split builder page (advanced only) — create split days, assign exercises from `GET /exercises`, set target sets/reps, reorder. Wire `LogWorkout` to prefill from the chosen split day.
- **Done when:** an advanced user builds a Push/Pull/Legs split and logs against a split day.
- `ponytail:` Beginner/Intermediate never touch this — gate the route by level, don't build a split UI for them.

### 2.5 Smaller spec gaps (optional / nice-to-have)

- `[ ]` `GET /users/me/dashboard` (spec §4) — level-aware home payload. Home currently assembles from separate calls; add this only if you want one round-trip. `ponytail: skip unless Home feels slow — the existing calls already work.`
- `[ ]` `equipment_type` on `Exercise` + `machine_used` on `WorkoutLogEntry` (spec §2.3). Add the columns + surface a free-text "machine" field in `LogWorkout`. Low priority.

---

## 3. Env var reference

| Var | Where | Local | Prod |
|---|---|---|---|
| `PORT` | backend | 3000 | injected by Railway |
| `DB_HOST/PORT/USERNAME/PASSWORD/NAME` | backend | docker-compose values | Railway Postgres refs |
| `JWT_SECRET` | backend | any | `openssl rand -hex 32` |
| `GEMINI_API_KEY` | backend | your key | your key |
| `WEB_ORIGIN` | backend | unset (CORS open) | Vercel URL |
| `VITE_API_BASE_URL` | web | `http://localhost:3000` | Railway backend URL |

## 4. Local dev quickstart

```bash
docker compose up -d                       # Postgres
cd backend && cp .env.example .env         # first time; add GEMINI_API_KEY
npm install && npm run start:dev           # http://localhost:3000

cd ../web && cp .env.example .env          # first time
npm install && npm run dev                 # http://localhost:5173
```
