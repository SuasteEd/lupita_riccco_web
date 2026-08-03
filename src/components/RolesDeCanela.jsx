import { motion, useReducedMotion } from 'motion/react'

export default function RolesDeCanela() {
  const reduce = useReducedMotion()

  return (
    <section id="canela" className="bg-canela py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square w-full overflow-hidden rounded-md">
                <img
                  src="https://res.cloudinary.com/bdeo51wl/image/upload/v1785436785/11_o5uyp0.jpg"
                  alt="Roles de canela recién horneados, sin glaseado"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-square w-full overflow-hidden rounded-md">
                <img
                  src="https://res.cloudinary.com/bdeo51wl/image/upload/v1785436785/12_aarj3g.jpg"
                  alt="Roles de canela con glaseado blanco"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-h2 font-medium">Roles de canela</h2>
            <p className="mt-4 text-ink">
             Los roles de canela nacieron en mi cocina por una razón simple:
            la canela es mi especia favorita. Desde el primer día se convirtieron
            en los más pedidos, y hoy son difíciles de encontrar sin reservar.
            Si visitas la tienda, pregunta si hay disponibles, pero si quieres
            asegurarte, lo mejor es hacer tu pedido con anticipación.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
