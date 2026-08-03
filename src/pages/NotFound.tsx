import { Link } from 'react-router'
import logo from '../assets/logo.png'
import Footer from '../components/Footer.jsx'

export default function NotFound() {
  return (
    <>
      <header className="border-b border-border-subtle bg-canvas">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:h-[72px] md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Lupita Riccco" className="h-11 w-11 rounded-full" />
            <span className="font-display text-lg font-medium text-brand">Lupita Riccco</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[700px] flex-col items-center px-4 py-24 text-center md:px-8 md:py-32">
        <p className="font-display text-6xl font-medium text-brand">404</p>
        <h1 className="mt-4 font-display text-h2 font-medium text-ink">Página no encontrada</h1>
        <p className="mt-3 text-ink-soft">
          La página que buscas no existe o la dirección está mal escrita.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-md bg-brand px-6 py-3 text-sm font-medium text-canvas"
        >
          Volver al inicio
        </Link>
      </main>

      <Footer />
    </>
  )
}
