import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
	{ label: 'Возможности', href: '#features' },
	{ label: 'Как работает', href: '#workflow' },
	{ label: 'Цены', href: '#pricing' },
	{ label: 'FAQ', href: '#faq' }
];

export function LandingHeader() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogoClick = (
		event: React.MouseEvent<HTMLAnchorElement>
	): void => {
		event.preventDefault();
		setIsMenuOpen(false);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:grid md:grid-cols-[1fr_auto_1fr]">
				<Link
					to="/"
					className="shrink-0 md:justify-self-start"
					onClick={handleLogoClick}
					aria-label="PostPilot"
				>
					<BrandLogo size="md" />
				</Link>

				<nav className="hidden items-center gap-7 md:flex md:justify-self-center">
					{navLinks.map(navLink => (
						<a
							key={navLink.href}
							href={navLink.href}
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							{navLink.label}
						</a>
					))}
				</nav>

				<div className="hidden items-center gap-3 md:flex md:justify-self-end">
					<Button
						asChild
						variant="ghost"
						size="sm"
					>
						<Link to="/login">Войти</Link>
					</Button>
					<Button
						asChild
						variant="primary"
						size="md"
					>
						<Link to="/register">Начать бесплатно</Link>
					</Button>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground md:hidden"
					onClick={() => setIsMenuOpen(value => !value)}
					aria-expanded={isMenuOpen}
					aria-controls="landing-mobile-menu"
					aria-label="Меню"
				>
					<span className="relative block h-5 w-5">
						<span
							className={`absolute left-0 top-1 block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${
								isMenuOpen ? 'top-2.5 rotate-45' : ''
							}`}
						/>
						<span
							className={`absolute left-0 top-2.5 block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${
								isMenuOpen ? 'opacity-0' : ''
							}`}
						/>
						<span
							className={`absolute left-0 top-4 block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ${
								isMenuOpen ? 'top-2.5 -rotate-45' : ''
							}`}
						/>
					</span>
				</Button>
			</div>

			{isMenuOpen && (
				<div
					id="landing-mobile-menu"
					className="animate-in slide-in-from-top-2 fade-in space-y-1 border-t border-border bg-background px-6 py-4 duration-300 md:hidden"
				>
					{navLinks.map(navLink => (
						<a
							key={navLink.href}
							href={navLink.href}
							className="block py-2 text-sm text-muted-foreground hover:text-foreground"
							onClick={() => setIsMenuOpen(false)}
						>
							{navLink.label}
						</a>
					))}
					<div className="flex flex-col gap-2 pt-3">
						<Button
							asChild
							variant="outline"
							size="md"
						>
							<Link to="/login">Войти</Link>
						</Button>
						<Button
							asChild
							variant="primary"
							size="md"
						>
							<Link to="/register">Начать бесплатно</Link>
						</Button>
					</div>
				</div>
			)}
		</header>
	);
}
