import { Bell } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const titles: Record<string, { label: string; desc?: string }> = {
  '/dashboard': { label: 'Обзор', desc: 'Общая статистика и последние события' },
  '/dashboard/posts': { label: 'Посты', desc: 'Управление публикациями' },
  '/dashboard/ai-assistant': { label: 'AI-помощник', desc: 'Генерация и редактирование контента' },
  '/dashboard/calendar': { label: 'Календарь', desc: 'Расписание публикаций' },
  '/dashboard/channels': { label: 'Каналы', desc: 'Подключённые Telegram-каналы' },
  '/dashboard/analytics': { label: 'Аналитика', desc: 'Статистика и эффективность постов' },
  '/dashboard/drafts': { label: 'Черновики', desc: 'Неопубликованный контент' },
  '/dashboard/settings': { label: 'Настройки', desc: 'Аккаунт и параметры системы' },
}

export function ServiceHeader() {
  const location = useLocation()
  const page = titles[location.pathname] ?? { label: 'PostPilot' }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="min-w-0">
        <p className="truncate text-[15px] leading-tight font-semibold">{page.label}</p>
        {page.desc ? (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{page.desc}</p>
        ) : null}
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label="Уведомления"
        >
          <Bell size={15} />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
            style={{ background: 'oklch(0.420 0.095 200)' }}
          />
        </Button>
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="ml-1 rounded-full border border-border bg-secondary text-xs font-semibold text-foreground"
          title="Профиль"
        >
          <Link to="/dashboard/settings">А</Link>
        </Button>
      </div>
    </header>
  )
}
