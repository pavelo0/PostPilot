import type { ReactElement } from 'react';
import { UiCard } from '../ui/UiCard';

const FEATURES = [
  {
    title: 'Умное планирование',
    description:
      'Планируйте посты на дни вперед и удерживайте ритм публикаций без хаоса.',
  },
  {
    title: 'AI-генерация контента',
    description:
      'Создавайте черновики быстрее на основе темы, формата и тона канала.',
  },
  {
    title: 'Единый центр управления',
    description:
      'Черновики, публикации и статусы собраны в одном месте для всей команды.',
  },
  {
    title: 'Проверка перед отправкой',
    description:
      'Убедитесь в доступах и корректности канала до публикации, чтобы избежать ошибок.',
  },
  {
    title: 'Прозрачные статусы',
    description:
      'Сразу видно, что отправлено, что в черновике и где нужна правка контента.',
  },
  {
    title: 'Быстрый старт',
    description:
      'Подключение занимает минуты: авторизация, канал и первая публикация без лишних шагов.',
  },
] as const;

/**
 * Displays reusable marketing cards with product capabilities.
 */
export function LandingFeatureGrid(): ReactElement {
  return (
    <div className="landing__grid">
      {FEATURES.map((feature) => (
        <UiCard key={feature.title} title={feature.title}>
          <p>{feature.description}</p>
        </UiCard>
      ))}
    </div>
  );
}
