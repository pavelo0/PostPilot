import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';
import {
	BarChart2,
	Calendar,
	FileText,
	LayoutGrid,
	LogOut,
	PanelLeft,
	Radio,
	Settings,
	Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { clearAuthState } from '@/store/auth.slice';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/utils/auth/auth.api';

type NavItem = {
	icon: React.ComponentType<{ size?: number; className?: string }>;
	label: string;
	href: string;
};

const navItems: NavItem[] = [
	{ icon: LayoutGrid, label: 'Обзор', href: '/dashboard' },
	{ icon: FileText, label: 'Посты', href: '/dashboard/posts' },
	{ icon: Sparkles, label: 'AI-помощник', href: '/dashboard/ai-assistant' },
	{ icon: Calendar, label: 'Календарь', href: '/dashboard/calendar' },
	{ icon: Radio, label: 'Каналы', href: '/dashboard/channels' },
	{ icon: BarChart2, label: 'Аналитика', href: '/dashboard/analytics' },
];

function isItemActive(pathname: string, href: string): boolean {
	if (href === '/dashboard') {
		return pathname === '/dashboard';
	}

	return pathname.startsWith(href);
}

export function ServiceSidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [collapsed, setCollapsed] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async (): Promise<void> => {
		if (isLoggingOut) {
			return;
		}

		setIsLoggingOut(true);
		try {
			await logout();
			dispatch(clearAuthState());
			navigate('/login');
		} catch {
			dispatch(clearAuthState());
			navigate('/login');
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<>
			<aside
				className={cn(
					'sticky top-0 z-40 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-border bg-background transition-[width] duration-200 lg:flex',
					collapsed ? 'w-[56px]' : 'w-[216px]'
				)}
			>
				<div
					className={cn(
						'flex h-14 shrink-0 items-center border-b border-border',
						collapsed ? 'justify-center' : 'justify-between px-4'
					)}
				>
					{!collapsed ? (
						<Link
							to="/dashboard"
							className="min-w-0"
							aria-label="PostPilot"
						>
							<BrandLogo
								size="sm"
								className="min-w-0 [&>span:last-child]:truncate"
							/>
						</Link>
					) : null}

					<Button
						onClick={() => setCollapsed(value => !value)}
						variant="ghost"
						size="icon-sm"
						className="h-7 w-7 shrink-0"
						aria-label="Свернуть меню"
					>
						<PanelLeft size={15} />
					</Button>
				</div>

				<nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
					{navItems.map(({ icon: Icon, label, href }) => (
						<Button
							key={href}
							asChild
							variant="ghost"
							size={collapsed ? 'icon' : 'sm'}
							title={collapsed ? label : undefined}
							className={cn(
								collapsed ? 'mx-auto' : 'w-full justify-start gap-2.5 px-2.5 py-2',
								isItemActive(location.pathname, href)
									? 'bg-secondary font-medium text-foreground'
									: ''
							)}
						>
							<Link to={href}>
								<Icon
									size={15}
									className="shrink-0"
								/>
								{!collapsed ? <span className="truncate">{label}</span> : null}
								{!collapsed && isItemActive(location.pathname, href) ? (
									<span
										className="ml-auto h-1 w-1 shrink-0 rounded-full"
										style={{ background: 'oklch(0.420 0.095 200)' }}
									/>
								) : null}
							</Link>
						</Button>
					))}
				</nav>

				<div className="shrink-0 space-y-0.5 border-t border-border px-2 py-2">
					<Button
						asChild
						variant="ghost"
						size={collapsed ? 'icon' : 'sm'}
						title={collapsed ? 'Настройки' : undefined}
						className={cn(
							collapsed ? 'mx-auto' : 'w-full justify-start gap-2.5 px-2.5 py-2',
							isItemActive(location.pathname, '/dashboard/settings')
								? 'bg-secondary font-medium text-foreground'
								: ''
						)}
					>
						<Link to="/dashboard/settings">
							<Settings
								size={15}
								className="shrink-0"
							/>
							{!collapsed ? <span>Настройки</span> : null}
						</Link>
					</Button>
					<Button
						type="button"
						variant="ghost"
						size={collapsed ? 'icon' : 'sm'}
						title={collapsed ? 'Выход' : undefined}
						disabled={isLoggingOut}
						onClick={() => void handleLogout()}
						className={cn(
							collapsed ? 'mx-auto' : 'w-full justify-start gap-2.5 px-2.5 py-2'
						)}
					>
						<LogOut
							size={15}
							className="shrink-0"
						/>
						{!collapsed ? (
							<span>{isLoggingOut ? 'Выходим...' : 'Выход'}</span>
						) : null}
					</Button>
				</div>
			</aside>

			<nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background lg:hidden">
				{[
					...navItems.slice(0, 4),
					{ icon: Settings, label: 'Ещё', href: '/dashboard/settings' }
				].map(({ icon: Icon, label, href }) => (
					<Link
						key={href}
						to={href}
						className={cn(
							'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
							isItemActive(location.pathname, href)
								? 'text-foreground'
								: 'text-muted-foreground'
						)}
					>
						<Icon size={17} />
						<span>{label}</span>
					</Link>
				))}
			</nav>
		</>
	);
}
