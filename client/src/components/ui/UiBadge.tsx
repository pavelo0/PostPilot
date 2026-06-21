import type { ReactElement, ReactNode } from 'react';

type UiBadgeProps = {
  children: ReactNode;
};

/**
 * Displays compact label chip used in previews.
 */
export function UiBadge({ children }: UiBadgeProps): ReactElement {
  return <span className="ui-badge">{children}</span>;
}
