import { motion, useReducedMotion } from 'motion/react'
import { Storefront } from '@phosphor-icons/react'
import ImagePlaceholder from './ImagePlaceholder.jsx'

export default function Hero({ onOpenOrderForm }) {
  const reduce = useReducedMotion()

  return (
    <section id="top" className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:items-center md:gap-12 md:px-8 md:pt-16">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-display text-hero font-medium text-brand">
          Bienvenida a Lupita Riccco
        </h1>
        <p className="mt-5 max-w-md text-ink-soft">
          Cafetería y repostería artesanal en Los Rodríguez. Pasteles, pan de
          muerto y roles de canela hechos a mano, receta a receta.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onOpenOrderForm}
            className="rounded-pill bg-brand px-6 py-3.5 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
          >
            Solicitar pedido personalizado
          </button>
          <a
            href="#favoritos"
            className="rounded-pill border border-border-subtle px-6 py-3.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand"
          >
            Ver el menú
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <ImagePlaceholder
          Icon={Storefront}
          iconSize={72}
          className="aspect-[4/5] w-full"
          note="Foto o ilustración de línea del local o del pastel insignia, en el estilo de la portada de WhatsApp (manos brindando con pastel y bebida)."
        />
      </motion.div>
    </section>
  )
}
