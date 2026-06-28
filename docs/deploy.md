# Deploy PostPilot (Docker + Caddy)

Production stack: **Postgres + NestJS API + static React client + Caddy** (reverse proxy + HTTPS).

## Architecture

```text
Browser → Caddy (:443 / :80)
            ├─ /api/* → api:3000
            └─ /*     → client:80 (nginx + SPA)
          api → postgres:5432
```

Same-origin routing through Caddy keeps cookie auth simple: the browser talks to one host, API lives under `/api`.

## Prerequisites

- Docker + Docker Compose v2
- For real HTTPS: domain with DNS **A record** pointing to your server IP
- `BOT_TOKEN_ENCRYPTION_KEY` — generate once:

```bash
openssl rand -base64 32
```

## 1. Configure environment

From repo root:

```bash
cp .env.production.example .env
```

Edit `.env`:

| Variable | Example | Notes |
|----------|---------|-------|
| `CADDY_SITE` | `app.example.com` | Use `http://localhost` for local HTTP test |
| `CADDY_EMAIL` | `you@example.com` | Let's Encrypt contact (real domains) |
| `POSTGRES_PASSWORD` | strong password | Change from default |
| `BOT_TOKEN_ENCRYPTION_KEY` | base64 string | **Required** — API won't start without it |

## 2. Build and start

```bash
npm run prod:up
```

Or manually:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

First start runs `prisma migrate deploy` inside the API container, then boots NestJS.

## 3. Verify

```bash
# Health (via Caddy)
curl http://localhost/api/health

# Expected: {"status":"ok","db":"up",...}
```

Open in browser:

- Local: http://localhost
- Staging: https://your-domain.com

Checklist:

1. Register → verify email → login
2. Settings → connect bot token
3. Channels → connect channel
4. Posts → create → publish to Telegram

## 4. HTTPS on VPS

1. Rent VPS (Hetzner, DigitalOcean, Timeweb, etc.)
2. Install Docker
3. Clone repo, configure `.env` with `CADDY_SITE=your-domain.com` and `CADDY_EMAIL`
4. Point domain A record to VPS IP
5. Run `npm run prod:up`
6. Caddy obtains Let's Encrypt certificate automatically

Ports **80** and **443** must be open in firewall.

## 5. Stop / update

```bash
# Stop stack
npm run prod:down

# Pull latest code and redeploy
git pull
docker compose -f docker-compose.prod.yml up --build -d
```

## 6. Logs and debugging

```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f caddy
docker compose -f docker-compose.prod.yml ps
```

Common issues:

| Symptom | Fix |
|---------|-----|
| API restarts loop | Check `BOT_TOKEN_ENCRYPTION_KEY` in `.env` |
| `db: down` in health | Wait for Postgres healthcheck; check `DATABASE_URL` |
| Cookies not set | Ensure HTTPS in production (`Secure` cookies) |
| 502 from Caddy | API not healthy — check `docker logs postpilot-api-prod` |

## Local dev vs production

| | Dev | Production compose |
|--|-----|-------------------|
| Start | `npm run dev` | `npm run prod:up` |
| Postgres | `npm run db:up` | included in compose |
| Frontend | Vite :5173 | nginx static |
| API | Nest :3000 | behind Caddy `/api` |
| HTTPS | no | yes (with real domain) |
