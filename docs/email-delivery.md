# Email delivery (verification codes)

PostPilot отправляет коды подтверждения через [Resend](https://resend.com).

## Почему Resend

| Сервис | Free tier | Плюсы | Минусы |
|--------|-----------|-------|--------|
| **Resend** (выбран) | 3 000/мес, 100/день | Простой API, Node SDK, React Email | Нужен verified domain для любых получателей |
| Brevo | ~300/день | Больше free volume, marketing | Тяжелее API |
| SendGrid | 100/день | Масштаб | Старый API, сложнее onboarding |
| Amazon SES | ~$0 | Дёшево в prod | Настройка AWS, sandbox |

Для Pre-MVP beta Resend — минимум кода и быстрый старт.

## Настройка Resend

1. [resend.com](https://resend.com) → Sign up
2. **API Keys** → Create → скопируй ключ (`re_...`)
3. **Domains** → Add domain → добавь DNS записи (SPF, DKIM)
4. После verify используй `EMAIL_FROM=PostPilot <noreply@yourdomain.com>`

### Без своего домена (только тест)

`onboarding@resend.dev` отправляет письма **только на email аккаунта Resend**.  
Для beta с несколькими пользователями **нужен verified domain**.

## Env vars

| Variable | Required | Example |
|----------|----------|---------|
| `RESEND_API_KEY` | prod/staging | `re_xxxxxxxx` |
| `EMAIL_FROM` | recommended | `PostPilot <noreply@postpilot.app>` |
| `EMAIL_VERIFICATION_SUBJECT` | optional | `PostPilot — код подтверждения` |
| `APP_PUBLIC_URL` | optional | `https://post-pilot-sigma-sepia.vercel.app` |

Локально без `RESEND_API_KEY` код пишется в консоль API (`LOG_EMAIL_VERIFICATION_CODE=true`).

Render → `postpilot-api` → **Environment** → добавь вручную (Blueprint не подставит ключ сам):

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | ключ из Resend (`re_...`) |
| `EMAIL_FROM` | `PostPilot <onboarding@resend.dev>` |
| `APP_PUBLIC_URL` | `https://post-pilot-sigma-sepia.vercel.app` |

Save → **Manual Deploy**.

Проверка: `GET /api/health` → `"email":"configured"`. Если `"missing"` — ключ не задан на сервере.

Локальный `api/.env` **не попадает** на Render.

## Branded template

Письмо с кодом использует HTML-шаблон в стиле PostPilot:

- Wordmark «PostPilot» (teal `#005B60`) + accent-полоска
- Карточка на фоне `#f4f3ec`, код в accent-блоке с monospace
- Кнопка «Открыть PostPilot» → `{APP_PUBLIC_URL}/verify-email` (если env задан)
- Plain-text fallback для клиентов без HTML

Файлы: `api/src/email/email-theme.ts`, `api/src/email/templates/verification-code.template.ts`.

### Как превьюнуть

1. Задай `RESEND_API_KEY` и `APP_PUBLIC_URL` в `api/.env`
2. Запусти API, зарегистрируйся с email, доступным для Resend
3. Проверь inbox и Resend → Emails / Logs

## Fallback

- Нет `RESEND_API_KEY` → email не отправляется, код в логах API
- `EXPOSE_EMAIL_VERIFICATION_CODE=true` → код ещё и в API response (только dev)

## Альтернатива: Brevo

Если нужен больший free tier без своего домена на старте — можно переключиться на Brevo API позже. Scope Pre-MVP: Resend достаточно после verify domain.
