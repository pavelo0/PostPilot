import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { UiButtonLink } from './ui/UiButtonLink';

/**
 * Renders public marketing footer with quick navigation.
 */
export default function Footer(): ReactElement {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section className="site-footer__cta">
          <div>
            <h2 className="site-footer__title">Готовы ускорить публикации?</h2>
            <p className="site-footer__subtitle">
              Подключите канал и запустите первый рабочий сценарий в PostPilot уже сегодня.
            </p>
          </div>
          <UiButtonLink to="/register" variant="primary" size="lg">
            Начать бесплатно
          </UiButtonLink>
        </section>

        <section className="site-footer__grid">
          <div>
            <p className="site-footer__brand">PostPilot</p>
            <p className="site-footer__description">
              AI-powered workflow для Telegram-команд.
            </p>
          </div>
          <nav className="site-footer__links" aria-label="Навигация футера">
            <a href="#features">Возможности</a>
            <a href="#workflow">Процесс</a>
            <a href="#pricing">Тарифы</a>
            <a href="#faq">FAQ</a>
            <Link to="/login">Вход</Link>
          </nav>
        </section>

        <small className="site-footer__copyright">
          © {new Date().getFullYear()} PostPilot. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
