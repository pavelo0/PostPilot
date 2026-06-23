import { Link } from 'react-router-dom'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const variants = ['primary', 'outline', 'ghost'] as const
const sizes = ['sm', 'md', 'lg'] as const

export function DesignPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Design Playground</h1>
          <p className="text-sm text-muted-foreground">
            Экран для проверки UI-компонентов во время миграции дизайна.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Вернуться на лендинг</Link>
          </Button>
        </div>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Button variants</h2>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Button sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            {sizes.map((size) => (
              <Button key={size} size={size}>
                size {size}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">States</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Input</h2>
          <div className="max-w-sm space-y-3">
            <Input placeholder="you@example.com" className="h-10 rounded-md px-3 text-sm" />
            <Input placeholder="Disabled input" disabled className="h-10 rounded-md px-3 text-sm" />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Textarea</h2>
          <div className="max-w-xl">
            <Textarea
              placeholder="Опишите тему поста..."
              className="min-h-[100px] resize-none px-3 py-2 text-sm"
            />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Badge</h2>
          <div className="flex flex-wrap gap-3">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="outline">outline</Badge>
            <Badge variant="destructive">destructive</Badge>
            <Badge
              variant="secondary"
              className="h-auto rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest"
              style={{
                background: 'oklch(0.420 0.095 200 / 0.10)',
                color: 'oklch(0.420 0.095 200)',
              }}
            >
              Популярный
            </Badge>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Accordion</h2>
          <Accordion type="single" collapsible defaultValue="item-1" className="max-w-2xl space-y-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>Как подключить канал?</AccordionTrigger>
              <AccordionContent>
                Добавьте бота в администраторы канала и подтвердите подключение в дашборде.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Есть ли пробный период?</AccordionTrigger>
              <AccordionContent>
                Да, доступен бесплатный тестовый период без привязки карты.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

      </div>
    </div>
  )
}
