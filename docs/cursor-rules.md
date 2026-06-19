# Cursor Rules для профиля PostPilot

Правила лежат в `.cursor/rules/` и подхватываются автоматически, когда открыт этот репозиторий.

## Профиль в Cursor

1. **Rules** → вкладка **PostPilot** (или Project)
2. Убедись, что правила из репо подключены (Project Rules из `.cursor/rules/`)
3. Опционально в User Rules профиля PostPilot добавь одну строку:

```
Работаем в Ship mode по docs/ship-modules.md. Один модуль за сессию.
```

## Файлы правил

| Файл | Когда действует |
|------|-----------------|
| `postpilot-ship-mode.mdc` | Всегда — workflow, модули, язык |
| `postpilot-api.mdc` | Файлы `api/**` |
| `postpilot-client.mdc` | Файлы `client/**` |

## Как начать сессию

```
Ship Module 1
```

AI соберёт модуль по `docs/ship-modules.md`, ты пройдёшь Study guide.

## Текущий фокус

- **Module 0** — ✅ готов
- **Следующий:** Module 1 — Auth → «Ship Module 1»
