'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Возможности', href: '#features' },
  { label: 'Как работает', href: '#workflow' },
  { label: 'Цены', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function LandingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[--accent] flex items-center justify-center" style={{ background: 'oklch(0.420 0.095 200)' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 6.5L4.5 9.5L11.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-tight">PostPilot</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md">
            Войти
          </Link>
          <Link href="/register" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-md hover:bg-foreground/85 transition-colors">
            Начать бесплатно
          </Link>
        </div>

        <button className="md:hidden p-1.5 text-muted-foreground hover:text-foreground" onClick={() => setOpen(!open)} aria-label="Меню">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-1">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/login" className="text-sm text-center border border-border rounded-md py-2.5 hover:bg-secondary transition-colors">Войти</Link>
            <Link href="/register" className="text-sm text-center font-medium bg-foreground text-background rounded-md py-2.5 hover:bg-foreground/85 transition-colors">Начать бесплатно</Link>
          </div>
        </div>
      )}
    </header>
  )
}
