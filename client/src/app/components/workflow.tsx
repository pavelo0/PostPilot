const steps = [
  {
    index: '01',
    title: 'Подключите канал',
    description: 'Добавьте Telegram-бота в ваш канал. Занимает меньше двух минут.',
  },
  {
    index: '02',
    title: 'Создайте контент',
    description: 'Напишите пост вручную или сгенерируйте текст с помощью AI-помощника.',
  },
  {
    index: '03',
    title: 'Запланируйте',
    description: 'Выберите дату и время публикации в контент-календаре.',
  },
  {
    index: '04',
    title: 'Публикация и аналитика',
    description: 'Бот публикует автоматически. Отслеживайте результаты в дашборде.',
  },
]

export function WorkflowSection() {
  return (
    <section id="workflow" className="py-24 px-6 bg-secondary/30 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Рабочий процесс</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-balance">
            От идеи до публикации — без ручного труда
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.index} className="relative bg-background border border-border rounded-xl p-7">
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-6 h-px bg-border z-10" />
              )}
              <div className="text-3xl font-bold tabular-nums mb-5 leading-none" style={{ color: 'oklch(0.420 0.095 200)', opacity: 0.5 }}>
                {step.index}
              </div>
              <h3 className="font-semibold text-[15px] mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
