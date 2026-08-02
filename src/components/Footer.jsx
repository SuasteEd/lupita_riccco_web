import { FacebookLogo, InstagramLogo, WhatsappLogo } from '@phosphor-icons/react'
import { Link } from 'react-router'
import logo from '../assets/logo.png'
import Mapa from './Mapa.jsx'

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/share/1AzQNGcUqZ', label: 'Facebook', Icon: FacebookLogo },
  { href: 'https://www.instagram.com/lupitariccco', label: 'Instagram', Icon: InstagramLogo },
  { href: 'https://wa.me/5214152160729', label: 'WhatsApp', Icon: WhatsappLogo },
]

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-border-subtle bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
        <img src={logo} alt="Lupita Riccco" className="h-16 w-16 rounded-full" />

        <p className="max-w-md text-ink-soft">
          Cafetería y repostería artesanal en Los Rodríguez. Escríbenos y con
          gusto te ayudamos con tu pedido.
        </p>

        <Mapa />

        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle text-brand transition-colors duration-200 hover:bg-brand hover:text-on-brand"
            >
              <Icon size={22} weight="bold" />
            </a>
          ))}
        </div>

        <a
          href="https://wa.me/5214152160729"
          target="_blank"
          rel="noreferrer"
          className="rounded-pill bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
        >
          Pedir por WhatsApp
        </a>

        <div className="flex items-center gap-4 text-xs text-ink-soft">
          <Link to="/privacidad" className="hover:text-brand hover:underline">
            Política de privacidad
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/terminos" className="hover:text-brand hover:underline">
            Términos y condiciones
          </Link>
        </div>

        <p className="text-sm text-ink-soft">
          Lupita Riccco, Los Rodríguez. Hecho a mano desde 2020.
        </p>
      </div>
    </footer>
  )
}
