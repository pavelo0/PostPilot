'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Bell, Zap } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Настройки</h1>
        <p className="text-muted-foreground">Управляйте настройками вашего аккаунта</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Профиль</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Безопасность</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Уведомления</span>
          </TabsTrigger>
          <TabsTrigger value="billing">
            <Zap className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Биллинг</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Информация профиля</CardTitle>
              <CardDescription>Обновите ваши личные данные</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input defaultValue="Иван Петров" />
                </div>
                <div className="space-y-2">
                  <Label>Фамилия</Label>
                  <Input />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue="ivan@example.com" />
              </div>
              <Button className="bg-accent hover:bg-accent/90">Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Пароль</CardTitle>
              <CardDescription>Изменение пароля аккаунта</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Текущий пароль</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Новый пароль</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Подтвердить пароль</Label>
                <Input type="password" />
              </div>
              <Button className="bg-accent hover:bg-accent/90">Обновить пароль</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Параметры уведомлений</CardTitle>
              <CardDescription>Выберите, когда получать уведомления</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Параметры уведомлений</p>
              <Button variant="outline">Настроить уведомления</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Текущий план</CardTitle>
              <CardDescription>Вы подписаны на план Профессионал</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-semibold">Профессионал</p>
                  <p className="text-sm text-muted-foreground">$79/месяц</p>
                </div>
                <Button variant="outline">Изменить план</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
