# Календарь публикаций + Schedule Stack

Теория и обзор того, что добавлено в PostPilot и зачем.  
Связанные модули roadmap: **Module 7** (Redis, worker) + **Module 10**
(календарь, отложенная публикация).

---

## Зачем это нужно

До этой задачи календарь был **UI-прототипом на mock-данных**: красивая сетка,
но без связи с API, без реального планирования и без автопубликации.

Цель — дать контент-менеджеру рабочий сценарий:

1. Открыть календарь и **сразу понять загрузку** по дням.
2. Кликнуть день → увидеть **полный список постов** на эту дату.
3. Из пустого дня **в один клик** перейти к созданию поста с уже подставленной
   датой.
4. Запланировать пост → он **сохраняется в БД** и **публикуется в Telegram
   автоматически** в нужное время.

---

## Общая архитектура

```
Пользователь
    │
    ▼
┌─────────────────┐     GET /posts/calendar      ┌──────────────┐
│  Calendar UI    │ ───────────────────────────► │   NestJS API │
│  (React)        │     POST /posts (scheduled)  │              │
└─────────────────┘ ───────────────────────────► └──────┬───────┘
                                                        │
                                                        │ enqueue delayed job
                                                        ▼
                                                 ┌──────────────┐
                                                 │    Redis     │
                                                 │   (BullMQ)   │
                                                 └──────┬───────┘
                                                        │
                                                        │ job fires at scheduledAt
                                                        ▼
                                                 ┌──────────────┐
                                                 │   Worker     │
                                                 │ publish post │
                                                 └──────┬───────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │  Telegram    │
                                                 └──────────────┘
```

**Идея разделения:**

| Компонент          | Роль                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **API**            | Принимает HTTP-запросы, пишет в Postgres, **ставит задачу в очередь**     |
| **Redis + BullMQ** | Хранит отложенные задачи с `delay` до момента публикации                  |
| **Worker**         | Отдельный процесс: забирает задачу из очереди и вызывает `publishForUser` |
| **Calendar UI**    | Показывает контент-план; **не публикует сам** — только читает API         |

Почему не публиковать прямо из API?  
Потому что HTTP-запрос живёт секунds, а публикация может быть через неделю.
Очередь + worker — стандартный паттерн для **отложенныых задач** в SaaS.

---

## Backend: что добавили

### 1. Модель данных (Prisma)

**Файл:** `api/prisma/schema.prisma`

| Поле / enum        | Было                           | Стало                                 |
| ------------------ | ------------------------------ | ------------------------------------- |
| `PostStatus`       | `draft`, `published`, `failed` | + `scheduled`                         |
| `Post.scheduledAt` | —                              | `DateTime?` — когда пост должен выйти |

**Семантика статусов:**

| status      | Когда                                       | Что видит пользователь |
| ----------- | ------------------------------------------- | ---------------------- |
| `draft`     | Черновик без даты                           | «Черновик»             |
| `scheduled` | Есть `scheduledAt` в будущем, job в очереди | «Запланирован»         |
| `published` | Успешно отправлен в Telegram                | «Опубликован»          |
| `failed`    | Worker/API не смог опубликовать             | «Ошибка»               |

Миграция: `api/prisma/migrations/20260701123000_add_scheduled_posts/`

---

### 2. API endpoints

**Файлы:** `api/src/posts/posts.controller.ts`, `posts.service.ts`,
`posts.schemas.ts`

| Method   | Path                                                | Назначение                                           |
| -------- | --------------------------------------------------- | ---------------------------------------------------- |
| `GET`    | `/api/posts/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` | Посты для календаря за диапазон дат                  |
| `POST`   | `/api/posts`                                        | Расширен: можно передать `scheduledAt` + `channelId` |
| `PATCH`  | `/api/posts/:id`                                    | Можно перенести дату / снять с расписания            |
| `DELETE` | `/api/posts/:id`                                    | Отменяет job в очереди перед удалением               |

**Логика календарного запроса:**

- `scheduled` посты попадают на день по `scheduledAt`
- `published` посты — по `publishedAt`
- Черновики без даты **не показываются** в календаре (это не часть
  контент-плана)

Route `GET /calendar` объявлен **до** `GET /:id`, иначе Nest воспринял бы
`"calendar"` как id поста.

---

### 3. Очередь и планирование

**Папка:** `api/src/queue/`

| Файл                     | Зачем                                                                |
| ------------------------ | -------------------------------------------------------------------- |
| `queue.constants.ts`     | Имя очереди `post-publish`, тип данных job                           |
| `queue.service.ts`       | **Producer**: `schedulePublish`, `removePublishJob`                  |
| `schedule.service.ts`    | Бизнес-правила: валидация даты (≥ +1 мин), проверка канала           |
| `publish-post.worker.ts` | **Consumer**: в нужный момент вызывает `PostsService.publishForUser` |

**Lifecycle при создании запланированного поста:**

1. API создаёт пост: `status = scheduled`, `scheduledAt`, `channelId`
2. `QueueService.schedulePublish(postId, userId, scheduledAt)`
3. BullMQ job с `jobId = postId` (важно для идемпотентности и отмены)
4. `delay = scheduledAt - now`

**При отмене / удалении / publish now:**

- Job удаляется из очереди по `postId`
- При reschedule — старый job снимается, ставится новый

**Worker** (`api/src/worker/main.ts`):

- Отдельный NestJS ApplicationContext (без HTTP)
- Запуск: `npm run dev:worker` или вместе с `npm run dev`
- Перед публикацией проверяет: пост ещё `scheduled`? (защита от дублей)

---

### 4. Инфраструктура

| Изменение      | Файл                                              |
| -------------- | ------------------------------------------------- |
| Redis в Docker | `docker-compose.yml`                              |
| `REDIS_URL`    | `.env.example`, `api/.env.example`                |
| Worker в dev   | root `package.json`: `dev:worker`, обновлён `dev` |

Локально:

```bash
npm run db:up          # Postgres + Redis
cd api && npx prisma migrate deploy
# api/.env: REDIS_URL=redis://localhost:6379
npm run dev            # api + worker + client
```

---

## Frontend: что добавили

### 1. Структура календаря

**Папка:** `client/src/pages/dashboard/calendar/`

| Компонент                    | Ответственность                                         |
| ---------------------------- | ------------------------------------------------------- |
| `CalendarDashboardPage.tsx`  | State: месяц, выбранный день, RTK Query                 |
| `CalendarMonthGrid.tsx`      | Сетка месяца, prev/next                                 |
| `CalendarDayCell.tsx`        | Ячейка: число, 1–2 preview, «+N ещё»                    |
| `CalendarDayDetailPanel.tsx` | Правая колонка: список / empty / skeleton               |
| `CalendarPostCard.tsx`       | Карточка: title, status, время, канал                   |
| `calendar.utils.ts`          | Группировка по датам, default selection, форматирование |

Старый файл `CalendarDashboardPage.tsx` теперь только re-export — роутер не
менялся.

---

### 2. UX-механика (как задумано)

**Выбор дня по умолчанию** при открытии / смене месяца:

1. Сегодня — если в этом месяце есть посты на сегодня
2. Иначе — ближайший будущий день с постами в месяце
3. Иначе — ближайший прошлый день с постами
4. Иначе — сегодня (если в месяце) или 1-е число

**Клик по дню** → `selectedDate` меняется → правая панель фильтрует уже
загруженные данные **без перезагрузки страницы**.

**Визуальные состояния ячейки:**

- `today` — акцентный круг
- `selected` — ring + лёгкий фон
- `hasPosts` — точка-индикатор + mini-chips по статусу

**Правая колонка** — только про **выбранный день**, не общий список
«запланировано».

**Empty state:**

- «На этот день публикаций нет»
- «Выберите другую дату или запланируйте новый пост»
- Кнопка → `/dashboard/posts/new?date=YYYY-MM-DD&mode=schedule`

---

### 3. RTK Query

**Файл:** `client/src/store/api/posts-api.ts`

- Тип `Post`: + `scheduledAt`, `channelLabel`, status `scheduled`
- Новый hook: `useGetCalendarPostsQuery({ from, to })`
- `createPost`: принимает `scheduledAt`, `channelId`

При смене месяца пересчитываются `from` / `to` (1-е и последнее число месяца).

---

### 4. Форма создания поста

**Файл:** `client/src/pages/dashboard/CreatePostDashboardPage.tsx`

- Читает query: `?date=`, `?time=`, `?mode=schedule`
- В режиме «По расписанию» отправляет в API реальные `scheduledAt` + `channelId`
- После успеха → `/dashboard/calendar?date=...` (день уже выбран)

**Ограничение v1:** медиафайлы в отложенных постах не поддерживаются — toast,
сохраняется только текст (Module 9 — media).

---

### 5. Список постов

**Файл:** `client/src/pages/dashboard/PostsDashboardPage.tsx`

- Добавлен фильтр **«Запланированные»** (`status=scheduled`)
- Badge «Запланирован» (синий)

**EditPostDashboardPage** — добавлен status `scheduled` в конфиг бейджей.

---

## Поток данных: сценарий контент-менеджера

```
1. Открывает /dashboard/calendar
   → GET /posts/calendar?from=2026-07-01&to=2026-07-31
   → посты группируются по дням в calendar.utils

2. Кликает 15 июля
   → selectedDate = 15.07
   → правая панель: postsByDate.get('2026-07-15')

3. Пустой день → «Запланировать пост»
   → /dashboard/posts/new?date=2026-07-15&mode=schedule
   → форма с pre-filled date

4. Заполняет текст, канал, время → «Запланировать»
   → POST /posts { body, scheduledAt, channelId }
   → API: status=scheduled, job в Redis

5. В календаре на 15 июля — chip с preview поста

6. В scheduledAt worker забирает job
   → publishForUser → Telegram
   → status=published, publishedAt=now
   → в календаре пост остаётся на том же дне, но уже как «Опубликован»
```

---

## Тесты

**Файлы:**

- `api/src/queue/schedule.service.spec.ts` — валидация даты, enqueue
- `api/src/posts/posts.service.spec.ts` — calendar range, маппинг DTO

Запуск: `cd api && npm test`

---

## Что сознательно не в scope

| Тема                         | Почему                                     |
| ---------------------------- | ------------------------------------------ |
| Telegram webhook / sync      | Module 7 полностью — отдельная задача      |
| Медиа в scheduled posts      | Module 9 (S3 + sendPhoto)                  |
| Multi-channel UI в календаре | Module 8 — channelLabel уже приходит с API |
| E2E Playwright для календаря | можно добавить позже в `e2e/specs/`        |

---

## Study guide — с чего начать читать код

1. `client/src/pages/dashboard/calendar/CalendarDashboardPage.tsx` —
   orchestration UI
2. `client/src/pages/dashboard/calendar/calendar.utils.ts` — группировка и
   default day
3. `api/src/posts/posts.service.ts` → `listForCalendar`, `createForUser`
4. `api/src/queue/queue.service.ts` — как job попадает в Redis
5. `api/src/queue/publish-post.worker.ts` — что происходит в момент X
6. `client/src/pages/dashboard/CreatePostDashboardPage.tsx` — связка форма ↔ API

**Вопросы для самопроверки:**

- Почему `jobId = postId`?
- Что будет, если worker упадёт, а Redis жив?
- Почему published посты в календаре идут по `publishedAt`, а не `scheduledAt`?
- Зачем отдельный процесс worker, а не `setTimeout` в API?

---

## Связанные документы

- [AIContext.md](./AIContext.md) — общий контекст проекта
- [ship-modules.md](./ship-modules.md) — Module 7, Module 10
- [pre-mvp.md](./pre-mvp.md) — что было out of scope до MVP
