'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  FileText,
  Sparkles,
  Calendar,
  Radio,
  BarChart2,
  BookOpen,
  Settings,
  LogOut,
  PanelLeft,
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { icon: LayoutGrid, label: 'Обзор',       href: '/dashboard' },
  { icon: FileText,   label: 'Посты',        href: '/dashboard/posts' },
  { icon: Sparkles,   label: 'AI-помощник',  href: '/dashboard/ai-assistant' },
  { icon: Calendar,   label: 'Календарь',    href: '/dashboard/calendar' },
  { icon: Radio,      label: 'Каналы',       href: '/dashboard/channels' },
  { icon: BarChart2,  label: 'Аналитика',    href: '/dashboard/analytics' },
  { icon: BookOpen,   label: 'Черновики',    href: '/dashboard/drafts' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const active = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <>
      {}
      <aside
        className={cn(
          'hidden lg:flex shrink-0 flex-col border-r border-border bg-background z-40 transition-[width] duration-200 sticky top-0 h-screen overflow-y-auto',
          collapsed ? 'w-[56px]' : 'w-[216px]'
        )}
      >
        {}
        <div className={cn('h-14 flex items-center shrink-0 border-b border-border', collapsed ? 'justify-center' : 'px-4 justify-between')}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center" style={{ background: 'oklch(0.420 0.095 200)' }}>
                <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                  <path d="M1.5 6.5L4.5 9.5L11.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-semibold text-[14px] truncate">PostPilot</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
            aria-label="Свернуть"
          >
            <PanelLeft size={15} />
          </button>
        </div>

        {}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {nav.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-md text-sm transition-colors',
                collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-2.5 px-2.5 py-2',
                active(href)
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <Icon size={15} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && active(href) && (
                <span className="ml-auto w-1 h-1 rounded-full shrink-0" style={{ background: 'oklch(0.420 0.095 200)' }} />
              )}
            </Link>
          ))}
        </nav>

        {}
        <div className="border-t border-border py-2 px-2 space-y-0.5 shrink-0">
          <Link
            href="/dashboard/settings"
            title={collapsed ? 'Настройки' : undefined}
            className={cn(
              'flex items-center rounded-md text-sm transition-colors',
              collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-2.5 px-2.5 py-2',
              active('/dashboard/settings')
                ? 'bg-secondary text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            )}
          >
            <Settings size={15} className="shrink-0" />
            {!collapsed && <span>Настройки</span>}
          </Link>
          <button
            title={collapsed ? 'Выход' : undefined}
            className={cn(
              'w-full flex items-center rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors',
              collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-2.5 px-2.5 py-2'
            )}
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Выход</span>}
          </button>
        </div>
      </aside>

      {}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background flex safe-bottom">
        {[...nav.slice(0, 4), { icon: Settings, label: 'Ещё', href: '/dashboard/settings' }].map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors',
              active(href) ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
