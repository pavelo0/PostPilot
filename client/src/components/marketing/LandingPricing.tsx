import type { ReactElement } from 'react';
import { UiBadge } from '../ui/UiBadge';
import { UiButtonLink } from '../ui/UiButtonLink';
import { UiCard } from '../ui/UiCard';

const PLANS = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Для старта и первых процессов',
    features: ['1 канал', 'Планирование публикаций', 'Базовая аналитика'],
    featured: false,
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'Оптимально для растущих команд',
    features: [
      'Неограниченные посты',
      'AI-подсказки по контенту',
      'Приоритетная поддержка',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Для крупных команд и процессов',
    features: ['SLA', 'Выделенный менеджер', 'Кастомные интеграции'],
    featured: false,
  },
] as const;

/**
 * Renders pricing cards with highlighted middle plan.
 */
export function LandingPricing(): ReactElement {
  return (
    <div className="pricing-grid">
      {PLANS.map((plan) => (
        <UiCard
          key={plan.name}
          title={plan.name}
          variant={plan.featured ? 'featured' : 'default'}
        >
          {plan.featured ? <UiBadge>Popular</UiBadge> : null}
          <p className="pricing-grid__description">{plan.description}</p>
          <p className="pricing-grid__price">{plan.price}</p>
          <ul className="pricing-grid__list">
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <UiButtonLink to="/register" variant={plan.featured ? 'primary' : 'secondary'}>
            Начать
          </UiButtonLink>
        </UiCard>
      ))}
    </div>
  );
}
