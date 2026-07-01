# PostPilot — инфраструктурный бэклог

Единый список задач по архитектуре, тестам, observability, документации и Cursor rules.

**Primary context для AI:** [`AIContext.md`](./AIContext.md)  
**Ship progress:** [`ship-modules.md`](./ship-modules.md)  
**Текущий фокус:** Module 6 — Gate

---

## Приоритеты

| P | Задача | Когда | Статус |
|---|--------|-------|--------|
| P0 | Этот файл (`TODO.md`) | Сейчас | ✅ |
| P1 | `AIContext.md` + Cursor rules | Параллельно с M6 | см. блоки A, B |
| P2 | Playwright scaffold + API e2e | После M6 | см. блок D |
| P2 | Sentry basic (DSN + init) | Перед beta / M7 | см. блок E |
| P3 | FSD migration (incremental) | После M6, в MVP-модулях | см. блок C |
| P4 | CI + full regression | Module 14 Hardening | см. блок D |

---

## A — Единый контекст для AI

**Цель:** один файл [`AIContext.md`](./AIContext.md) — source of truth для агентов и новых задач.

### Чеклист

- [x] Создать `docs/AIContext.md` с секциями Product, Architecture, Dev, Ship, Deploy, Design
- [ ] Сократить [`main.md`](./main.md) до hub (3–5 строк + ссылки)
- [ ] Обновить [`README.md`](../README.md) — ссылка на `AIContext.md` вместо разрозненных docs
- [ ] Review и удаление дублей (после проверки):
  - [ ] [`idea.md`](./idea.md) → Product в AIContext
  - [ ] [`clients.md`](./clients.md) → Product в AIContext
  - [ ] [`troublesWeSolve.md`](./troublesWeSolve.md) → Product в AIContext
  - [ ] [`futureAUTH.md`](./futureAUTH.md) → устарел (auth в M1), архивировать/удалить
  - [ ] [`cursor-rules.md`](./cursor-rules.md) → заменить ссылкой на `.cursor/rules/`

### Не трогаем (deep-dive)

- [`ship-modules.md`](./ship-modules.md), [`pre-mvp.md`](./pre-mvp.md), [`MVP.md`](./MVP.md)
- [`deploy.md`](./deploy.md), [`deploy-vercel-render.md`](./deploy-vercel-render.md), [`email-delivery.md`](./email-delivery.md)
- [`designSystem.md`](./designSystem.md), [`production-service-tech-plan.md`](./production-service-tech-plan.md)

---

## B — Cursor rules для PostPilot

**Проблема:** шаблон QuizoO лежал в `.cursor/.cursor/rules/` — неверный путь и содержание.

### Чеклист

- [x] Создать `.cursor/rules/` (стандартный путь Cursor)
- [x] Адаптировать rules под PostPilot (`client/`, `api/`, RTK Query, ship mode)
- [x] Удалить `.cursor/.cursor/` (QuizoO)
- [x] Синхронизировать [`cursor-rules.md`](./cursor-rules.md)

### Файлы rules

| Файл | Scope | Назначение |
|------|-------|------------|
| `index.mdc` | always | Overview, stack, AIContext, язык |
| `postpilot-ship-mode.mdc` | always | M0→M6 workflow, один модуль = сессия |
| `postpilot-client.mdc` | `client/**` | FSD target, RTK Query, shadcn, Zod |
| `postpilot-api.mdc` | `api/**` | NestJS modular, Prisma, cookie auth |
| `tests.mdc` | `**/*.spec.ts`, `e2e/**` | Jest + Playwright, regression policy |

### FSD import rules (client)

```
app → pages → widgets → features → entities → shared
```

Legacy `pages/`, `components/`, `store/`, `utils/` — допустимы до миграции. **Новый код после M6** — по FSD.

---

## C — FSD migration (после M6 Gate)

**Timing:** после закрытия Pre-MVP (M6). Incremental, без big-bang.

### Текущая структура

```
client/src/
  pages/, layouts/, components/, store/, utils/, lib/
```

### Целевая (FSD minimum)

```
client/src/
  app/        # providers, router (main.tsx, App.tsx, router.tsx)
  pages/      # route screens only
  widgets/    # ServiceSidebar, landing sections
  features/   # createPost, publishPost, connectChannel, login
  entities/   # post, channel, user + RTK Query
  shared/     # ui/, lib/, config/
```

### Чеклист

- [x] Создать каркас слоёв (`app/`, `shared/`, `entities/`, `features/`, `widgets/`)
- [ ] Перенести `components/ui/` → `shared/ui/`
- [ ] Вынести domain API из `utils/` + `store/api/` → `entities/*/api/`
- [ ] Выделить features из dashboard pages (publish, connect channel)
- [ ] ESLint rule / [Steiger](https://github.com/feature-sliced/steiger) — import boundaries (опционально)
- [ ] Обновить alias `@/` и `vite.config.ts` при необходимости

**Не входит в Pre-MVP:** полная миграция всех 20+ pages — миграция по мере MVP-модулей (M7+).

---

## D — Playwright + regression tests

**Сейчас:** API e2e устарел; client tests отсутствуют; CI нет.

### Целевая структура

```
e2e/
  playwright.config.ts
  fixtures/           # auth helper, test user
  specs/
    auth.spec.ts
    posts-crud.spec.ts
    channel-connect.spec.ts
    publish.spec.ts   # smoke / mock Telegram
```

### Critical flows (Pre-MVP core)

1. Register → verify email (mock/skip in CI) → login → logout
2. Create post → edit → save draft
3. Connect channel (bot token — test fixtures)
4. Publish post (mock Telegram API или staging bot)

### Чеклист

- [x] Scaffold `e2e/` + Playwright config
- [x] Smoke spec: landing page loads
- [x] Починить API e2e: `GET /api/health`
- [ ] Auth flow spec (register → login)
- [ ] Posts CRUD spec
- [ ] Channel connect spec
- [ ] Publish spec (mock Telegram)
- [ ] API unit tests: auth, posts CRUD, publish service, bot-token crypto
- [ ] CI (GitHub Actions / GitLab): `lint` + `test` + `playwright` на PR → **M14 Hardening**

### Regression policy

- При добавлении фич — critical flows должны проходить
- Не удалять passing tests без явной причины
- Grading/business-logic changes → unit tests обязательны

---

## E — Sentry (глобальное логирование)

**Сейчас:** только NestJS `Logger` в отдельных сервисах. Sentry упомянут в M14 и `production-service-tech-plan.md`.

### Client (`client/src/`)

- [x] `@sentry/react` — init в `shared/lib/sentry.ts`, подключение в `main.tsx`
- [x] Env: `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` в `.env.example`
- [ ] `@sentry/vite-plugin` — source maps в production build
- [ ] Error boundary component
- [ ] Не логировать PII (email, tokens)

### API (`api/src/`)

- [x] `@sentry/nestjs` — instrument + init в `instrument.ts`, import first в `main.ts`
- [x] Env: `SENTRY_DSN`, `SENTRY_ENVIRONMENT` в `api/.env.example`
- [ ] Global exception filter → Sentry (расширить при необходимости)
- [ ] Structured context: userId (без email), route, requestId

### Операционка

- [ ] Sentry project (free tier для beta)
- [ ] Alert rules на spike errors
- [ ] Release tracking (git SHA)
- [ ] Полная настройка → **M14 Hardening**

**Timing:** базовый init — перед beta; полная observability — M14.

---

## Связь с ship-modules

| Задача | Модуль |
|--------|--------|
| Pre-MVP core flows | M0–M5 ✅ |
| Product gate | **M6** (сейчас) |
| Playwright setup, infra | M7 Infra |
| Sentry full + CI + rate limits | M14 Hardening |
