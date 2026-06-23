import {
  BarChart2,
  BookOpen,
  Calendar,
  FileText,
  LayoutGrid,
  LogOut,
  PanelLeft,
  Radio,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

type NavItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: LayoutGrid, label: 'Обзор', href: '/dashboard' },
  { icon: FileText, label: 'Посты', href: '/dashboard/posts' },
  { icon: Sparkles, label: 'AI-помощник', href: '/dashboard/ai-assistant' },
  { icon: Calendar, label: 'Календарь', href: '/dashboard/calendar' },
  { icon: Radio, label: 'Каналы', href: '/dashboard/channels' },
  { icon: BarChart2, label: 'Аналитика', href: '/dashboard/analytics' },
  { icon: BookOpen, label: 'Черновики', href: '/dashboard/drafts' },
]

function isItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname.startsWith(href)
}

export function ServiceSidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <aside
        className={cn(
          'sticky top-0 z-40 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-border bg-background transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[56px]' : 'w-[216px]',
        )}
      >
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-border',
            collapsed ? 'justify-center' : 'justify-between px-4',
          )}
        >
          {!collapsed ? (
            <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ background: 'oklch(0.420 0.095 200)' }}
              >
                <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M1.5 6.5L4.5 9.5L11.5 2.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="truncate text-[14px] font-semibold">PostPilot</span>
            </Link>
          ) : null}

          <button
            onClick={() => setCollapsed((value) => !value)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Свернуть меню"
          >
            <PanelLeft size={15} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              to={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center rounded-md text-sm transition-colors',
                collapsed ? 'mx-auto h-9 w-9 justify-center' : 'gap-2.5 px-2.5 py-2',
                isItemActive(location.pathname, href)
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )}
            >
              <Icon size={15} className="shrink-0" />
              {!collapsed ? <span className="truncate">{label}</span> : null}
              {!collapsed && isItemActive(location.pathname, href) ? (
                <span
                  className="ml-auto h-1 w-1 shrink-0 rounded-full"
                  style={{ background: 'oklch(0.420 0.095 200)' }}
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 space-y-0.5 border-t border-border px-2 py-2">
          <Link
            to="/dashboard/settings"
            title={collapsed ? 'Настройки' : undefined}
            className={cn(
              'flex items-center rounded-md text-sm transition-colors',
              collapsed ? 'mx-auto h-9 w-9 justify-center' : 'gap-2.5 px-2.5 py-2',
              isItemActive(location.pathname, '/dashboard/settings')
                ? 'bg-secondary font-medium text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <Settings size={15} className="shrink-0" />
            {!collapsed ? <span>Настройки</span> : null}
          </Link>
          <button
            title={collapsed ? 'Выход' : undefined}
            className={cn(
              'w-full items-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground',
              collapsed ? 'mx-auto flex h-9 w-9 justify-center' : 'flex gap-2.5 px-2.5 py-2',
            )}
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed ? <span>Выход</span> : null}
          </button>
        </div>
      </aside>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background lg:hidden">
        {[
          ...navItems.slice(0, 4),
          { icon: Settings, label: 'Ещё', href: '/dashboard/settings' },
        ].map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              isItemActive(location.pathname, href) ? 'text-foreground' : 'text-muted-foreground',
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
