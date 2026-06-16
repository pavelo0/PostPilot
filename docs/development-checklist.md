# PostPilot — чеклист разработки

Хронологический порядок задач: каждый пункт опирается на предыдущие.
Не перескакивать — иначе придётся переделывать.

**Связанные документы:** [pre-mvp.md](./pre-mvp.md) · [MVP.md](./MVP.md) · [production-service-tech-plan.md](./production-service-tech-plan.md)

---

## Как решать каждую задачу (методология)

1. **Минимум** — сделать самую маленькую версию, которая работает end-to-end (или хотя бы запускается).
2. **Проверка** — руками: curl / браузер / лог. Убедиться, что DoD выполнен.
3. **Расширение** — добавить валидацию, типы, обработку ошибок, UI-состояния.
4. **Commit** — один логический кусок = один коммит (когда попросишь закоммитить).

**Признак «готово»:** можно показать результат другому человеку без «ну, локально почти работает».

---

## Pre-MVP

**Цель:** один пользователь, один канал, текст, «опубликовать сейчас», история.
**Core loop:** написал → сохранил черновик → опубликовал → видишь историю.

---

### P0. Фундамент (ничего продуктового — только среда)

> Без этого нельзя auth, посты и Telegram.

- [x] **P0.1** `docker-compose.yml` — PostgreSQL локально
- [x] **P0.2** Корневой `.gitignore` + `.env.example` (секреты не в git)
- [ ] **P0.3** Папка `api/` — NestJS + TypeScript, `GET /health` → `{ status: "ok" }`
- [ ] **P0.4** Prisma: подключение к Postgres, `prisma migrate dev`, пустая первая миграция
- [ ] **P0.5** Frontend: proxy `/api` → backend в `vite.config.ts` (или явный `VITE_API_URL`)
- [ ] **P0.6** Скрипты запуска: `docker compose up -d`, `api dev`, `client dev` — всё поднимается за 2 команды

**DoD P0:** Postgres в Docker, API отвечает на `/health`, Prisma мигрирует, client dev-сервер работает.

**Подход:** сначала голый health-check без auth и без UI-логики. Потом Prisma. Потом связка client ↔ api.

---

### P1. Auth (Pre-MVP шаг 1)

> Зависит от: P0

- [ ] **P1.1** Prisma schema: модель `User` (id, email, passwordHash, createdAt)
- [ ] **P1.2** `POST /auth/register` — hash пароля (bcrypt), валидация email (Zod)
- [ ] **P1.3** `POST /auth/login` — cookie-based session (HttpOnly)
- [ ] **P1.4** `POST /auth/logout` + `GET /auth/me`
- [ ] **P1.5** Guard: защищённые роуты API возвращают 401 без сессии
- [ ] **P1.6** Frontend: React Router — `/login`, `/register`
- [ ] **P1.7** Frontend: TanStack Query — login/register/logout, редирект если не авторизован
- [ ] **P1.8** Protected layout — после логина попадаешь в кабинет, после reload сессия жива

**DoD P1:** зарегистрировался → залогинился → F5 → всё ещё в кабинете → logout → редирект на login.

**Подход:** сначала register/login через curl и cookie в Postman. Потом формы на React. Потом protected routes.

---

### P2. Посты — CRUD черновиков (Pre-MVP шаг 2)

> Зависит от: P1

- [ ] **P2.1** Prisma: модель `Post` (id, userId, title?, body, status, timestamps)
- [ ] **P2.2** Enum status: `draft` | `published` | `failed`
- [ ] **P2.3** API: `GET /posts` — список постов текущего пользователя
- [ ] **P2.4** API: `POST /posts` — создать черновик
- [ ] **P2.5** API: `GET /posts/:id`, `PATCH /posts/:id`, `DELETE /posts/:id`
- [ ] **P2.6** Frontend: экран «Список постов» (черновики отдельно от опубликованных)
- [ ] **P2.7** Frontend: экран «Редактор» — title (optional), body, кнопка «Сохранить»
- [ ] **P2.8** TanStack Query: mutations save/delete, invalidation списка

**DoD P2:** создал черновик → отредактировал → видишь в списке → перезагрузил страницу — данные из БД.

**Подход:** сначала API + curl. Потом список без красоты. Потом редактор. Потом UX (loading, errors).

> ⚠️ `channelId` пока не нужен — добавим в P3.

---

### P3. Подключение Telegram-канала (Pre-MVP шаг 3)

> Зависит от: P1 (auth). Параллельно с P2 можно только после P1.

- [ ] **P3.1** Создать бота через @BotFather, `TELEGRAM_BOT_TOKEN` в `.env`
- [ ] **P3.2** Prisma: модель `Channel` (id, userId, telegramChatId, title, botConnectedAt)
- [ ] **P3.3** API: `POST /channels` — привязать канал (username или chat ID)
- [ ] **P3.4** API: проверка через `getChatMember` — бот admin в канале
- [ ] **P3.5** API: `GET /channels/me` — текущий канал пользователя (1 канал на user)
- [ ] **P3.6** Prisma: добавить `channelId` в `Post`, миграция
- [ ] **P3.7** Frontend: экран «Подключить канал» + статус (подключён / ошибка)
- [ ] **P3.8** Блокировка publish без канала — понятное сообщение пользователю

**DoD P3:** добавил бота admin в канал → указал @channel в кабинете → статус «подключён».

**Подход:** сначала проверка бота через отдельный скрипт/curl к Telegram API. Потом endpoint. Потом UI.

---

### P4. Публикация «сейчас» (Pre-MVP шаг 4) — главный milestone

> Зависит от: P2, P3

- [ ] **P4.1** Telegram module: `sendMessage` в канал
- [ ] **P4.2** API: `POST /posts/:id/publish`
- [ ] **P4.3** Успех: status → `published`, сохранить `telegramMessageId`, `publishedAt`
- [ ] **P4.4** Ошибка: status → `failed`, сохранить `errorMessage`
- [ ] **P4.5** Frontend: кнопка «Опубликовать» + confirm dialog
- [ ] **P4.6** Frontend: после publish — обновить список, показать статус/ошибку
- [ ] **P4.7** Ссылка на пост в Telegram (из `message_id` + chat)

**DoD P4:** текст из редактора появляется в реальном Telegram-канале одним кликом.

**Подход:** сначала hardcoded sendMessage в тестовый канал. Потом endpoint. Потом кнопка в UI.

---

### P5. История и полировка (Pre-MVP шаги 5–6)

> Зависит от: P4

- [ ] **P5.1** Список опубликованных: дата, статус, ссылка на Telegram
- [ ] **P5.2** UI: Tailwind + shadcn/ui (или минимальный kit)
- [ ] **P5.3** Empty states, loading skeletons, toast при ошибках
- [ ] **P5.4** Валидация форм (React Hook Form + Zod) на client и server
- [ ] **P5.5** Деплой staging (VPS / Railway / Fly.io)
- [ ] **P5.6** HTTPS, env на сервере, миграции на staging

**DoD P5:** можно отдать 3–5 beta-тестерам без ручного «подкрути env».

---

### P6. Валидация Pre-MVP (продуктовый gate)

> Зависит от: P5. Не пишем код — проверяем гипотезу.

- [ ] **P6.1** 3–5 реальных админов каналов подключили канал
- [ ] **P6.2** Каждый опубликовал ≥ 5 постов через сервис
- [ ] **P6.3** ≥ 2 пользователя вернулись и опубликовали снова за 7 дней
- [ ] **P6.4** Есть качественный отзыв «удобнее, чем вручную в Telegram»

**Gate:** если P6 не пройден — докручиваем core loop, **не** идём в MVP-фичи.

---

## MVP

**Цель:** полноценный кабинет для 1–5 каналов: AI, календарь, автопостинг, корзина, аналитика.
**Начинать только после:** P6 пройден.

---

### M0. Инфраструктура MVP

> Зависит от: P6. Нужна для расписания, webhook, аналитики.

- [ ] **M0.1** Redis в docker-compose
- [ ] **M0.2** BullMQ + worker app (`apps/worker` или `api/worker`)
- [ ] **M0.3** Telegram webhook endpoint (HTTPS) вместо только send-only
- [ ] **M0.4** Idempotency + retries для фоновых задач
- [ ] **M0.5** S3-compatible storage (медиа)
- [ ] **M0.6** Monorepo-структура (если репо разрослось): `apps/web`, `apps/api`, `apps/worker`

**DoD M0:** отложенная задача ставится в очередь и выполняется worker'ом.

**Подход:** сначала Redis + одна dummy-задача в очереди. Потом publish job. Потом webhook.

---

### M1. Несколько каналов

> Зависит от: M0 (частично), P3

- [ ] **M1.1** UI: переключатель канала, до 5 каналов на пользователя
- [ ] **M1.2** API: CRUD каналов, лимит 5
- [ ] **M1.3** Пост привязан к конкретному каналу при создании/планировании

**DoD M1:** два канала подключены, посты публикуются в нужный.

---

### M2. Медиа-вложения

> Зависит от: M0.5

- [ ] **M2.1** Загрузка фото/видео в S3
- [ ] **M2.2** Telegram: sendPhoto / sendVideo / sendDocument
- [ ] **M2.3** UI: drag-and-drop или file picker в редакторе

**DoD M2:** пост с картинкой публикуется в канал.

---

### M3. Календарь и отложенная публикация

> Зависит от: M0

- [ ] **M3.1** Prisma: `scheduledAt` на Post, status `scheduled`
- [ ] **M3.2** API: выбор даты/времени при сохранении или отдельным action
- [ ] **M3.3** Scheduler: job в BullMQ на `scheduledAt`
- [ ] **M3.4** Frontend: календарь / контент-план (месяц или неделя)
- [ ] **M3.5** Отмена и перенос запланированного поста

**DoD M3:** пост уходит в канал в заданное время без ручного клика.

**Подход:** сначала «запланировать через 2 минуты» для теста. Потом UI календаря.

---

### M4. Корзина подтверждения

> Зависит от: M3

- [ ] **M4.1** Status `pending_confirmation` перед автопубликацией
- [ ] **M4.2** UI: очередь постов «ждут подтверждения»
- [ ] **M4.3** Действия: подтвердить / отредактировать / отменить
- [ ] **M4.4** Worker публикует только после confirm

**DoD M4:** запланированный пост не уходит, пока пользователь не нажал «Подтвердить».

---

### M5. AI-помощь

> Зависит от: P2 (редактор). Можно параллельно с M3 после M0.

- [ ] **M5.1** AI module: интеграция с LLM API (OpenAI / Anthropic / etc.)
- [ ] **M5.2** Generate draft — генерация черновика по prompt
- [ ] **M5.3** Rewrite — переписать выделенный текст
- [ ] **M5.4** Tone of voice — presets + пользовательские референсы
- [ ] **M5.5** Usage limits (базовые, без биллинга)
- [ ] **M5.6** UI: кнопки AI в редакторе, loading, undo

**DoD M5:** из редактора генерируешь черновик и публикуешь без copy-paste из ChatGPT.

**Подход:** сначала один endpoint «generate». Потом rewrite. Потом tone presets.

---

### M6. Аналитика

> Зависит от: M0.3 (webhook для updates), M4 (история публикаций)

- [ ] **M6.1** Сбор просмотров постов (Telegram API / webhook updates)
- [ ] **M6.2** Динамика подписчиков канала
- [ ] **M6.3** Dashboard: история + базовые графики
- [ ] **M6.4** Анализ слотов по времени (какие часы работают лучше)
- [ ] **M6.5** Фоновые jobs для периодического обновления метрик

**DoD M6:** видишь просмотры и тренд подписчиков по опубликованным постам.

---

### M7. Auth и workspace (базовый)

> Зависит от: P1

- [ ] **M7.1** Workspace / organization (если нужен до команды)
- [ ] **M7.2** Базовый RBAC (owner, editor — минимум)
- [ ] **M7.3** CSRF protection для cookie-auth

**DoD M7:** два пользователя в одном workspace с разными правами.

---

### M8. Hardening (production-ready)

> Зависит от: основные MVP-фичи готовы

- [ ] **M8.1** Sentry — frontend + backend errors
- [ ] **M8.2** OpenTelemetry — traces, metrics
- [ ] **M8.3** Prometheus + Grafana dashboards
- [ ] **M8.4** Rate limiting (Redis)
- [ ] **M8.5** Audit log для критичных действий (publish, delete, channel connect)
- [ ] **M8.6** Backups Postgres + restore test
- [ ] **M8.7** GitLab CI/CD: lint, test, build, deploy staging → prod
- [ ] **M8.8** Dependency scanning
- [ ] **M8.9** Load test критичных endpoints

**DoD M8:** алерт при падении API, backup восстанавливается, деплой без ручных шагов.

---

## Карта зависимостей (кратко)

```text
P0 → P1 → P2 ──┐
         ↓      │
        P3 ─────┤
                ↓
               P4 → P5 → P6 (gate)
                          ↓
               M0 → M3 → M4
                ↓    ↓
               M1   M5
                ↓
               M2 (media)
                          M0.3 → M6
               P1 → M7
               MVP features → M8
```

---

## Текущий фокус

**Сейчас:** P0.3 — NestJS API + `GET /health`

**Следующий после P0.3:** P0.4 — Prisma + первая миграция
