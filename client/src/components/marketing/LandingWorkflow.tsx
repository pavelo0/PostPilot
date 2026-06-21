import type { ReactElement } from 'react';
import { UiCard } from '../ui/UiCard';

const WORKFLOW_STEPS = [
  {
    step: '1',
    title: 'Подключите канал',
    description: 'Добавьте бота в администраторы и подтвердите доступ в кабинете.',
  },
  {
    step: '2',
    title: 'Создайте контент',
    description: 'Напишите пост вручную или используйте AI, чтобы ускорить подготовку.',
  },
  {
    step: '3',
    title: 'Проверьте и запланируйте',
    description: 'Выберите момент публикации или отправьте пост сразу в канал.',
  },
  {
    step: '4',
    title: 'Анализируйте результат',
    description: 'Отслеживайте статусы и корректируйте контент по обратной связи.',
  },
] as const;

/**
 * Renders four-step workflow cards for landing.
 */
export function LandingWorkflow(): ReactElement {
  return (
    <div className="workflow-grid">
      {WORKFLOW_STEPS.map((item) => (
        <UiCard key={item.step} title={item.title} variant="elevated">
          <p className="workflow-grid__step">Шаг {item.step}</p>
          <p>{item.description}</p>
        </UiCard>
      ))}
    </div>
  );
}
