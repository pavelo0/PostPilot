'use client';

import {
	ArrowUpRight,
	Bot,
	Calendar,
	Eye,
	FileText,
	Lock,
	Plus,
	Radio,
	Send,
	Sparkles,
	TrendingUp,
	Users
} from 'lucide-react';
import Link from 'next/link';

// --- Setup steps shown at the top ---
const steps = [
	{
		n: '1',
		icon: Radio,
		title: 'Подключите Telegram-канал',
		desc: 'Добавьте канал, чтобы PostPilot мог публиковать посты от вашего имени.',
		action: { label: 'Подключить канал', href: '/dashboard/channels' },
		done: false
	},
	{
		n: '2',
		icon: Bot,
		title: 'Активируйте бота',
		desc: 'Добавьте @PostPilotBot администратором канала — это займёт меньше минуты.',
		action: { label: 'Настроить бота', href: '/dashboard/channels' },
		done: false
	},
	{
		n: '3',
		icon: FileText,
		title: 'Создайте первый пост',
		desc: 'Напишите вручную или сгенерируйте контент с помощью AI-помощника.',
		action: { label: 'Создать пост', href: '/dashboard/posts' },
		done: false
	}
];

// --- Locked KPI placeholders ---
const kpis = [
	{ label: 'Подписчики', icon: Users },
	{ label: 'Охват (7 дней)', icon: Eye },
	{ label: 'Публикаций', icon: Send },
	{ label: 'Вовлечённость', icon: TrendingUp }
];

// --- Skeleton post rows ---
const skeletonPosts = [1, 2, 3];

export default function DashboardEmptyPage() {
	return (
		<div className="space-y-6 max-w-5xl">
			{/* ── Onboarding banner ── */}
			<div
				className="rounded-xl border border-border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
				style={{ background: 'oklch(0.420 0.095 200 / 0.06)' }}
			>
				<div
					className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
					style={{ background: 'oklch(0.420 0.095 200 / 0.15)' }}
				>
					<Radio
						size={16}
						style={{ color: 'oklch(0.420 0.095 200)' }}
					/>
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold">Канал ещё не подключён</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						Подключите Telegram-канал и бота, чтобы начать публиковать посты и
						видеть статистику.
					</p>
				</div>
				<Link
					href="/dashboard/channels"
					className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-background transition-colors hover:opacity-90"
					style={{ background: 'oklch(0.420 0.095 200)' }}
				>
					<Plus size={13} />
					Подключить
				</Link>
			</div>

			{/* ── Main two-column block ── */}
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
				{/* LEFT — Next post card (empty state) */}
				<div className="lg:col-span-3 bg-card border border-border rounded-xl flex flex-col overflow-hidden min-h-[280px]">
					{/* Card header */}
					<div className="flex items-center justify-between px-5 py-4 border-b border-border">
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-border" />
							<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Следующая публикация
							</span>
						</div>
					</div>

					{/* Empty body */}
					<div className="flex flex-col flex-1 items-center justify-center px-6 py-10 gap-4 text-center">
						<div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
							<FileText
								size={20}
								className="text-muted-foreground"
							/>
						</div>
						<div>
							<p className="text-sm font-semibold">
								Нет запланированных постов
							</p>
							<p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
								Создайте первый пост или сгенерируйте контент с помощью AI,
								чтобы он появился здесь.
							</p>
						</div>
						<div className="flex flex-wrap gap-2 justify-center">
							<Link
								href="/dashboard/posts"
								className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/85 transition-colors"
							>
								<Plus size={13} />
								Написать пост
							</Link>
							<Link
								href="/dashboard/ai-assistant"
								className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors"
							>
								<Sparkles size={13} />
								Через AI
							</Link>
						</div>
					</div>

					{/* Skeleton date badges */}
					<div className="flex items-center gap-2 px-5 py-4 border-t border-border">
						<div className="h-6 w-28 rounded-full bg-secondary animate-pulse" />
						<div className="h-6 w-16 rounded-full bg-secondary animate-pulse" />
					</div>
				</div>

				{/* RIGHT — Locked stats + setup steps */}
				<div className="lg:col-span-2 flex flex-col gap-4">
					{/* Locked KPI grid */}
					<div className="grid grid-cols-2 gap-3">
						{kpis.map(({ label, icon: Icon }) => (
							<div
								key={label}
								className="bg-card border border-border rounded-xl p-4 relative overflow-hidden"
							>
								{/* Blur overlay */}
								<div className="absolute inset-0 backdrop-blur-[2px] bg-background/60 flex items-center justify-center rounded-xl z-10">
									<Lock
										size={13}
										className="text-muted-foreground/60"
									/>
								</div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-[11px] font-medium text-muted-foreground leading-tight">
										{label}
									</span>
									<div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center shrink-0">
										<Icon
											size={12}
											className="text-muted-foreground"
										/>
									</div>
								</div>
								<div className="h-6 w-16 rounded bg-secondary animate-pulse mb-1" />
								<div className="h-3 w-10 rounded bg-secondary animate-pulse" />
							</div>
						))}
					</div>

					{/* Setup checklist */}
					<div className="bg-card border border-border rounded-xl overflow-hidden">
						<div className="px-4 py-3.5 border-b border-border">
							<h2 className="text-sm font-semibold">Начало работы</h2>
							<p className="text-xs text-muted-foreground mt-0.5">
								Выполните 3 шага, чтобы запустить канал
							</p>
						</div>
						<div className="divide-y divide-border">
							{steps.map(step => {
								const Icon = step.icon;
								return (
									<div
										key={step.n}
										className="px-4 py-4 flex gap-3"
									>
										<div
											className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5"
											style={{
												background: step.done
													? 'oklch(0.420 0.095 200)'
													: 'oklch(0.420 0.095 200 / 0.12)',
												color: step.done ? 'white' : 'oklch(0.420 0.095 200)'
											}}
										>
											{step.n}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium leading-tight">
												{step.title}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
												{step.desc}
											</p>
											<Link
												href={step.action.href}
												className="inline-flex items-center gap-1 text-xs font-medium mt-2 transition-colors hover:underline"
												style={{ color: 'oklch(0.420 0.095 200)' }}
											>
												{step.action.label}
												<ArrowUpRight size={11} />
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* ── Recent posts skeleton ── */}
			<div className="bg-card border border-border rounded-xl overflow-hidden">
				<div className="flex items-center justify-between px-5 py-4 border-b border-border">
					<h2 className="text-sm font-semibold">Последние публикации</h2>
					<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Calendar size={11} />
						Нет публикаций
					</span>
				</div>
				<div className="divide-y divide-border">
					{skeletonPosts.map(i => (
						<div
							key={i}
							className="flex items-center gap-4 px-5 py-4"
						>
							<div className="flex-1 space-y-2">
								<div
									className="h-3.5 rounded bg-secondary animate-pulse"
									style={{ width: `${55 + i * 12}%` }}
								/>
								<div className="h-3 w-24 rounded bg-secondary animate-pulse" />
							</div>
							<div className="shrink-0 text-right space-y-1.5">
								<div className="h-3.5 w-10 rounded bg-secondary animate-pulse ml-auto" />
								<div className="h-3 w-8 rounded bg-secondary animate-pulse ml-auto" />
							</div>
						</div>
					))}
				</div>

				{/* Centered empty CTA */}
				<div className="px-5 py-8 flex flex-col items-center gap-3 border-t border-border">
					<p className="text-sm text-muted-foreground text-center max-w-xs">
						Здесь появятся ваши посты после подключения канала и создания
						первого контента.
					</p>
					<Link
						href="/dashboard/channels"
						className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors"
					>
						<Radio size={13} />
						Подключить канал
					</Link>
				</div>
			</div>
		</div>
	);
}
