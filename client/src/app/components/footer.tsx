import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const cols = [
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

export function Footer() {
  return (
    <footer className="border-t border-border">
      {/* CTA banner */}
      <div className="px-6 py-16 border-b border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Готовы автоматизировать свой канал?</h3>
            <p className="text-muted-foreground text-sm">14 дней бесплатно. Без привязки карты.</p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/85 transition-colors shrink-0"
          >
            Начать бесплатно
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'oklch(0.420 0.095 200)' }}>
                  <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                    <path d="M1.5 6.5L4.5 9.5L11.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-semibold text-sm">PostPilot</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Платформа управления Telegram-контентом для команд и медиа.
              </p>
            </div>

            {cols.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2025 PostPilot. Все права защищены.</p>
            <p className="text-xs text-muted-foreground">Сделано для Telegram-команд</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
