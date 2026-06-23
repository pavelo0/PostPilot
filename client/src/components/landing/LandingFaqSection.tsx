import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type FaqItem = {
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    question: 'Как подключить Telegram-канал?',
    answer:
      'Добавьте нашего бота @PostPilotBot в администраторы вашего канала с правом публикации. После этого канал появится в вашем дашборде автоматически.',
  },
  {
    question: 'Нужны ли технические знания для настройки?',
    answer:
      'Нет. Весь процесс занимает около 3 минут и не требует программирования. Достаточно добавить бота и следовать инструкциям на экране.',
  },
  {
    question: 'Как работает AI-помощник?',
    answer:
      'Укажите тему или набросок — AI сгенерирует готовый текст в нужном тоне и стиле. Вы можете переписать, сократить или расширить любой фрагмент одним кликом.',
  },
  {
    question: 'Что происходит, если бот не смог опубликовать пост?',
    answer:
      'Вы получите уведомление с описанием ошибки. Пост останется в очереди со статусом «ошибка» — его можно повторно отправить или отредактировать.',
  },
  {
    question: 'Можно ли работать в команде?',
    answer:
      'На тарифе «Агентство» вы получаете полное управление командами, ролями и правами доступа. На «Про» планируется поддержка до 3 пользователей.',
  },
  {
    question: 'Есть ли пробный период?',
    answer:
      'Да. 14 дней бесплатно без привязки карты. После окончания пробного периода вы выбираете тариф или ваши данные сохраняются ещё 30 дней.',
  },
]

export function LandingFaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-secondary/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight">
            Часто задаваемые вопросы
          </h2>
        </div>

        <Accordion type="single" collapsible defaultValue={faqItems[0]?.question} className="max-w-2xl space-y-2">
          {faqItems.map((faqItem) => (
            <AccordionItem key={faqItem.question} value={faqItem.question}>
              <AccordionTrigger>{faqItem.question}</AccordionTrigger>
              <AccordionContent>{faqItem.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
