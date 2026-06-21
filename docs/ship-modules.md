# PostPilot — Ship Modules

Один модуль = **одна сессия/чат** в **Ship mode**.


| Роль   | Действие                                            |
| ------ | --------------------------------------------------- |
| **AI** | Собирает модуль целиком, рабочий код в репо         |
| **Ты** | Изучаешь diff, гоняешь DoD, задаёшь вопросы по коду |


**Формат сессии:**

1. «Делаем Module N» → AI ship'ит
2. Ты проходишь **Study guide** (файлы + вопросы)
3. DoD галочки → следующий модуль

**Связанные документы:** [pre-mvp.md](./pre-mvp.md) · [MVP.md](./MVP.md)

## Прогресс


| Модуль        | Статус | Что вошло                                                                   |
| ------------- | ------ | --------------------------------------------------------------------------- |
| M0 Foundation | ✅      | Docker Postgres, Nest `/api/health` + DB, Prisma 7, Vite proxy, dev scripts |
| M1 Auth       | ✅      | User + Session (Prisma), cookie auth, guard, login/register/logout/me, simple UI |
| M2 Posts      | ✅      | Post model + status enum, posts CRUD API, list/editor pages, TanStack Query |


---

## Карта модулей

```text
Pre-MVP
──────────────────────────────────────────────────────────
M0 Foundation     → M1 Auth → M2 Posts → M3 Channel → M4 Publish → M5 Polish → M6 Gate

MVP (после M6)
──────────────────────────────────────────────────────────
M7 Infra → M8 Multi-channel → M9 Media → M10 Schedule → M11 Confirm → M12 AI → M13 Analytics → M14 Hardening
```

---

## Module 0 — Foundation (Dev Platform)

**Статус:** ✅ готов

**Цель:** локально поднимается стек `Postgres + API + Client`, API видит БД.

**Scope:**

- [x] Docker Postgres
- [x] NestJS API + `GET /health` (status + db)
- [x] Prisma 7 + adapter-pg + migrate init
- [x] Vite proxy `/api` → `localhost:3000`
- [x] Скрипты/README: как поднять всё за 2 команды

**Deliverables:**

- `docker-compose.yml`
- `api/` — Nest, PrismaModule, HealthModule
- `client/` — proxy в `vite.config.ts`
- `.env.example` (корень + `api/`)

**DoD — проверь руками:**

```bash
docker compose up -d
cd api && npm run start:dev          # :3000/health → db: up
cd client && npm run dev             # :5173 открывается
curl http://localhost:5173/api/health  # proxy работает
```

**Study guide — что разобрать в коде:**


| Файл                               | Вопрос себе                                 |
| ---------------------------------- | ------------------------------------------- |
| `docker-compose.yml`               | Куда мапится порт Postgres?                 |
| `api/src/main.ts`                  | Зачем CORS и `credentials: true`?           |
| `api/src/prisma/prisma.service.ts` | Почему adapter-pg, а не голый PrismaClient? |
| `api/src/health/health.service.ts` | Чем liveness отличается от readiness?       |
| `api/prisma/schema.prisma`         | Зачем `moduleFormat = "cjs"`?               |


**Зависимости:** нет  
**Следующий:** Module 1 — Auth

---

## Module 1 — Auth

**Статус:** ✅ готов

**Цель:** пользователь регистрируется, логинится, сессия живёт после F5.

**Scope:**

- [x] Prisma: модель `User`
- [x] API: register, login, logout, `GET /me`
- [x] Cookie session (HttpOnly), bcrypt пароль, Zod validation
- [x] Guard на защищённых роутах
- [x] Client: React Router, Login/Register, TanStack Query
- [x] Protected layout — без логина в кабинет не попасть

**Не входит:** workspace, RBAC, CSRF (→ MVP Module 14)

**Deliverables:**

- `api/src/auth/` — module, controller, service, guard, DTO
- `api/prisma` — migration `add_user`
- `client/src/pages/` — login, register
- `client/src/api/` — auth hooks (TanStack Query)

**DoD:**

- [x] Register → Login → попал в кабинет
- [x] F5 — всё ещё залогинен
- [x] Logout → редирект на login
- [x] `GET /api/auth/me` без cookie → 401

**Study guide:**


| Тема                                   | Где смотреть                              |
| -------------------------------------- | ----------------------------------------- |
| Почему cookie, а не JWT в localStorage | `auth.service.ts`, `main.ts` CORS         |
| Как hash пароля                        | register flow                             |
| Nest Guard                             | `auth.guard.ts` + декоратор `@Public()`   |
| Frontend auth state                    | TanStack Query + `credentials: 'include'` |


**Зависимости:** Module 0  
**Следующий:** Module 2 — Posts

---

## Module 2 — Posts (CRUD черновиков)

**Статус:** ✅ готов

**Цель:** создать, редактировать, удалить черновик; список черновиков и опубликованных.

**Scope:**

- [x] Prisma: `Post` + enum `PostStatus` (draft | published | failed)
- [x] API: CRUD `/posts` — только посты текущего user
- [x] Client: список постов + редактор (title?, body)
- [x] TanStack Query mutations + invalidation

**Не входит:** channelId (→ Module 3), publish (→ Module 4)

**Deliverables:**

- `api/src/posts/`
- migration `add_posts`
- `client/src/pages/posts/` — list, editor

**DoD:**

- [x] Создал черновик → виден в списке
- [x] Отредактировал → сохранилось после reload
- [x] Удалил → пропал из списка
- [x] Чужой post по id → 404

**Study guide:**


| Тема                             | Где смотреть       |
| -------------------------------- | ------------------ |
| Связь User → Post в schema       | `schema.prisma`    |
| Как API фильтрует «только мои»   | `posts.service.ts` |
| Optimistic vs pessimistic update | mutations в client |


**Зависимости:** Module 1  
**Следующий:** Module 3 — Channel

---

## Module 3 — Telegram Channel

**Статус:** ⬜ не начат

**Цель:** один канал привязан, бот проверен как admin.

**Scope:**

- [ ] Prisma: `Channel` (1 на user)
- [ ] `TELEGRAM_BOT_TOKEN` в env
- [ ] API: connect channel, `getChatMember` проверка
- [ ] Post.channelId — миграция
- [ ] Client: экран «Подключить канал» + статус

**Не входит:** webhook, несколько каналов (→ MVP Module 8)

**Deliverables:**

- `api/src/channels/`
- `api/src/telegram/` — минимальный client (send + getChatMember)
- migration `add_channels`
- `client/src/pages/channel/`

**DoD:**

- [ ] Бот добавлен admin в канал
- [ ] В кабинете указал @channel → статус «подключён»
- [ ] Без admin-прав → понятная ошибка
- [ ] Без канала publish заблокирован (UI + API)

**Study guide:**


| Тема                           | Где смотреть                      |
| ------------------------------ | --------------------------------- |
| Telegram Bot API basics        | `telegram.service.ts`             |
| Почему токен только на backend | `.env`, не VITE_                  |
| 1 channel per user             | unique constraint / service logic |


**Зависимости:** Module 1 (Module 2 параллельно ок)  
**Следующий:** Module 4 — Publish

---

## Module 4 — Publish (Core Loop) 🎯

**Статус:** ⬜ не начат

**Цель:** **главный milestone Pre-MVP** — текст из редактора появляется в Telegram-канале.

**Scope:**

- [ ] `POST /posts/:id/publish` → `sendMessage`
- [ ] Сохранить `telegramMessageId`, `publishedAt`
- [ ] Ошибка → status `failed` + `errorMessage`
- [ ] Client: кнопка «Опубликовать» + confirm
- [ ] Ссылка на пост в Telegram

**Deliverables:**

- publish logic в `posts.service.ts` + `telegram.service.ts`
- UI: publish button, status badges, error toast

**DoD:**

- [ ] Черновик → «Опубликовать» → пост в реальном канале
- [ ] В списке: status published, дата, ссылка
- [ ] При ошибке (нет прав) → failed + сообщение

**Study guide:**


| Тема                                 | Где смотреть              |
| ------------------------------------ | ------------------------- |
| Idempotency — что если нажать дважды | publish handler           |
| Error handling Telegram API          | try/catch + status failed |
| Формирование t.me ссылки             | message_id + chat         |


**Зависимости:** Module 2 + Module 3  
**Следующий:** Module 5 — Polish

---

## Module 5 — Polish & Deploy

**Статус:** ⬜ не начат

**Цель:** продукт можно отдать 3–5 beta-тестерам.

**Scope:**

- [ ] Tailwind + shadcn/ui (или минимальный kit)
- [ ] Empty states, loading, error toasts
- [ ] React Hook Form + Zod на формах
- [ ] История публикаций (UI polish)
- [ ] Deploy staging (Railway / Fly.io / VPS)
- [ ] HTTPS, env на сервере, migrate deploy

**Не входит:** Sentry, CI/CD pipeline (→ Module 14)

**DoD:**

- [ ] Staging URL открывается
- [ ] Полный flow работает на staging
- [ ] Нет «сломанных» empty states

**Study guide:**


| Тема                               | Где смотреть                 |
| ---------------------------------- | ---------------------------- |
| Структура UI kit                   | `client/src/components/`     |
| Env dev vs staging                 | `.env.example` vs server env |
| `prisma migrate deploy` на сервере | deploy docs                  |


**Зависимости:** Module 4  
**Следующий:** Module 6 — Gate

---

## Module 6 — Product Gate (без кода)

**Статус:** ⬜ не начат

**Цель:** проверить гипотезу Pre-MVP из [pre-mvp.md](./pre-mvp.md).

**Критерии:**

- [ ] 3–5 админов подключили канал
- [ ] Каждый ≥ 5 постов через сервис
- [ ] ≥ 2 вернулись за 7 дней
- [ ] Качественный отзыв

**Gate:** не пройден → докручиваем Module 4–5, **не** идём в MVP.

**Study guide:** разбор feedback, не код.

---

# MVP Modules (после Module 6)

---

## Module 7 — Infra (Redis, Worker, Webhook)

**Цель:** фоновые задачи и webhook для будущего schedule/analytics.

**Scope:** Redis, BullMQ, worker app, Telegram webhook, idempotency.

**DoD:** dummy job в очереди выполняется worker'ом.

---

## Module 8 — Multi-channel

**Цель:** до 5 каналов, переключатель в UI.

---

## Module 9 — Media

**Цель:** фото/видео через S3 + Telegram sendPhoto/sendVideo.

---

## Module 10 — Schedule & Calendar

**Цель:** отложенная публикация + UI календаря.

---

## Module 11 — Confirmation Basket

**Цель:** пост не уходит автоматически без confirm.

---

## Module 12 — AI Assistant

**Цель:** generate, rewrite, tone of voice в редакторе.

---

## Module 13 — Analytics

**Цель:** просмотры, подписчики, слоты по времени.

---

## Module 14 — Hardening

**Цель:** Sentry, CI/CD, rate limits, audit, backups, load test.

---

## Текущий фокус


|                      |                     |
| -------------------- | ------------------- |
| **Модуль**           | **Module 3 — Channel** |
| **Команда для чата** | «Ship Module 3»        |


---

## Как не потерять обучение в Ship mode

После каждого модуля — **15–30 мин** на Study guide:

1. Открой файлы из таблицы
2. Ответь на вопросы (устно или в заметках)
3. Спроси в чате всё, что «мутно»
4. Опционально: измени одну мелочь сам (label, поле, текст ошибки)

**Не нужно:** переписывать модуль руками с нуля.  
**Нужно:** понимать каждый слой, который попал в prod.