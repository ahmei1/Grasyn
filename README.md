# Grasyn

Grasyn is a connected work environment for small software teams. This repository is the **Phase 1 MVP**: authentication, workspaces, members, projects, tasks, comments, activity, notifications, and a dashboard.

The product idea is not “another Jira.” It is a **shared team context** that later phases can hang communication, GitHub, meetings, and AI on top of — without rewriting the core.

## How we split the work

- **Frontend** (`frontend/`): React + Vite + JavaScript + Tailwind. You own screens, states, and the design system.
- **Backend** (`backend/`): NestJS + TypeScript + Prisma + PostgreSQL. Modular API with Swagger as the contract.
- **Docs** (`documents/`): SRS and vision.

## Run locally (Day 1)

You need Node 22+ and PostgreSQL. Docker is preferred for Postgres if your user can access the Docker socket (`docker compose up -d postgres`). Otherwise point `backend/.env` at a local Postgres database named `grasyn`.

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env   # already created for local dev
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev            # http://localhost:4000/api/health
                       # Swagger: http://localhost:4000/api/docs

# 3. Frontend
cd frontend
cp .env.example .env
npm run dev            # http://localhost:5173
```

Demo accounts (password `Demo1234!`):

- `alex@grasyn.dev` — workspace owner
- `jordan@grasyn.dev` — admin
- `sam@grasyn.dev` — member

## What the backend is doing (briefing)

Every row that belongs to a team carries `workspaceId`. Authorization is **server-side**: `AccessService.requireMembership` runs before any project, task, comment, or dashboard query. That is tenant isolation.

Auth uses **httpOnly cookies**, not `localStorage`:

- `grasyn_access` — short-lived JWT (15 minutes)
- `grasyn_refresh` — random token, hashed in Postgres, rotated on refresh

Passwords are hashed with **argon2**. Roles: `OWNER`, `ADMIN`, `MEMBER`. Only owner/admin can invite, change roles, or remove members.

Activity events are written when work changes. Notifications are created when a task is assigned or commented on. AI is **not** in this MVP on purpose.

```text
Browser (Vite)
    REST + cookies
NestJS modules (auth, users, workspaces, projects, tasks, comments, activity, notifications, dashboard)
    Prisma
PostgreSQL
```

## API shape

Base URL: `http://localhost:4000/api`

Errors always look like `{ "code": "UNAUTHORIZED", "message": "…" }`.

Lists that can grow are paginated: `?page=1&pageSize=20` with `{ meta: { total, page, pageSize, pageCount } }`.

Open **http://localhost:4000/api/docs** while building UI — do not hard-code surprise URLs.

## Frontend

The web app in `frontend/` is built by Ahmed. Only the toolchain is set up (Vite, Tailwind, `VITE_API_URL`); the screens, components, and state are his to design.

Agreed conventions: JavaScript, Tailwind, feature folders, and every screen handles **loading / empty / error / success**.

## Tests

```bash
cd backend
npm test          # auth hashing + tenant isolation / RBAC
npm run test:e2e  # health check (needs app boot)
```

## Deploy

Production-shaped stack:

```bash
docker compose -f docker-compose.prod.yml up --build
```

- App: http://localhost:8080
- API: http://localhost:4000

Set `JWT_ACCESS_SECRET`, `COOKIE_SECURE=true`, and `FRONTEND_ORIGIN` to your real HTTPS origin before exposing this to a network.

Alternative hosting that matches a portfolio demo:

- Postgres: Neon or Railway
- API: Railway / Fly / Render (run `prisma migrate deploy` then `node dist/main.js`)
- UI: Vercel or Netlify (`VITE_API_URL` pointing at the API)

## After this MVP

Phase 2 realtime + channels, Phase 3 GitHub, Phase 4 meetings/knowledge, Phase 5 AI catch-up. Do not start those until a stranger can complete the workspace → project → task loop on the live URL.
