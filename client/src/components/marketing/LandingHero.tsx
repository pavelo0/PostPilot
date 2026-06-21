import type { ReactElement } from 'react';
import { UiButtonLink } from '../ui/UiButtonLink';

/**
 * Displays landing hero area with value proposition and primary actions.
 */
export function LandingHero(): ReactElement {
  return (
    <div className="hero">
      <div className="hero__content">
        <p className="hero__eyebrow">PostPilot</p>
        <h1 className="hero__title">
          Управляйте Telegram-каналом с AI и понятным рабочим процессом
        </h1>
        <p className="hero__subtitle">
          Создавайте контент, сохраняйте черновики и публикуйте в один клик.
          PostPilot упрощает работу с каналом на каждом этапе.
        </p>
        <div className="hero__actions">
          <UiButtonLink to="/register" variant="primary" size="lg">
            Начать бесплатно
          </UiButtonLink>
          <UiButtonLink to="#features" variant="secondary" size="lg">
            Смотреть возможности
          </UiButtonLink>
        </div>
      </div>
      <div className="hero__preview" aria-hidden>
        <div className="hero__preview-card">
          <p className="hero__preview-title">Публикации</p>
          <p className="hero__preview-text">12 запланировано на неделю</p>
        </div>
        <div className="hero__preview-card">
          <p className="hero__preview-title">Draft</p>
          <p className="hero__preview-text">Новый пост для релиза 2.1</p>
        </div>
      </div>
    </div>
  );
}
