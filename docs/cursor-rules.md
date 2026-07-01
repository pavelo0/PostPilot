# Cursor Rules — PostPilot

Правила лежат в [`.cursor/rules/`](../.cursor/rules/) и подхватываются автоматически.

## Файлы

| Файл | Scope | Назначение |
|------|-------|------------|
| `index.mdc` | always | Overview, stack, AIContext, язык |
| `postpilot-ship-mode.mdc` | always | Ship mode, модули M0–M6 |
| `postpilot-client.mdc` | `client/**` | FSD target, RTK Query, shadcn |
| `postpilot-api.mdc` | `api/**` | NestJS, Prisma, cookie auth |
| `tests.mdc` | `**/*.spec.ts`, `e2e/**` | Jest + Playwright |

## Как начать сессию

```
Ship Module 6
```

или «Module 6 Gate» — по [ship-modules.md](./ship-modules.md).

## Контекст для AI

Читай [AIContext.md](./AIContext.md) перед нетривиальными задачами.

## Текущий фокус

**Module 6 — Gate** (Pre-MVP closure). M0–M5 ✅.
