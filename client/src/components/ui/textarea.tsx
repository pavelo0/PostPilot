import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'min-h-20 w-full min-w-0 text-base transition-colors outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      variant: {
        default:
          'rounded-lg border border-input bg-transparent px-2.5 py-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80',
        embedded:
          'rounded-none border-0 bg-transparent px-2.5 py-2 focus-visible:border-transparent focus-visible:ring-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type TextareaProps = React.ComponentProps<'textarea'> &
  VariantProps<typeof textareaVariants>

/**
 * Shared textarea with the same visual language as Input.
 */
function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea }
