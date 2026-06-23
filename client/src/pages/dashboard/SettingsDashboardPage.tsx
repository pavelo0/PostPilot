import { useState } from 'react'
import { Bell, Lock, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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

      <Card className="grid grid-cols-4 gap-2 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              variant="ghost"
              size="sm"
              className={`h-auto justify-center gap-2 px-3 py-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          )
        })}
      </Card>

      {activeTab === 'profile' ? (
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-semibold">Информация профиля</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-sm">Имя</span>
              <Input
                defaultValue="Иван"
                className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm">Фамилия</span>
              <Input
                defaultValue="Петров"
                className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm">Email</span>
            <Input
              type="email"
              defaultValue="ivan@example.com"
              className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
              style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
            />
          </label>
          <Button variant="primary" size="md">
            Сохранить
          </Button>
        </Card>
      ) : null}

      {activeTab === 'security' ? (
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-semibold">Пароль</h2>
          {['Текущий пароль', 'Новый пароль', 'Подтвердить пароль'].map((label) => (
            <label key={label} className="block space-y-2">
              <span className="text-sm">{label}</span>
              <Input
                type="password"
                className="h-10 rounded-md px-3 text-sm focus-visible:ring-1"
                style={{ '--tw-ring-color': 'oklch(0.420 0.095 200)' } as React.CSSProperties}
              />
            </label>
          ))}
          <Button variant="primary" size="md">
            Обновить пароль
          </Button>
        </Card>
      ) : null}

      {activeTab === 'notifications' ? (
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-semibold">Параметры уведомлений</h2>
          <p className="text-sm text-muted-foreground">
            Эта секция пока в режиме переноса верстки.
          </p>
          <Button variant="outline" size="md">
            Настроить уведомления
          </Button>
        </Card>
      ) : null}

      {activeTab === 'billing' ? (
        <Card className="space-y-4 p-5">
          <h2 className="text-base font-semibold">Текущий план</h2>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
            <div>
              <p className="font-semibold">Профессионал</p>
              <p className="text-sm text-muted-foreground">2 490 ₽/месяц</p>
            </div>
            <Button variant="outline" size="md">
              Изменить план
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
