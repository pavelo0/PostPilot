import {
  BarChart2,
  Calendar,
  PenLine,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: PenLine,
    title: 'Редактор постов',
    description:
      'Полноценный редактор для написания и форматирования контента с поддержкой Markdown и медиафайлов.',
  },
  {
    icon: Sparkles,
    title: 'AI-генерация',
    description:
      'Создавайте и переписывайте тексты одним кликом. Контролируйте тон, стиль и длину.',
  },
  {
    icon: Calendar,
    title: 'Планирование',
    description:
      'Контент-календарь с визуальным расписанием. Планируйте серии публикаций на недели вперёд.',
  },
  {
    icon: Send,
    title: 'Автопубликация',
    description:
      'Telegram-бот публикует посты точно в срок. Мониторинг статуса каждой публикации в реальном времени.',
  },
  {
    icon: BarChart2,
    title: 'Аналитика',
    description:
      'Просмотры, охват, вовлечённость и рост аудитории. Данные по каждому посту и каналу.',
  },
  {
    icon: Shield,
    title: 'Надёжность',
    description:
      'Черновики, история версий, резервные копии. Ни один контент не потеряется.',
  },
]

/**
 * Key product features section.
 */
export function LandingFeaturesSection() {
  return (
    <section id="features" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Возможности
          </p>
          <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight">
            Весь цикл контента в одном месте
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-background p-8 transition-colors hover:bg-secondary/40"
              >
                <div
                  className="mb-5 flex h-9 w-9 items-center justify-center rounded-md border border-border"
                  style={{ color: 'oklch(0.420 0.095 200)' }}
                >
                  <Icon size={17} />
                </div>
                <h3 className="mb-2 text-[15px] font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
