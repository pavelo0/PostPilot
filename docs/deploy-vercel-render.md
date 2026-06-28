# Deploy PostPilot (Vercel + Render)

Рекомендуемый staging для beta: **Vercel** (frontend + HTTPS) + **Render Free** (API + Postgres).

```text
Browser → https://your-app.vercel.app
            ├─ /*      → React SPA (Vercel CDN)
            └─ /api/*  → rewrite → Render Web Service → Postgres
```

Браузер видит один origin — cookie-auth работает без cross-origin CORS.

**Render Free:** API «засыпает» после ~15 мин без трафика. Первый запрос после сна — cold start 30–60 сек. Для постоянной доступности — Render Starter (~$7/мес).

---

## Что нужно заранее

- Аккаунт [Render](https://render.com) (GitHub login)
- Аккаунт [Vercel](https://vercel.com) (GitHub login)
- Репозиторий PostPilot на GitHub (push текущей ветки)

---

## Шаг 1 — Render: Postgres + API

### 1.1 Blueprint

1. Render Dashboard → **New** → **Blueprint**
2. Connect GitHub repo `PostPilot`
3. Render найдёт [`render.yaml`](../render.yaml) и предложит создать:
   - `postpilot-db` — PostgreSQL (free)
   - `postpilot-api` — Web Service (free, Node)
4. Нажми **Apply**

### 1.2 Env vars на API

После создания сервиса `postpilot-api` → **Environment**:

| Variable | Value |
|----------|-------|
| `BOT_TOKEN_ENCRYPTION_KEY` | Сгенерируй: `openssl rand -base64 32` (замени auto-generated) |
| `EXPOSE_EMAIL_VERIFICATION_CODE` | `false` |
| `LOG_EMAIL_VERIFICATION_CODE` | `false` |

Остальные (`DATABASE_URL`, `NODE_ENV`) Blueprint проставит сам.

### 1.3 Дождись деплоя

Render → `postpilot-api` → **Logs**. Успешный старт:

```text
prisma migrate deploy
Nest application successfully started
```

### 1.4 Проверь health напрямую

Скопируй URL сервиса, например `https://postpilot-api.onrender.com`:

```bash
curl https://postpilot-api.onrender.com/api/health
```

Ожидаемый ответ:

```json
{"status":"ok","db":"up","timestamp":"..."}
```

Сохрани этот URL — понадобится для Vercel.

---

## Шаг 2 — Vercel: Frontend

### 2.1 Import проекта

1. Vercel → **Add New** → **Project**
2. Import repo `PostPilot`
3. **Root Directory:** `client` (Edit → выбрать `client`)
4. Framework Preset: **Vite** (должен определиться автоматически)

### 2.2 Build settings

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` (default) |

### 2.3 Environment Variable

Добавь **до первого деплоя**:

| Name | Value |
|------|-------|
| `RENDER_API_URL` | `https://postpilot-api.onrender.com` |

Без trailing slash. Замени на свой Render URL из шага 1.4.

Build-скрипт сгенерирует `vercel.json` с rewrite `/api/*` → Render.

### 2.4 Deploy

Нажми **Deploy**. В логах build должно быть:

```text
[vercel-config] Wrote .../vercel.json → https://postpilot-api.onrender.com
```

### 2.5 Проверь proxy

Открой в браузере или curl:

```bash
curl https://YOUR-PROJECT.vercel.app/api/health
```

Должен вернуть тот же JSON, что и Render напрямую.

---

## Шаг 3 — Smoke test (полный flow)

1. **Register** → verify email → **Login**
2. **F5** — сессия жива (cookie `postpilot_session`)
3. **Settings** → подключить Bot API ключ
4. **Channels** → подключить Telegram-канал
5. **Posts** → создать черновик → **Опубликовать** → пост в канале

Если login не держится после F5 — проверь, что `RENDER_API_URL` задан и `/api/health` через Vercel отвечает.

---

## Шаг 4 — Custom domain (опционально)

1. Vercel → Project → **Settings** → **Domains**
2. Добавь `app.yourdomain.com`
3. DNS: CNAME → `cname.vercel-dns.com`
4. `RENDER_API_URL` **не меняется** — rewrite остаётся на Render

---

## Обновление после изменений в коде

| Часть | Как обновить |
|-------|--------------|
| API | Push в GitHub → Render auto-deploy `postpilot-api` |
| Frontend | Push в GitHub → Vercel auto-deploy |
| Prisma migrations | Render start command: `prisma migrate deploy` — применятся автоматически |

---

## Troubleshooting

| Симптом | Решение |
|---------|---------|
| `/api/health` на Vercel → 404 | Проверь `RENDER_API_URL` в Vercel env; redeploy |
| API 502 / timeout | Render cold start — подожди 30–60 сек, повтори |
| `db: down` | Render Postgres ещё поднимается; проверь `DATABASE_URL` в API env |
| Login не сохраняется | Убедись, что ходишь через Vercel URL, не напрямую на Render |
| `BOT_TOKEN_ENCRYPTION_KEY` error | Задай ключ в Render API env, redeploy |
| Build: `RENDER_API_URL not set` | Добавь env в Vercel → Redeploy |

---

## Альтернатива: Docker VPS

Полный контроль, один сервер, без cold start:

[docs/deploy.md](./deploy.md)
