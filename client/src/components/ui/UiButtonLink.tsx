import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'md' | 'lg';

type UiButtonLinkProps = {
  to: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * Renders design-system button styled as navigation link.
 */
export function UiButtonLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
}: UiButtonLinkProps): ReactElement {
  const className = [
    'ui-button',
    variant === 'primary' ? 'ui-button--primary' : 'ui-button--secondary',
    size === 'lg' ? 'ui-button--lg' : 'ui-button--md',
  ].join(' ');

  if (to.startsWith('#')) {
    return (
      <a className={className} href={to}>
        {children}
      </a>
    );
  }

  return <Link className={className} to={to}>{children}</Link>;
}
