import { motion, useReducedMotion } from 'motion/react'
import { Spiral } from '@phosphor-icons/react'
import ImagePlaceholder from './ImagePlaceholder.jsx'

export default function RolesDeCanela() {
  const reduce = useReducedMotion()

  return (
    <section id="canela" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <ImagePlaceholder
            Icon={Spiral}
            iconSize={64}
            className="aspect-[4/3] w-full"
            note="Foto real de los roles de canela recién horneados, saliendo del horno o en charola."
          />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-h2 font-medium">Roles de canela</h2>
          <p className="mt-4 text-ink">
            Mis roles de canela, preparados desde cero en mi cocina, son muy
            populares y han sido clave para ganar seguidores. Elegí hacer
            roles porque la canela es mi especia favorita. Si visitas la
            tienda, te los recomiendo.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
