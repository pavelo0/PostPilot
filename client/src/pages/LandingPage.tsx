import type { ReactElement } from 'react';
import { LandingFaq } from '../components/marketing/LandingFaq';
import { LandingFeatureGrid } from '../components/marketing/LandingFeatureGrid';
import { LandingHero } from '../components/marketing/LandingHero';
import { LandingPricing } from '../components/marketing/LandingPricing';
import { LandingWorkflow } from '../components/marketing/LandingWorkflow';
import { SectionTitle } from '../components/ui/SectionTitle';

/**
 * Shows public landing with clear auth entry points.
 */
export function LandingPage(): ReactElement {
  return (
    <section className="landing-page">
      <section id="hero" className="landing-section landing-section--hero">
        <LandingHero />
      </section>

      <section id="features" className="landing-section">
        <SectionTitle
          eyebrow="Features"
          title="Все ключевые инструменты в одном интерфейсе"
          subtitle="Собрали в лендинг только то, что реально ускоряет публикацию контента."
        />
        <LandingFeatureGrid />
      </section>

      <section id="workflow" className="landing-section landing-section--muted">
        <SectionTitle
          eyebrow="Workflow"
          title="Простой рабочий процесс"
          subtitle="От подключения канала до публикации за четыре последовательных шага."
        />
        <LandingWorkflow />
      </section>

      <section id="pricing" className="landing-section">
        <SectionTitle
          eyebrow="Pricing"
          title="Прозрачные тарифы без скрытых условий"
          subtitle="Выберите план под текущий этап и масштабируйтесь по мере роста."
        />
        <LandingPricing />
      </section>

      <section id="faq" className="landing-section landing-section--muted">
        <SectionTitle
          eyebrow="FAQ"
          title="Ответы на частые вопросы"
          subtitle="Коротко о безопасности, запуске и поддерживаемых сценариях."
        />
        <LandingFaq />
      </section>
    </section>
  );
}
