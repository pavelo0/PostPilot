'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Как подключить Telegram-канал?',
    a: 'Добавьте нашего бота @PostPilotBot в администраторы вашего канала с правом публикации. После этого канал появится в вашем дашборде автоматически.',
  },
  {
    q: 'Нужны ли технические знания для настройки?',
    a: 'Нет. Весь процесс занимает около 3 минут и не требует программирования. Достаточно добавить бота и следовать инструкциям на экране.',
  },
  {
    q: 'Как работает AI-помощник?',
    a: 'Укажите тему или набросок — AI сгенерирует готовый текст в нужном тоне и стиле. Вы можете переписать, сократить или расширить любой фрагмент одним кликом.',
  },
  {
    q: 'Что происходит, если бот не смог опубликовать пост?',
    a: 'Вы получите уведомление с описанием ошибки. Пост останется в очереди со статусом «ошибка» — его можно повторно отправить или отредактировать.',
  },
  {
    q: 'Можно ли работать в команде?',
    a: 'На тарифе «Агентство» вы получаете полное управление командами, ролями и правами доступа. На «Про» планируется поддержка до 3 пользователей.',
  },
  {
    q: 'Есть ли пробный период?',
    a: 'Да. 14 дней бесплатно без привязки карты. После окончания пробного периода вы выбираете тариф или ваши данные сохраняются ещё 30 дней.',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 px-6 border-t border-border bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">FAQ</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-balance">
            Часто задаваемые вопросы
          </h2>
        </div>

        <div className="max-w-2xl space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl bg-background overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-secondary/40 transition-colors"
              >
                <span className="text-sm font-medium pr-4">{faq.q}</span>
                <span className="shrink-0 text-muted-foreground">
                  {open === i ? <Minus size={15} /> : <Plus size={15} />}
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
