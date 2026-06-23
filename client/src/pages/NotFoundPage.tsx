import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
        <p
          className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: 'oklch(0.420 0.095 200)' }}
        >
          Error 404
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Страница не найдена
        </h1>
        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
          Возможно, ссылка устарела или вы ввели неверный адрес. Вернитесь на главную или
          откройте дашборд.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            На лендинг
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            style={{ background: 'oklch(0.130 0.010 255)' }}
          >
            В дашборд
          </Link>
        </div>
      </div>
    </div>
  )
}
