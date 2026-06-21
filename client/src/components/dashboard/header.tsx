'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import Link from 'next/link'

const titles: Record<string, { label: string; desc?: string }> = {
  '/dashboard':              { label: 'Обзор',       desc: 'Общая статистика и последние события' },
  '/dashboard/posts':        { label: 'Посты',        desc: 'Управление публикациями' },
  '/dashboard/ai-assistant': { label: 'AI-помощник',  desc: 'Генерация и редактирование контента' },
  '/dashboard/calendar':     { label: 'Календарь',    desc: 'Расписание публикаций' },
  '/dashboard/channels':     { label: 'Каналы',       desc: 'Подключённые Telegram-каналы' },
  '/dashboard/analytics':    { label: 'Аналитика',    desc: 'Статистика и эффективность постов' },
  '/dashboard/drafts':       { label: 'Черновики',    desc: 'Неопубликованный контент' },
  '/dashboard/settings':     { label: 'Настройки',    desc: 'Аккаунт и параметры системы' },
}

export function DashboardHeader() {
  const pathname = usePathname()
  const page = titles[pathname] ?? { label: 'PostPilot' }

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background shrink-0">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-tight truncate">{page.label}</p>
        {page.desc && <p className="text-xs text-muted-foreground hidden sm:block truncate">{page.desc}</p>}
      </div>

      <div className="flex items-center gap-1 ml-4 shrink-0">
        <button className="relative w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.420 0.095 200)' }} />
        </button>
        <Link
          href="/dashboard/settings"
          className="ml-1 w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          title="Профиль"
        >
          А
        </Link>
      </div>
    </header>
  )
}
