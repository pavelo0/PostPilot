import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const footerColumns = [
  {
    title: 'Продукт',
    links: [
      { label: 'Возможности', href: '#features' },
      { label: 'Как работает', href: '#workflow' },
      { label: 'Тарифы', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О нас', href: '#' },
      { label: 'Блог', href: '#' },
      { label: 'Вакансии', href: '#' },
      { label: 'Контакты', href: '#' },
    ],
  },
  {
    title: 'Правовые',
    links: [
      { label: 'Политика конфиденциальности', href: '#' },
      { label: 'Условия использования', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="border-b border-border px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight">
              Готовы автоматизировать свой канал?
            </h3>
            <p className="text-sm text-muted-foreground">
              14 дней бесплатно. Без привязки карты.
            </p>
          </div>
          <Button
            asChild
            variant="primary"
            size="lg"
            className="shrink-0"
          >
            <Link to="/register">
              Начать бесплатно
              <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
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
                <span className="text-sm font-semibold">PostPilot</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Платформа управления Telegram-контентом для команд и медиа.
              </p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2025 PostPilot. Все права защищены.
            </p>
            <p className="text-xs text-muted-foreground">
              Сделано для Telegram-команд
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
