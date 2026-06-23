import { AuthBrand } from '@/components/auth/AuthBrand';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
	return (
		<div className="flex min-h-screen bg-background">
			<section className="flex w-full flex-col justify-between px-8 py-8 lg:max-w-[520px]">
				<AuthBrand />
				<Outlet />
				<p className="text-xs text-muted-foreground">
					Продолжая, вы принимаете условия использования и политику
					конфиденциальности.
				</p>
			</section>

			<aside className="hidden flex-1 flex-col justify-between border-l border-border bg-secondary/30 p-12 lg:flex">
				<div />
				<div>
					<blockquote className="mb-6 text-xl leading-snug font-medium tracking-tight text-balance">
						&ldquo;PostPilot сократил время на контент-менеджмент нашего канала
						с 4 часов до 20 минут в день.&rdquo;
					</blockquote>
					<div>
						<p className="text-sm font-medium">Павел Мельник</p>
						<p className="text-sm text-muted-foreground">
							Основатель, @homeholder_realty
						</p>
					</div>
				</div>
				<div className="flex items-center gap-6 text-xs text-muted-foreground">
					<span>10 000+ публикаций</span>
					<span className="h-3 w-px bg-border" />
					<span>98% uptime</span>
					<span className="h-3 w-px bg-border" />
					<span>14 дней бесплатно</span>
				</div>
			</aside>
		</div>
	);
}
