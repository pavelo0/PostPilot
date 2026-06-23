import { useState } from 'react'
import { Bell, Lock, User, Zap } from 'lucide-react'

type TabKey = 'profile' | 'security' | 'notifications' | 'billing'

const tabs: Array<{ id: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'security', label: 'Безопасность', icon: Lock },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'billing', label: 'Биллинг', icon: Zap },
]

export function SettingsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Управляйте настройками вашего аккаунта</p>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-card p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'profile' ? (
        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Информация профиля</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm">Имя</span>
              <input
                defaultValue="Иван"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm">Фамилия</span>
              <input
                defaultValue="Петров"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm">Email</span>
            <input
              type="email"
              defaultValue="ivan@example.com"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
          </label>
          <button
            className="rounded-md px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
            style={{ background: 'oklch(0.130 0.010 255)' }}
          >
            Сохранить
          </button>
        </section>
      ) : null}

      {activeTab === 'security' ? (
        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Пароль</h2>
          {['Текущий пароль', 'Новый пароль', 'Подтвердить пароль'].map((label) => (
            <label key={label} className="block space-y-2">
              <span className="text-sm">{label}</span>
              <input
                type="password"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
          ))}
          <button
            className="rounded-md px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
            style={{ background: 'oklch(0.130 0.010 255)' }}
          >
            Обновить пароль
          </button>
        </section>
      ) : null}

      {activeTab === 'notifications' ? (
        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Параметры уведомлений</h2>
          <p className="text-sm text-muted-foreground">
            Эта секция пока в режиме переноса верстки.
          </p>
          <button className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary">
            Настроить уведомления
          </button>
        </section>
      ) : null}

      {activeTab === 'billing' ? (
        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Текущий план</h2>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
            <div>
              <p className="font-semibold">Профессионал</p>
              <p className="text-sm text-muted-foreground">2 490 ₽/месяц</p>
            </div>
            <button className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary">
              Изменить план
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
