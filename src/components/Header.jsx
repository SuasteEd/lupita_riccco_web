import { useEffect, useState } from 'react'
import { List, WhatsappLogo, X } from '@phosphor-icons/react'
import logo from '../assets/logo.png'
import ThemeToggle from './ThemeToggle.jsx'

const NAV_LINKS = [
  { href: '#historia', label: 'Historia' },
  { href: '#favoritos', label: 'Favoritos' },
  { href: '#temporada', label: 'De temporada' },
  { href: '#canela', label: 'Roles de canela' },
  { href: '#contacto', label: 'Contacto' },
]

const WHATSAPP_URL = 'https://wa.me/5214152160729'

export default function Header({ onOpenOrderForm }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[72px] md:px-8">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="Lupita Riccco" className="h-11 w-11 rounded-full" />
          <span className="font-display text-lg font-medium text-brand">Lupita Riccco</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink transition-colors duration-200 hover:text-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Escribir por WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-card hover:text-brand"
          >
            <WhatsappLogo size={20} weight="bold" />
          </a>
          <button
            type="button"
            onClick={onOpenOrderForm}
            className="rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
          >
            Pedido personalizado
          </button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
          >
            {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border-subtle bg-canvas px-4 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-3 text-base font-medium text-ink hover:bg-card"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onOpenOrderForm()
            }}
            className="mt-3 block w-full rounded-pill bg-brand px-5 py-3 text-center text-sm font-semibold text-on-brand"
          >
            Pedido personalizado
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-pill border border-border-subtle px-5 py-3 text-center text-sm font-semibold text-ink"
          >
            Pedir por WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}
