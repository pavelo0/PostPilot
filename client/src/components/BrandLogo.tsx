import logo from '@/assets/logo.svg'
import { cn } from '@/lib/utils'

type BrandLogoSize = 'sm' | 'md'

const sizeStyles: Record<
	BrandLogoSize,
	{ icon: string; text: string; gap: string }
> = {
	sm: {
		icon: 'h-7 w-auto',
		text: 'text-[15px]',
		gap: 'gap-2.5'
	},
	md: {
		icon: 'h-9 w-auto',
		text: 'text-base',
		gap: 'gap-3'
	}
}

type BrandLogoProps = {
	/** Visual scale of icon and wordmark */
	size?: BrandLogoSize
	/** Show "PostPilot" wordmark next to the icon */
	showText?: boolean
	className?: string
}

/**
 * PostPilot brand mark: logo icon with optional wordmark.
 */
export function BrandLogo({
	size = 'md',
	showText = true,
	className
}: BrandLogoProps) {
	const styles = sizeStyles[size]

	return (
		<span
			className={cn(
				'inline-flex shrink-0 items-center',
				styles.gap,
				className
			)}
		>
			<img
				src={logo}
				alt=""
				className={cn('shrink-0', styles.icon)}
				aria-hidden
			/>
			{showText ? (
				<span
					className={cn(
						'font-semibold tracking-tight',
						styles.text
					)}
				>
					PostPilot
				</span>
			) : null}
		</span>
	)
}
