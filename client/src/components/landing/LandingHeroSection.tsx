import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingHeroSection() {
	return (
		<section className="px-6 pb-28 pt-24">
			<div className="mx-auto max-w-6xl">
				{/* <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.420_0.095_200)]" />
          Платформа для Telegram-команд
        </div> */}

				<h1 className="mb-7 max-w-3xl text-balance text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
					Управляйте Telegram-каналом{' '}
					<span style={{ color: 'oklch(0.420 0.095 200)' }}>
						как медиаактивом
					</span>
				</h1>

				<p className="mb-7 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
					PostPilot автоматизирует весь цикл контента: создание,
					AI-редактирование, планирование, публикацию через бота и аналитику — в
					одном рабочем пространстве.
				</p>

				<div className="flex flex-wrap items-center gap-4">
					<Button
						asChild
						variant="primary"
						size="lg"
					>
						<Link to="/register">
							Начать бесплатно
							<ArrowRight size={15} />
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
					>
						<a href="#workflow">Как это работает</a>
					</Button>
				</div>

				<div className="mt-16 flex flex-wrap items-center gap-10 border-t border-border pt-8">
					{[
						{ value: '10 000+', label: 'публикаций создано' },
						{ value: '98%', label: 'uptime бота' },
						{ value: '3 мин', label: 'среднее время настройки' }
					].map(stat => (
						<div key={stat.label}>
							<div className="text-2xl font-bold tabular-nums">
								{stat.value}
							</div>
							<div className="mt-0.5 text-sm text-muted-foreground">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
