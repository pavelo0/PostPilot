import type { ReactElement } from 'react';
import { SectionTitle } from '../components/ui/SectionTitle';
import { UiBadge } from '../components/ui/UiBadge';
import { UiButtonLink } from '../components/ui/UiButtonLink';
import { UiCard } from '../components/ui/UiCard';
import { UiInputPreview } from '../components/ui/UiInputPreview';

/**
 * Provides public preview route for core design-system elements.
 */
export function DesignSystemPage(): ReactElement {
  return (
    <section className="design-system-page">
      <SectionTitle
        eyebrow="Design System"
        title="Базовые элементы внешнего интерфейса"
        subtitle="Светлая тема с красными акцентами. Эта страница — единый reference для UI."
      />

      <div className="design-system-grid">
        <UiCard title="Buttons">
          <div className="design-system-inline">
            <UiButtonLink to="/register" variant="primary">
              Primary CTA
            </UiButtonLink>
            <UiButtonLink to="/login" variant="secondary">
              Secondary CTA
            </UiButtonLink>
          </div>
        </UiCard>

        <UiCard title="Badges">
          <div className="design-system-inline">
            <UiBadge>Draft</UiBadge>
            <UiBadge>Published</UiBadge>
            <UiBadge>Failed</UiBadge>
          </div>
        </UiCard>

        <UiCard title="Input">
          <UiInputPreview
            label="Channel username"
            placeholder="@my_channel"
          />
        </UiCard>

        <UiCard title="Typography">
          <p className="design-type-display">Display 48</p>
          <p className="design-type-headline">Headline 24</p>
          <p className="design-type-body">
            Body 16 — readable text for long descriptions and helper copy.
          </p>
        </UiCard>

        <UiCard title="Colors">
          <div className="design-colors">
            <div className="design-color design-color--surface">
              <span>Surface</span>
              <small>#FFF8F7</small>
            </div>
            <div className="design-color design-color--primary">
              <span>Primary</span>
              <small>#BF2B2B</small>
            </div>
            <div className="design-color design-color--container">
              <span>Container</span>
              <small>#FFFFFF</small>
            </div>
          </div>
        </UiCard>
      </div>
    </section>
  );
}
