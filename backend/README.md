# GraSyn backend

NestJS 11 + TypeScript + Prisma 6 + PostgreSQL API.

- [Start here: study roadmap and frontend next steps](docs/START_HERE.md): a beginner-friendly path from frontend to backend.
- [Backend learning guide](docs/BACKEND_GUIDE.md): understand the code, trace requests, and practice.
- [Review report](docs/REVIEW.md): fixes, verification, and remaining limitations.
- Swagger: `http://localhost:4000/api/docs` when running.

## Local setup

Use Node.js 22+ and a running PostgreSQL database. From `backend/`:

```bash
npm ci
# Only on first setup; preserve an existing .env:
cp -n .env.example .env
# Generate a secret, then put it in JWT_ACCESS_SECRET in .env:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

Set `DATABASE_URL` to your database. The sample JWT secret is deliberately rejected: replace it with the generated value. `FRONTEND_ORIGIN` must match the browser origin exactly (no trailing slash). Use `credentials: 'include'` in frontend fetch requests.

Existing migrations are installed with `prisma migrate deploy`. When developing an intentional schema change, edit `prisma/schema.prisma`, then use `prisma migrate dev --name descriptive_change` against a development database.

## Optional demo data — deletes existing data

Only use a disposable development database:

```bash
ALLOW_DESTRUCTIVE_SEED=true npm run prisma:seed
```

The seed erases all existing users and workspaces before creating demo accounts. It refuses to run in production. Demo logins: `alex@grasyn.dev`, `jordan@grasyn.dev`, `sam@grasyn.dev`; password `Demo1234!`.

## Verification

```bash
npm test -- --runInBand
npx eslint '{src,test}/**/*.ts'
npm run build
npx prisma validate
npm run test:e2e -- --runInBand
```

Integration tests require a migrated PostgreSQL database and `.env`. Prefer a dedicated test database. They create unique test accounts and clean up their own rows; they do not seed or reset the database. An interrupted test run can leave test rows behind.

`npm run lint` also fixes lint/formatting issues; use the command above for a read-only lint check.

## Configuration

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Random secret, at least 32 characters; never commit |
| `JWT_ACCESS_EXPIRES` | Positive duration with unit `s`, `m`, `h`, or `d`; default `15m` |
| `REFRESH_EXPIRES_DAYS` | Integer 1–365; default 7 |
| `FRONTEND_ORIGIN` | Single allowed frontend origin; default `http://localhost:5173` |
| `COOKIE_SECURE` | `true` sends cookies only over HTTPS; production requires it |
| `PORT` | Listening port; default 4000 |
| `NODE_ENV` | Set `production` for deployment; requires an HTTPS frontend origin |

Cookies use `SameSite=Lax`. For deployment, serve frontend and API on the same site (for example `app.example.com` and `api.example.com`, both HTTPS). Unrelated hosting domains require a deliberate cookie/CSRF design change. Behind a reverse proxy, configure trusted proxy addresses and HTTPS termination for your host; the app does not currently configure Express trust proxy.

Docker excludes `.env`, local dependencies, and build output through `.dockerignore`. The existing container command applies migrations before starting. Container builds/deployment were not validated during this review.
