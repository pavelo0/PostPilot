import type { ReactElement } from 'react';
import { UiCard } from '../ui/UiCard';

const FAQ_ITEMS = [
  {
    question: 'Какие платформы поддерживает PostPilot?',
    answer:
      'Сейчас фокус на Telegram. Следующие интеграции добавляются по roadmap после MVP.',
  },
  {
    question: 'Безопасны ли данные?',
    answer:
      'Да. Доступы передаются только по защищенному каналу, а чувствительные операции верифицируются на backend.',
  },
  {
    question: 'Есть ли бесплатный период?',
    answer:
      'Да, можно начать без карты и проверить сценарий публикации на реальном канале.',
  },
  {
    question: 'Поддерживается ли работа в команде?',
    answer:
      'Базовые роли в процессе; расширенные сценарии совместной работы доступны в следующих релизах.',
  },
] as const;

/**
 * Renders concise FAQ cards for common objections.
 */
export function LandingFaq(): ReactElement {
  return (
    <div className="faq-grid">
      {FAQ_ITEMS.map((item) => (
        <UiCard key={item.question} title={item.question}>
          <p>{item.answer}</p>
        </UiCard>
      ))}
    </div>
  );
}
