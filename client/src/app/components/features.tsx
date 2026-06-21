import { PenLine, Sparkles, Calendar, Send, BarChart2, Shield } from 'lucide-react'

const features = [
  {
    icon: PenLine,
    title: 'Редактор постов',
    description: 'Полноценный редактор для написания и форматирования контента с поддержкой Markdown и медиафайлов.',
  },
  {
    icon: Sparkles,
    title: 'AI-генерация',
    description: 'Создавайте и переписывайте тексты одним кликом. Контролируйте тон, стиль и длину.',
  },
  {
    icon: Calendar,
    title: 'Планирование',
    description: 'Контент-календарь с визуальным расписанием. Планируйте серии публикаций на недели вперёд.',
  },
  {
    icon: Send,
    title: 'Автопубликация',
    description: 'Telegram-бот публикует посты точно в срок. Мониторинг статуса каждой публикации в реальном времени.',
  },
  {
    icon: BarChart2,
    title: 'Аналитика',
    description: 'Просмотры, охват, вовлечённость и рост аудитории. Данные по каждому посту и каналу.',
  },
  {
    icon: Shield,
    title: 'Надёжность',
    description: 'Черновики, история версий, резервные копии. Ни один контент не потеряется.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Возможности</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-balance">
            Весь цикл контента в одном месте
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="bg-background p-8 hover:bg-secondary/40 transition-colors">
                <div className="w-9 h-9 rounded-md border border-border flex items-center justify-center mb-5" style={{ color: 'oklch(0.420 0.095 200)' }}>
                  <Icon size={17} />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
