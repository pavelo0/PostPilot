import type { ReactElement } from 'react';

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  align?: 'center' | 'left';
};

/**
 * Renders unified section heading block for marketing pages.
 */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: SectionTitleProps): ReactElement {
  const className =
    align === 'left' ? 'section-title section-title--left' : 'section-title';

  return (
    <header className={className}>
      <p className="section-title__eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-title__subtitle">{subtitle}</p>
    </header>
  );
}
