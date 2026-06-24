import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setAuthenticatedUser } from '@/store/auth.slice';
import { useAppDispatch } from '@/store/hooks';
import {
	ApiError,
	resendRegisterCode,
	verifyRegister,
	type ApiValidationError
} from '@/utils/auth/auth.api';
import {
	verifyEmailSchema,
	type VerifyEmailFormData,
	type VerifyEmailFormErrors
} from '@/utils/auth/verify-email.schema';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ClipboardEvent,
	type FormEvent,
	type KeyboardEvent
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export function VerifyEmailPage() {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [searchParams] = useSearchParams();
	const initialEmail = useMemo(
		() => (searchParams.get('email') ?? '').trim().toLowerCase(),
		[searchParams]
	);
	const initialResendIn = useMemo(() => {
		const rawValue = Number(searchParams.get('resend_in') ?? '0');
		return Number.isFinite(rawValue) && rawValue > 0 ? Math.floor(rawValue) : 0;
	}, [searchParams]);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [resendMessage, setResendMessage] = useState<string | null>(null);
	const [digits, setDigits] = useState<string[]>(
		Array.from({ length: 6 }, () => '')
	);
	const [resendSecondsLeft, setResendSecondsLeft] = useState(initialResendIn);
	const [formErrors, setFormErrors] = useState<VerifyEmailFormErrors>({});

	const [codeHint, setCodeHint] = useState<string | null>(
		searchParams.get('code_hint')
	);
	const codeValue = digits.join('');

	useEffect(() => {
		if (resendSecondsLeft <= 0) {
			return;
		}
		const timeoutId = window.setTimeout(() => {
			setResendSecondsLeft(currentValue =>
				currentValue > 0 ? currentValue - 1 : 0
			);
		}, 1000);
		return () => window.clearTimeout(timeoutId);
	}, [resendSecondsLeft]);

	const handleDigitChange =
		(index: number) =>
		(event: FormEvent<HTMLInputElement>): void => {
			const nativeTarget = event.currentTarget;
			const sanitizedValue = nativeTarget.value.replace(/\D/g, '').slice(-1);
			setDigits(currentDigits => {
				const nextDigits = [...currentDigits];
				nextDigits[index] = sanitizedValue;
				return nextDigits;
			});
			setFormErrors(currentErrors => ({
				...currentErrors,
				code: undefined
			}));
			setSubmitError(null);
			if (sanitizedValue && index < inputRefs.current.length - 1) {
				inputRefs.current[index + 1]?.focus();
			}
		};

	const handleDigitKeyDown =
		(index: number) =>
		(event: KeyboardEvent<HTMLInputElement>): void => {
			if (event.key === 'Backspace' && digits[index] === '' && index > 0) {
				inputRefs.current[index - 1]?.focus();
			}
			if (event.key === 'ArrowLeft' && index > 0) {
				event.preventDefault();
				inputRefs.current[index - 1]?.focus();
			}
			if (event.key === 'ArrowRight' && index < inputRefs.current.length - 1) {
				event.preventDefault();
				inputRefs.current[index + 1]?.focus();
			}
		};

	const handleCodePaste = (event: ClipboardEvent<HTMLDivElement>): void => {
		const pastedDigits = event.clipboardData
			.getData('text')
			.replace(/\D/g, '')
			.slice(0, 6);
		if (pastedDigits.length === 0) {
			return;
		}
		event.preventDefault();
		const nextDigits = Array.from(
			{ length: 6 },
			(_, index) => pastedDigits[index] ?? ''
		);
		setDigits(nextDigits);
		setFormErrors(currentErrors => ({
			...currentErrors,
			code: undefined
		}));
		const focusIndex = Math.min(pastedDigits.length, 6) - 1;
		inputRefs.current[Math.max(focusIndex, 0)]?.focus();
	};

	const handleSubmit = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault();

		const validationResult = verifyEmailSchema.safeParse({
			code: codeValue
		} satisfies VerifyEmailFormData);
		if (!validationResult.success) {
			const nextErrors =
				validationResult.error.issues.reduce<VerifyEmailFormErrors>(
					(collectedErrors, issue) => {
						const field = issue.path[0];
						if (!isVerifyEmailField(field)) {
							return collectedErrors;
						}
						if (collectedErrors[field]) {
							return collectedErrors;
						}
						return {
							...collectedErrors,
							[field]: issue.message
						};
					},
					{}
				);
			setFormErrors(nextErrors);
			return;
		}

		if (!initialEmail) {
			setSubmitError(
				'Не найден email для подтверждения. Вернитесь к регистрации.'
			);
			return;
		}

		setIsLoading(true);
		setSubmitError(null);
		try {
			const response = await verifyRegister({
				email: initialEmail,
				code: validationResult.data.code
			});
			dispatch(setAuthenticatedUser(response.user));
			navigate('/dashboard');
		} catch (error) {
			if (error instanceof ApiError) {
				const nextErrors = error.validationErrors.reduce<VerifyEmailFormErrors>(
					(collectedErrors, issue) =>
						applyValidationErrorToVerifyForm(collectedErrors, issue),
					{}
				);
				setFormErrors(nextErrors);
				setSubmitError(error.message);
				if (error.retryAfterSeconds && error.retryAfterSeconds > 0) {
					setResendSecondsLeft(error.retryAfterSeconds);
				}
			} else {
				setSubmitError('Не удалось подтвердить email. Попробуйте снова.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async (): Promise<void> => {
		if (!initialEmail || resendSecondsLeft > 0) {
			return;
		}

		setIsResending(true);
		setSubmitError(null);
		setResendMessage(null);
		try {
			const response = await resendRegisterCode({ email: initialEmail });
			setResendSecondsLeft(response.resendAvailableInSeconds);
			setCodeHint(response.verificationCode ?? null);
			setResendMessage('Новый код отправлен на вашу почту.');
		} catch (error) {
			if (error instanceof ApiError) {
				setSubmitError(error.message);
				if (error.retryAfterSeconds && error.retryAfterSeconds > 0) {
					setResendSecondsLeft(error.retryAfterSeconds);
				}
			} else {
				setSubmitError('Не удалось отправить код повторно. Попробуйте позже.');
			}
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="py-12">
			<h1 className="mb-1.5 text-2xl font-bold tracking-tight">
				Подтвердите email
			</h1>
			<p className="mb-8 text-sm text-muted-foreground">
				Мы отправили код подтверждения на почту{' '}
				<span className="font-medium text-foreground">
					{initialEmail || '—'}
				</span>
				. Введите его, чтобы завершить регистрацию.
			</p>

			<form
				onSubmit={handleSubmit}
				className="space-y-5"
				noValidate
			>
				<div
					className="space-y-1.5"
					onPaste={handleCodePaste}
				>
					<span className="mb-2 text-sm font-medium">Код подтверждения</span>
					<div className="grid grid-cols-6 gap-2">
						{digits.map((digit, index) => (
							<Input
								key={`otp-${index}`}
								ref={element => {
									inputRefs.current[index] = element;
								}}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={digit}
								onInput={handleDigitChange(index)}
								onKeyDown={handleDigitKeyDown(index)}
								aria-invalid={Boolean(formErrors.code)}
								className="h-12 text-center text-lg font-semibold tracking-[0.08em] focus-visible:ring-1"
							/>
						))}
					</div>
					{formErrors.code ? (
						<p className="text-xs text-destructive">{formErrors.code}</p>
					) : null}
				</div>

				<Button
					type="submit"
					disabled={isLoading || !initialEmail}
					variant="primary"
					size="md"
					className="h-10 w-full disabled:opacity-60"
				>
					{isLoading ? 'Проверяем код...' : 'Подтвердить и войти'}
				</Button>

				{submitError ? (
					<p className="text-center text-xs text-destructive">{submitError}</p>
				) : null}

				{resendMessage ? (
					<p className="text-center text-xs text-emerald-600">
						{resendMessage}
					</p>
				) : null}

				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={isResending || resendSecondsLeft > 0 || !initialEmail}
					className="h-9 w-full"
					onClick={() => void handleResendCode()}
				>
					{isResending
						? 'Отправляем код...'
						: resendSecondsLeft > 0
							? `Отправить код повторно через ${resendSecondsLeft}с`
							: 'Отправить код повторно'}
				</Button>

				{codeHint ? (
					<p className="text-center text-xs text-muted-foreground">
						Dev-код для проверки:{' '}
						<span className="font-medium text-foreground">{codeHint}</span>
					</p>
				) : null}
			</form>

			<p className="mt-6 text-center text-xs text-muted-foreground">
				Нужен другой email?{' '}
				<Link
					to="/register"
					className="underline underline-offset-4 hover:text-foreground"
				>
					Вернуться к регистрации
				</Link>
			</p>
		</div>
	);
}

const isVerifyEmailField = (
	field: unknown
): field is keyof VerifyEmailFormData => field === 'code';

const applyValidationErrorToVerifyForm = (
	currentErrors: VerifyEmailFormErrors,
	issue: ApiValidationError
): VerifyEmailFormErrors => {
	if (!isVerifyEmailField(issue.field)) {
		return currentErrors;
	}

	if (currentErrors[issue.field]) {
		return currentErrors;
	}

	return {
		...currentErrors,
		[issue.field]: issue.message
	};
};
