import { motion, useReducedMotion } from 'motion/react'
import { Cookie, Sparkle, Heart } from '@phosphor-icons/react'
import ImagePlaceholder from './ImagePlaceholder.jsx'

const FAVORITOS = [
  { name: 'Chocolate', Icon: Cookie, note: 'Foto real del pastel de chocolate, corte mostrando el relleno.' },
  { name: 'Zarzamora', Icon: Sparkle, note: 'Foto real del pastel de zarzamora.' },
  { name: 'Red Velvet', Icon: Heart, note: 'Foto real del pastel red velvet.' },
]

export default function Favoritos() {
  const reduce = useReducedMotion()

  return (
    <section id="favoritos" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <motion.h2
        className="text-h2 font-medium"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        ¡Los favoritos!
      </motion.h2>
      <p className="mt-3 max-w-md text-ink-soft">
        Los tres sabores que más piden en la tienda.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="group md:row-span-2"
        >
          <ImagePlaceholder
            Icon={FAVORITOS[0].Icon}
            iconSize={64}
            className="aspect-[4/5] w-full transition-transform duration-300 group-hover:-translate-y-1 md:aspect-auto md:h-full"
            note={FAVORITOS[0].note}
          />
          <p className="mt-3 font-display text-h3 text-brand">{FAVORITOS[0].name}</p>
        </motion.div>

        {FAVORITOS.slice(1).map((item, i) => (
          <motion.div
            key={item.name}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.08 * (i + 1), ease: [0.16, 1, 0.3, 1] }}
            className="group"
          >
            <ImagePlaceholder
              Icon={item.Icon}
              iconSize={48}
              className="aspect-[4/3] w-full transition-transform duration-300 group-hover:-translate-y-1"
              note={item.note}
            />
            <p className="mt-3 font-display text-h3 text-brand">{item.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
