# Trendomic Backend

Production-grade NestJS backend for **Trendomic** SaaS: modular monolith with PostgreSQL, Prisma, JWT auth, scheduling, analytics, physics/math engine, and third-party integrations.

## Stack

- **NestJS** (TypeScript)
- **PostgreSQL** + **Prisma**
- **JWT** (access + refresh tokens)
- **class-validator** / **class-transformer**
- **Passport** (JWT strategies)
- **Throttler** (rate limiting)

## Quick start

### 1. Install & DB

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 2. Run

```bash
npm run start:dev
```

API base: `http://localhost:3000/api` (or `API_PREFIX` from `.env`).

### 3. Docker (full stack)

```bash
docker-compose up -d
# Backend: http://localhost:3000
# Postgres: localhost:5432
```

### 4. Dev with local backend + DB in Docker

```bash
docker-compose -f docker-compose.dev.yml up -d
# Then: npm run start:dev
# DATABASE_URL=postgresql://trendomic:trendomic_secret@localhost:5432/trendomic
```

## API Endpoints

| Area | Method | Path | Description |
|------|--------|------|-------------|
| **Auth** | POST | `/api/auth/signup` | Register |
| | POST | `/api/auth/login` | Login |
| | POST | `/api/auth/refresh` | Refresh token (body: `refreshToken`) |
| **Users** | GET | `/api/users` | List users (ADMIN) |
| | GET | `/api/users/:id` | Get user |
| | PUT | `/api/users/:id` | Update user |
| | DELETE | `/api/users/:id` | Delete user |
| **Schedules** | GET | `/api/schedules` | List schedules |
| | POST | `/api/schedules` | Create schedule |
| | GET | `/api/schedules/:id` | Get schedule |
| | PUT | `/api/schedules/:id` | Update schedule |
| | DELETE | `/api/schedules/:id` | Delete schedule |
| **Analytics** | POST | `/api/analytics` | Create event |
| | GET | `/api/analytics` | List all (ADMIN) |
| | GET | `/api/analytics/stats` | Stats |
| | GET | `/api/analytics/:userId` | Events by user |
| **Compute** | POST | `/api/compute/vector` | Vector ops |
| | POST | `/api/compute/matrix` | Matrix (multiply, determinant, inverse, add, transpose) |
| | POST | `/api/compute/ode` | ODE (Euler / RK4) |
| | POST | `/api/compute/pde` | PDE (heat, laplace) |
| | POST | `/api/compute/numerical` | Numerical (sum, mean, variance, integrate, differentiate) |
| **Integrations** | GET | `/api/integrations/youtube/status` | YouTube status |
| | GET | `/api/integrations/later/status` | Later status |
| | GET | `/api/integrations/buffer/status` | Buffer status |
| | POST | `/api/integrations/webhook/zapier` | Zapier webhook |
| | POST | `/api/integrations/webhook/generic` | Generic webhook (sign with `x-webhook-signature`) |

Protected routes (except auth and webhooks) require header: `Authorization: Bearer <accessToken>`.

## Folder structure

```
src/
  auth/           # Signup, login, refresh, JWT strategies
  users/          # Profile, RBAC
  scheduling/     # Schedules CRUD
  analytics/      # Events, stats
  physics-math/   # Compute engine (vector, matrix, ODE, PDE, numerical)
  integrations/   # Third-party + webhooks
  prisma/         # PrismaService (global)
  common/         # Guards, decorators, filters
  main.ts
  app.module.ts
prisma/
  schema.prisma
  seed.ts
```

## Security

- JWT access (short-lived) + refresh tokens
- Rate limiting (Throttler)
- Input validation (ValidationPipe + class-validator)
- Role guard (`@Roles(ADMIN)`) and `@Public()` for auth bypass
- Webhook signature verification (HMAC SHA-256)

## Seed user

After `npm run prisma:seed`:

- **Email:** `admin@trendomic.com`
- **Password:** `Admin123!`
- **Role:** ADMIN

Change in production.
