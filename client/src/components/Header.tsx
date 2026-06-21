import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

type HeaderMode = 'landing' | 'app';

type HeaderProps = {
	mode: HeaderMode;
};

/**
 * Renders top navigation for public and app areas.
 */
export default function Header({ mode }: HeaderProps): ReactElement {
	const isAppMode = mode === 'app';
	const headerClassName = isAppMode
		? 'site-header site-header--app'
		: 'site-header site-header--landing';

	const links = isAppMode
		? [
				{ to: '/app', label: 'Кабинет', kind: 'route' as const },
				{ to: '/app/channel', label: 'Канал', kind: 'route' as const },
			]
		: [
				{ to: '#features', label: 'Возможности', kind: 'anchor' as const },
				{ to: '#workflow', label: 'Процесс', kind: 'anchor' as const },
				{ to: '#pricing', label: 'Тарифы', kind: 'anchor' as const },
				{ to: '#faq', label: 'FAQ', kind: 'anchor' as const },
			];

	return (
		<header className={headerClassName}>
			<div className="site-header__inner">
				<Link to={isAppMode ? '/app' : '/'} className="site-header__brand">
					<img
						src={logo}
						alt="PostPilot logo"
						className="site-header__logo"
					/>
					<span className="site-header__brand-name">PostPilot</span>
				</Link>

				<nav
					className="site-header__center-nav"
					aria-label="Основная навигация"
				>
					{links.map(item =>
						item.kind === 'route' ? (
							<Link
								key={item.to}
								className="site-header__link"
								to={item.to}
							>
								{item.label}
							</Link>
						) : (
							<a
								key={item.to}
								className="site-header__link"
								href={item.to}
							>
								{item.label}
							</a>
						)
					)}
				</nav>

				<div className="site-header__actions">
					{isAppMode ? (
						<Link
							className="site-header__action-button"
							to="/"
						>
							Лендинг
						</Link>
					) : (
						<>
							<Link
								className="site-header__action-button"
								to="/login"
							>
								Войти
							</Link>
							<Link
								className="site-header__action-button site-header__action-button--primary"
								to="/register"
							>
								Начать
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
