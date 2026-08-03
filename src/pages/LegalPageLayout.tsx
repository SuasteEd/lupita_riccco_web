import type { ReactNode } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'
import logo from '../assets/logo.png'
import Footer from '../components/Footer.jsx'

/*
  Header minimalista a propósito (no el Header.jsx del sitio principal):
  estas páginas no llevan nav de secciones ni botón de pedido — son
  documentos independientes, solo logo + regreso al inicio. El footer SÍ
  es el mismo componente real del sitio (incluye los links a estas dos
  páginas legales entre sí, lo cual es el comportamiento esperado).

  El botón de "Regresar" es necesario porque estas páginas se abren con
  target="_blank" desde el formulario de pedido — en iOS, cuando el sitio
  corre como PWA (agregado a inicio), target="_blank" no abre una pestaña
  nueva, navega en la misma ventana sin gesto nativo de regreso, así que
  sin este botón no hay forma de volver al formulario sin perder el progreso.

  Como esa pestaña nueva arranca con historial vacío (nunca hubo una
  navegación previa dentro de ella), navigate(-1) no tiene a dónde ir —
  por eso solo lo usamos si sí hay historial (por ejemplo, si el usuario
  saltó entre /terminos y /privacidad desde el footer); si no, cerramos
  la pestaña para regresar a la del formulario, que sigue intacta.
*/
export function LegalPageLayout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      window.close()
    }
  }

  return (
    <>
      <header className="border-b border-border-subtle bg-canvas">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[72px] md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Lupita Riccco" className="h-11 w-11 rounded-full" />
            <span className="font-display text-lg font-medium text-brand">Lupita Riccco</span>
          </Link>

          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm font-medium text-brand"
          >
            <ArrowLeft size={18} weight="bold" />
            Regresar
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[700px] px-4 py-16 md:px-8 md:py-20">
        <h1 className="font-display text-h2 font-medium text-brand">{title}</h1>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
      </main>

      <Footer />
    </>
  )
}

export function LegalSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-ink">
        {number}. {title}
      </h2>
      <div className="mt-2 flex flex-col gap-3 text-ink-soft [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>
    </section>
  )
}
