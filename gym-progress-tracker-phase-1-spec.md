# Gym Progress Tracker — Phase 1 Spec

## 1. Overview

A cross-platform (mobile + web) fitness tracking app that personalizes the user's experience based on training level, lets users log daily workouts in detail, and includes an AI-powered food-logging feature that estimates calorie intake from free-text descriptions to support bulk/cut goals.

Recommended stack (leverages Flutter for a single mobile+web codebase, NestJS for the backend — both used previously in the KSA project):

- **Frontend:** Flutter (mobile + web from one codebase)
- **Backend:** NestJS (Node/TypeScript)
- **Database:** PostgreSQL
- **AI layer:** Claude API (Anthropic) for free-text food parsing → structured nutrition estimate
- **Auth:** Email/password + optional Google sign-in (Firebase Auth or NestJS + JWT — pick one; Firebase is faster to ship for Phase 1)

## 2. User Flow

### 2.1 Onboarding

1. Sign up / log in.
2. First-time users are asked: Beginner / Intermediate / Advanced.
3. This selection is stored on the user profile (`training_level`) and can be changed later in settings.
4. Based on level, route to a tailored home experience.

### 2.2 Level-Specific Home Pages

| Level | Home Page Behavior |
|---|---|
| Beginner | Shows a curated starter program: fixed list of foundational exercises (e.g. squat, bench, deadlift, overhead press, rows) with sets/reps guidance and short form notes. No custom exercise creation yet — reduces decision fatigue. |
| Intermediate | Shows suggested exercises (from the same curated library, expanded) plus an "Add your own exercise" option. User can build a personal exercise list. |
| Advanced | Full control: user defines their own split (e.g. Push/Pull/Legs, Bro Split, Upper/Lower), assigns exercises to each day from the library or custom entries, and can reorder/edit the split at any time. |

### 2.3 Daily Workout Logging

After a session, the user logs what they actually did:

- Exercise (from their plan or ad-hoc)
- Equipment/machine used (free text or from a machine list, e.g. "Smith Machine", "Cable Row")
- Weight used (with unit: kg/lb)
- Sets × reps
- Optional: notes, RPE (perceived effort), or a "felt easy/hard" tag

This log is timestamped and tied to the user's chosen split day (if Advanced) or just a general log (Beginner/Intermediate).

### 2.4 Bulk/Cut Calorie Tracking

- User sets a goal: Bulk / Cut / Maintain.
- User logs meals as free text (e.g. "2 rotis, dal, and a bowl of curd").
- An AI agent (Claude API call from the backend) parses the text and returns an estimated structured breakdown: calories, protein, carbs, fat, and a confidence note (since it's an estimate, not a barcode scan).
- Daily and weekly calorie totals are shown against a target (calculated from the user's stats + goal, e.g. via Mifflin-St Jeor formula for BMR, adjustable).

## 3. Data Model (Phase 1)

```
User
- id, email, password_hash, name
- training_level: enum(beginner, intermediate, advanced)
- goal: enum(bulk, cut, maintain)
- weight, height, age, sex (for calorie target calc)
- created_at

Exercise (library — seeded + user-created)
- id, name, muscle_group, equipment_type, is_custom, created_by_user_id (nullable)

Split (Advanced only)
- id, user_id, name (e.g. "Push Day"), day_of_week (optional), order

SplitExercise
- id, split_id, exercise_id, target_sets, target_reps

WorkoutLog
- id, user_id, date, split_id (nullable)

WorkoutLogEntry
- id, workout_log_id, exercise_id, machine_used, weight, weight_unit, sets, reps, notes

MealLog
- id, user_id, date, raw_text, parsed_calories, parsed_protein, parsed_carbs, parsed_fat, ai_confidence_note, created_at
```

## 4. Core API Endpoints (Phase 1)

```
POST   /auth/signup
POST   /auth/login

PUT    /users/me/training-level        # set/change beginner/intermediate/advanced
PUT    /users/me/goal                  # bulk/cut/maintain
GET    /users/me/dashboard             # level-aware home data

GET    /exercises                      # library, filterable by level/muscle group
POST   /exercises                      # user creates custom exercise (intermediate/advanced)

POST   /splits                         # advanced: create a split
GET    /splits/me
PUT    /splits/:id
POST   /splits/:id/exercises           # assign exercise to a split day

POST   /workout-logs                   # log a day's workout
GET    /workout-logs?range=week|month

POST   /meal-logs                      # { raw_text: "..." } -> triggers AI parse, returns structured result
GET    /meal-logs?date=YYYY-MM-DD
GET    /meal-logs/summary?range=week
```

## 5. AI Calorie Agent — Design

**Trigger:** `POST /meal-logs` with `{ raw_text: string }`

Backend flow:

1. Receive raw text.
2. Call Claude API with a system prompt instructing it to act as a nutrition estimator and return strict JSON only (no prose), e.g.:

    ```json
    {
      "calories": 450,
      "protein_g": 18,
      "carbs_g": 60,
      "fat_g": 12,
      "confidence": "medium",
      "items_identified": ["roti x2", "dal", "curd"]
    }
    ```

3. Parse and validate the JSON (guard against malformed output — retry once if parsing fails).
4. Store both `raw_text` and the parsed structured fields in `MealLog`.
5. Return the parsed result to the client for the user to confirm/edit before it's finalized (important — AI estimates should be editable, not silently trusted).

Notes:

- Keep portion-size ambiguity in mind — the prompt should ask Claude to make reasonable assumptions for common Indian food portions and flag low confidence when the description is vague (e.g. "some rice").
- Phase 2 candidate: let users correct estimates, and feed corrections back as few-shot examples per user to improve accuracy over time.

## 6. Explicitly Out of Scope for Phase 1

(to keep the first build focused — flag these for Phase 2+)

- Social features (friends, leaderboards, sharing)
- Progress photos / body measurements tracking
- Wearable integrations (Apple Health, Google Fit)
- Barcode scanning for packaged food
- Push notifications / reminders
- Auto-generated periodized programs (e.g. progressive overload auto-suggestions)

## 7. Suggested Build Order

1. Auth + user profile + training-level onboarding
2. Exercise library (seed data) + level-specific home pages
3. Workout logging (CRUD) + basic history view
4. Advanced-only split builder
5. Meal logging UI + AI parsing endpoint integration
6. Calorie target calculation + daily/weekly summary views
