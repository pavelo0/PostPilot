# PostPilot

SaaS для управления Telegram-каналами. Сейчас — Pre-MVP.

**AI context:** [docs/AIContext.md](./docs/AIContext.md) · **Ship modules:** [docs/ship-modules.md](./docs/ship-modules.md) · **Backlog:** [docs/TODO.md](./docs/TODO.md)

## Быстрый старт

```bash
# 1. Env
cp .env.example .env
cp api/.env.example api/.env

# 2. Зависимости (первый раз)
npm install
npm --prefix api install
npm --prefix client install

# 3. Postgres
npm run db:up

# 4. API + Client
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/health
- Через proxy: http://localhost:5173/api/health

## Отдельно

```bash
npm run dev:api      # только NestJS
npm run dev:client   # только Vite
npm run db:down      # остановить Postgres
```

## Production / Staging

### Vercel + Render (рекомендуется для beta)

Frontend на Vercel, API + Postgres на Render Free. Подробная инструкция: [docs/deploy-vercel-render.md](./docs/deploy-vercel-render.md)

```text
https://your-app.vercel.app       → SPA
https://your-app.vercel.app/api/* → proxy → Render API
```

### Docker VPS (альтернатива)

Полный стек: Postgres + API + static client + Caddy (HTTPS при наличии домена).

```bash
cp .env.production.example .env
# заполнить BOT_TOKEN_ENCRYPTION_KEY и пароль Postgres

npm run prod:up      # docker compose -f docker-compose.prod.yml up --build -d
npm run prod:down    # остановить production stack
```

- App: http://localhost (или https://your-domain.com)
- Health: http://localhost/api/health

Подробная инструкция: [docs/deploy.md](./docs/deploy.md)
