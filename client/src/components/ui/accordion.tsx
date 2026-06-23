import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>
type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>
type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger>
type AccordionContentProps = React.ComponentProps<typeof AccordionPrimitive.Content>

/**
 * Shared accordion root.
 */
function Accordion(props: AccordionProps) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

/**
 * Shared accordion item wrapper.
 */
function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('overflow-hidden rounded-xl border border-border bg-background', className)}
      {...props}
    />
  )
}

/**
 * Shared accordion trigger.
 */
function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion inline-flex h-auto w-full items-center justify-between gap-3 px-6 py-5 text-left text-sm font-medium transition-colors hover:bg-secondary/40',
          className,
        )}
        {...props}
      >
        <span className="pr-4">{children}</span>
        <ChevronDown className="size-[15px] shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/accordion:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/**
 * Shared accordion content.
 */
function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        'overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className,
      )}
      {...props}
    >
      <div className="px-6 pb-5 leading-relaxed">{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
