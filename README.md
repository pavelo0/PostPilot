# PostPilot

SaaS для управления Telegram-каналами. Сейчас — Pre-MVP.

**План разработки:** [docs/ship-modules.md](./docs/ship-modules.md)

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
