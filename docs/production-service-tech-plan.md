# PostPilot: технологический план на React

## Контекст проекта

PostPilot — это SaaS для управления Telegram-каналами: создание постов,
AI-помощь, календарь публикаций, автопостинг и аналитика. MVP ориентирован на
администраторов 1–5 каналов, а технологическую часть проекта ведет один из двух
фаундеров, при этом GitLab используется как основной источник истины по
разработке.

## Базовый вывод

Обычный React для PostPilot использовать можно. Для этого проекта он подходит,
потому что ядро продукта — это закрытый личный кабинет с тяжелой клиентской
логикой, а не SEO-first сайт, и основная ценность живет после логина, в
интерфейсе управления каналами.

Для production Telegram Bot API позволяет получать updates либо через long
polling, либо через webhooks, но не одновременно. Для боевого режима лучше
строиться вокруг webhook-модели с HTTPS endpoint, потому что она лучше подходит
для серверной обработки событий и постоянной работы сервиса.

## Рекомендуемый стек

### Frontend

- React
- Vite
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui или собственный UI-kit
- Sentry для client-side errors

Такой набор дает быстрый SPA-frontend с хорошей типизацией, контролируемым
состоянием запросов, нормальной форменной логикой и удобной основой для личного
кабинета.

### Backend

- NestJS
- TypeScript
- REST API, при необходимости позже WebSocket для live-обновлений
- Cookie-based auth
- RBAC
- Zod или class-validator на входящих payloads
- Prisma или TypeORM, но для скорости старта прагматичнее Prisma

OWASP ASVS рекомендует закрывать как минимум области authentication, session
management, access control, validation, secure configuration, data protection,
logging и API security, поэтому backend сразу стоит строить как системный слой,
а не как набор случайных handlers.

### Data и async слой

- PostgreSQL — основная БД
- Redis — кэш, rate limits, ephemeral state
- BullMQ — очереди и фоновые задачи
- S3-compatible storage — медиафайлы и вложения

Такой стек хорошо подходит под продукт с публикациями, отложенными задачами,
интеграциями и аналитикой, потому что в нем легко развести интерактивные запросы
пользователя и тяжелую фоновую обработку.

### Observability и эксплуатация

- Sentry — ошибки frontend/backend
- OpenTelemetry — traces, metrics, logs pipeline
- Prometheus + Grafana — метрики и дашборды
- Loki или аналог — логи
- Alertmanager — алерты

Для эксплуатации сервиса полезно строить monitoring вокруг four golden signals:
latency, traffic, errors и saturation, потому что они отражают реальное здоровье
сервиса и деградацию для пользователей.

### Infra и delivery

- Docker
- Docker Compose для local/dev
- GitLab CI/CD
- staging и production environments
- Nginx / ingress
- CDN для статики и медиа
- Secret management
- Backups + restore tests

## Почему React подходит именно вам

Для PostPilot нет сильной причины тащить Next.js в core app-часть, потому что
основная работа пользователя происходит внутри авторизованного кабинета: каналы,
посты, календарь, настройки, автопостинг, AI и аналитика. Для такой модели SPA
на React — нормальный production-выбор.

Дополнительно это хорошо ложится на вашу команду и процесс: проект ведут два
фаундера, а технологическая реализация сосредоточена у тебя, поэтому более
простой и прозрачный стек снижает архитектурную перегрузку на старте.

## Когда Next.js не нужен

Обычный React стоит брать, если:

- Главная ценность продукта находится после логина.
- SEO не является ключевым каналом роста.
- Приложение по характеру больше похоже на dashboard или operating console.
- Есть отдельный backend и хочется разделить frontend и API.
- Нужна высокая скорость итерации в продуктовой части.

Под ваш проект все эти пункты выглядят релевантно.

## Когда все-таки пригодится Next.js

Next.js можно подключить позже для отдельного marketing-сайта, если появятся:

- SEO-страницы под поисковый трафик
- блог и контентный маркетинг
- landing pages под рекламу
- индексируемые public pages
- programmatic SEO

Это не обязательно совмещать с основной app-частью. Частая нормальная схема —
отдельный маркетинговый сайт на Next.js и основная продуктовая зона как React
SPA.

## Что конкретно писать

### Архитектурный принцип

На старте лучше делать не микросервисы, а modular monolith. Это одна
backend-кодовая база с четкими доменными модулями, одной главной БД и очередями
для фоновых задач.

Такой подход лучше для раннего SaaS, потому что он проще в разработке, деплое,
дебаге и изменениях. Разносить систему на микросервисы есть смысл только тогда,
когда отдельные домены действительно начинают жить независимо.

### Основные backend-модули

- `auth` — пользователи, логин, сессии, роли, workspace access
- `users` — профиль, настройки, лимиты, preferences
- `channels` — подключение Telegram-каналов и управление ими
- `posts` — черновики, версии, шаблоны, статусы публикации
- `calendar` — планирование публикаций
- `scheduler` — запуск отложенных задач
- `telegram` — webhook, отправка постов, обработка updates
- `ai` — генерация текста, редактура, prompt presets, usage limits
- `analytics` — метрики по каналам и постам
- `billing` — тариф, подписка, лимиты функций
- `notifications` — системные уведомления и события
- `audit` — журнал критичных действий

## Как сделать Telegram-слой

Telegram-интеграцию для production лучше строить через webhook endpoint.
Telegram FAQ указывает, что бот либо получает updates через `getUpdates`, либо
через webhook, а для webhooks нужны HTTPS, корректный сертификат и доступный
внешний endpoint.

Практический production-flow должен быть таким:

1. Telegram отправляет update на ваш webhook.
2. Backend быстро принимает и валидирует update.
3. Событие логируется с request/correlation ID.
4. Тяжелая обработка уходит в BullMQ queue.
5. Worker выполняет задачу и пишет результат в PostgreSQL.
6. Ошибки и метрики отправляются в telemetry stack.

Такой подход позволяет не блокировать webhook-обработчик, делает систему
устойчивее и дает хорошую базу под retries, idempotency и observability.

## Что нужно сделать по безопасности

Минимальный security baseline для PostPilot:

- HTTPS везде
- HttpOnly/Secure cookies
- CSRF protection для state-changing операций
- RBAC для разных уровней доступа
- audit logs для критичных действий
- rate limiting
- secret rotation
- encrypted secrets storage
- dependency scanning
- backup policy
- безопасная обработка ошибок без утечки внутренностей системы

OWASP ASVS прямо рекомендует системно закрывать authentication, sessions, access
control, validation, cryptography, logging, data protection и configuration, так
что эти вещи стоит считать частью основного продукта, а не “доработкой потом”.

## Что нужно сделать по наблюдаемости

Для нормального production-сервиса надо видеть:

- сколько запросов приходит
- какова задержка API и фоновых задач
- сколько ошибок происходит
- где упираемся в saturation: CPU, memory, queue lag, DB latency
- как ведет себя Telegram integration
- какие user flows ломаются на frontend

Именно поэтому four golden signals — latency, traffic, errors и saturation —
считаются базовыми метриками надежности сервиса.

## Рекомендуемая структура репозитория

```text
postpilot/
  apps/
    web/
    api/
    worker/
  packages/
    ui/
    types/
    config/
  infra/
  docs/
```

### Что лежит где

- `apps/web` — React SPA
- `apps/api` — NestJS API
- `apps/worker` — обработчики очередей и background jobs
- `packages/ui` — общие UI-компоненты
- `packages/types` — shared schemas, DTO, contracts
- `packages/config` — eslint, tsconfig, shared config
- `infra` — docker, deploy, infra config
- `docs` — архитектурные заметки и технические решения

## Что взять по шагам

### Этап 1. Foundation

- Поднять monorepo
- Создать `web`, `api`, `worker`
- Настроить TypeScript и shared types
- Подключить PostgreSQL и Redis
- Поднять базовый auth
- Настроить CI: lint, test, build

### Этап 2. Core product

- Подключение Telegram-канала
- CRUD постов
- Календарь публикаций
- Отложенный постинг через queue
- Базовые статусы и журнал событий
- Простая аналитика

### Этап 3. Hardening

- Sentry
- OpenTelemetry
- dashboards и alerts
- backups и restore checks
- rate limiting
- audit logs
- нагрузочное тестирование
- release strategy и rollback

## Итоговая рекомендация

Под PostPilot обычный React брать можно и это выглядит рационально. Оптимальная
схема на старте: React + Vite + TypeScript на frontend, NestJS + PostgreSQL +
Redis + BullMQ на backend, Telegram через webhook, Docker + GitLab CI/CD для
доставки, и observability/security как обязательная часть системы, а не как
опция после MVP.
