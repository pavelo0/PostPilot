import * as React from 'react'
import { cn } from '@/lib/utils'

type CardProps = React.ComponentProps<'div'>
type CardHeaderProps = React.ComponentProps<'div'>
type CardTitleProps = React.ComponentProps<'h3'>
type CardDescriptionProps = React.ComponentProps<'p'>
type CardContentProps = React.ComponentProps<'div'>
type CardFooterProps = React.ComponentProps<'div'>

/**
 * Base card container for dashboard and marketing blocks.
 */
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn('rounded-xl border border-border bg-card', className)}
      {...props}
    />
  )
}

/**
 * Card header region.
 */
function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex items-center justify-between border-b border-border px-5 py-4', className)}
      {...props}
    />
  )
}

/**
 * Card title text.
 */
function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-sm font-semibold', className)}
      {...props}
    />
  )
}

/**
 * Card subtitle/description text.
 */
function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

/**
 * Main card content wrapper.
 */
function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn('p-5', className)}
      {...props}
    />
  )
}

/**
 * Card footer region.
 */
function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn('border-t border-border px-5 py-3', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
