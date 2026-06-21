import type { ReactElement, ReactNode } from 'react';

type UiCardProps = {
  title: string;
  children: ReactNode;
  variant?: 'default' | 'featured' | 'elevated';
};

/**
 * Wraps content with reusable design-system card container.
 */
export function UiCard({
  title,
  children,
  variant = 'default',
}: UiCardProps): ReactElement {
  const className = [
    'ui-card',
    variant === 'featured' ? 'ui-card--featured' : '',
    variant === 'elevated' ? 'ui-card--elevated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={className}>
      <h3 className="ui-card__title">{title}</h3>
      <div className="ui-card__body">{children}</div>
    </article>
  );
}
