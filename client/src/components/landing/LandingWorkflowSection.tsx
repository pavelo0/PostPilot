const workflowSteps = [
  {
    index: '01',
    title: 'Подключите канал',
    description:
      'Добавьте Telegram-бота в ваш канал. Занимает меньше двух минут.',
  },
  {
    index: '02',
    title: 'Создайте контент',
    description:
      'Напишите пост вручную или сгенерируйте текст с помощью AI-помощника.',
  },
  {
    index: '03',
    title: 'Запланируйте',
    description:
      'Выберите дату и время публикации в контент-календаре.',
  },
  {
    index: '04',
    title: 'Публикация и аналитика',
    description:
      'Бот публикует автоматически. Отслеживайте результаты в дашборде.',
  },
]

/**
 * Explains how users work with the product step by step.
 */
export function LandingWorkflowSection() {
  return (
    <section id="workflow" className="border-t border-border bg-secondary/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Рабочий процесс
          </p>
          <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight">
            От идеи до публикации — без ручного труда
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step.index}
              className="relative rounded-xl border border-border bg-background p-7"
            >
              {index < workflowSteps.length - 1 && (
                <div className="absolute top-8 left-full z-10 hidden h-px w-6 bg-border lg:block" />
              )}
              <div
                className="mb-5 text-3xl leading-none font-bold tabular-nums"
                style={{ color: 'oklch(0.420 0.095 200)', opacity: 0.5 }}
              >
                {step.index}
              </div>
              <h3 className="mb-2 text-[15px] font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
