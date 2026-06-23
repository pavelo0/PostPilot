import logo from '@/assets/logo.svg';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const navLinks = [
	{ label: 'Возможности', href: '#features' },
	{ label: 'Как работает', href: '#workflow' },
	{ label: 'Цены', href: '#pricing' },
	{ label: 'FAQ', href: '#faq' }
];

export function LandingHeader() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
				<Link
					to="/"
					className="flex shrink-0 items-center gap-2.5"
				>
					<div
						className="flex h-7 w-7 items-center justify-center rounded-md"
						style={{ background: '#fff' }}
					>
						<img
							src={logo}
							alt="PostPilot"
							className="h-7 w-7"
						/>
					</div>
					<span className="text-[15px] font-semibold tracking-tight">
						PostPilot
					</span>
				</Link>

				<nav className="hidden items-center gap-7 md:flex">
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

				<div className="hidden items-center gap-3 md:flex">
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
					aria-label="Меню"
				>
					{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
				</Button>
			</div>

			{isMenuOpen && (
				<div className="space-y-1 border-t border-border bg-background px-6 py-4 md:hidden">
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
