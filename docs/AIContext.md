# PostPilot — AI Context

Единый контекст для агентов и новых задач. Читай этот файл перед нетривиальной работой.

**Backlog / tech debt:** [TODO.md](./TODO.md)  
**Ship progress (DoD, модули):** [ship-modules.md](./ship-modules.md)  
**Cursor rules:** `.cursor/rules/`

---

## Product

**PostPilot** — SaaS для автоматизации ведения Telegram-каналов: создание постов, AI-помощь (MVP+), календарь, автопостинг, аналитика.

**Позиционирование:** платформа для управления Telegram-каналом как медиа-активом — не «ещё один бот для постинга».

**Аудитория:** авторы и эксперты, тематические каналы, медиа-команды, агентства, владельцы сеток каналов.

**Боли:** нерегулярные публикации, ручная рутина (copy-paste в Telegram), нет единого workflow, слабое понимание эффективности постов.

### Pre-MVP vs MVP

| | Pre-MVP | MVP |
|---|---------|-----|
| **Цель** | Проверить: админ готов писать и публиковать из одного кабинета | Стабильнее публиковать, меньше ручного времени, базовая аналитика |
| **Каналы** | 1 канал на пользователя | 1–5 каналов |
| **Scope** | auth → пост → publish now | + media, schedule, AI, analytics, multi-channel |
| **Документ** | [pre-mvp.md](./pre-mvp.md) | [MVP.md](./MVP.md) |

**JTBD Pre-MVP:** написал пост → сохранил черновик → опубликовал в канал → видит историю.

**Текущий фокус:** Module 6 — Product Gate (Pre-MVP closure).

---

## Architecture (as-built)

Monorepo: `client/` (SPA) + `api/` (NestJS). Root `package.json` — dev orchestration (concurrently, docker).

```
PostPilot/
├── client/          # React 19 + Vite 8 + TypeScript
├── api/             # NestJS 11 + Prisma 7 + PostgreSQL
├── e2e/             # Playwright regression (scaffold)
├── infra/           # Caddyfile
├── docs/            # документация
└── docker-compose.yml
```

### Backend (`api/`)

**Pattern:** NestJS modular monolith — Controller → Service → Prisma.

| Module | Route prefix | Назначение |
|--------|--------------|------------|
| HealthModule | `/api/health` | status + db check (public) |
| AuthModule | `/api/auth` | register, verify, login, logout, me |
| PostsModule | `/api/posts` | CRUD + publish |
| ChannelsModule | `/api/channels` | connect, list |
| BotConnectionsModule | `/api/bot` | per-user bot token (encrypted) |
| TelegramModule | — | Telegram Bot API (internal) |
| EmailModule | — | Resend verification emails |
| BillingModule | — | channel limits / plan |

- Global prefix: `/api`
- Auth: HttpOnly cookie session (`SESSION_COOKIE_NAME`), global `AuthGuard`, `@Public()` для open routes
- Validation: Zod
- Prisma 7: output `api/src/generated/prisma`, `moduleFormat = "cjs"`
- Secrets: только `api/.env`; bot token encrypted (`BOT_TOKEN_ENCRYPTION_KEY`)

**Models:** User, Session, EmailVerification, Post, PostMedia, Channel, BotConnection

### Frontend (`client/`)

**Stack:** React 19, Vite, TypeScript, React Router 7, Redux Toolkit + RTK Query, React Hook Form + Zod, shadcn/ui + Tailwind 4, Sonner toasts.

**Текущая структура (legacy, pre-FSD):**

```
client/src/
  pages/       # route screens
  layouts/     # AuthLayout, ServiceLayout, LandingLayout
  components/  # ui/ (shadcn), landing/, auth/, service/
  store/       # Redux store, auth slice, RTK Query (posts-api)
  utils/       # Zod schemas, fetch wrappers
  lib/         # cn() helper
```

**Целевая структура (FSD minimum, после M6):** `app/` → `pages/` → `widgets/` → `features/` → `entities/` → `shared/`. См. [TODO.md § C](./TODO.md).

**API calls:** relative `/api/...`, Vite proxy → `:3000`, always `credentials: 'include'`.

**UI:** [designSystem.md](./designSystem.md) — «Signal in Motion».

---

## Dev setup

```bash
cp .env.example .env
cp api/.env.example api/.env
npm install && npm --prefix api install && npm --prefix client install
npm run db:up
npm run dev
```

| URL | Назначение |
|-----|------------|
| http://localhost:5173 | Frontend |
| http://localhost:3000/api/health | API direct |
| http://localhost:5173/api/health | API via Vite proxy |

### Env vars (ключевые)

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | root `.env`, `api/.env` | PostgreSQL connection |
| `PORT` | `api/.env` | API port (default 3000) |
| `SESSION_COOKIE_NAME` | `api/.env` | Cookie name for auth |
| `BOT_TOKEN_ENCRYPTION_KEY` | `api/.env` | AES key for bot tokens (prod required) |
| `RESEND_API_KEY` | `api/.env` | Email delivery |
| `APP_PUBLIC_URL` | `api/.env` | Links in verification emails |
| `CORS_ORIGIN` | `api/.env` | Production CORS |
| `VITE_SENTRY_DSN` | client env | Sentry (optional) |
| `SENTRY_DSN` | `api/.env` | Sentry (optional) |

Полные списки: [`.env.example`](../.env.example), [`api/.env.example`](../api/.env.example).

### Scripts (root)

| Script | Action |
|--------|--------|
| `npm run dev` | API + Client concurrently |
| `npm run dev:api` | NestJS watch |
| `npm run dev:client` | Vite dev |
| `npm run db:up` / `db:down` | Postgres docker |
| `npm run build` | API + client production build |
| `npm run test:e2e` | Playwright (root) |
| `npm run prod:up` | Docker production stack |

---

## Ship progress (Pre-MVP)

| Module | Status | Summary |
|--------|--------|---------|
| M0 Foundation | ✅ | Docker Postgres, health, Prisma, Vite proxy |
| M1 Auth | ✅ | Cookie auth, register/login/verify |
| M2 Posts | ✅ | Posts CRUD, list/editor |
| M3 Channel | ✅ | 1 channel, bot token, connect |
| M4 Publish | ✅ | Publish to Telegram, statuses |
| M5 Polish | ✅ | UI polish, Docker deploy docs |
| **M6 Gate** | ⬜ | Product gate, Pre-MVP closure |

Детали, DoD, Study guide: [ship-modules.md](./ship-modules.md).

**MVP modules (после M6):** M7 Infra → M8 Multi-channel → … → M14 Hardening (Sentry full, CI, rate limits).

---

## Deploy

### Vercel + Render (beta, recommended)

Frontend на Vercel, API + Postgres на Render. SPA `/api/*` → proxy → Render API.

→ [deploy-vercel-render.md](./deploy-vercel-render.md)

### Docker VPS

Postgres + API + static client + Caddy (HTTPS).

→ [deploy.md](./deploy.md)

### Email

Resend setup для verification emails.

→ [email-delivery.md](./email-delivery.md)

---

## Tests & observability

| Layer | Tool | Location |
|-------|------|----------|
| API unit | Jest | `api/src/**/*.spec.ts` |
| API e2e | Jest + supertest | `api/test/` |
| Browser e2e | Playwright | `e2e/specs/` |
| Errors | Sentry (optional) | `client/src/shared/lib/sentry.ts`, `api/src/instrument.ts` |

Regression flows: auth, posts CRUD, channel connect, publish. См. [TODO.md § D](./TODO.md).

---

## Out of scope (Pre-MVP)

- AI assistant, calendar scheduling, analytics
- Multi-channel, media uploads
- Redis, BullMQ, webhooks
- Full CI/CD, rate limits, audit log → MVP / M14

---

## Language & conventions

- Ответы агенту — **русский**
- Код, комментарии, commit messages — **English**
- Ship mode: один модуль = одна сессия ([postpilot-ship-mode.mdc](../.cursor/rules/postpilot-ship-mode.mdc))
- Минимальный diff, без over-engineering, match existing patterns
