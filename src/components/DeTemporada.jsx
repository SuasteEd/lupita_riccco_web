import { motion, useReducedMotion } from 'motion/react'

const SABORES = [
  {
    name: 'Frutos rojos',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436785/16_fjxxck.jpg',
    alt: 'Pan de muerto relleno de frutos rojos, entre flores de cempasúchil',
  },
  {
    name: 'Ferrero Rocher',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436787/17_luwswu.jpg',
    alt: 'Pan de muerto relleno de Ferrero Rocher, con chocolates enteros encima',
  },
  {
    name: 'Fresas con crema',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436788/19_hvnefv.jpg',
    alt: 'Pan de muerto relleno de fresas con crema, junto a una vela encendida',
  },
  {
    name: 'Carlota de limón',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436788/20_rjsjep.jpg',
    alt: 'Pan de muerto relleno de carlota de limón, decorado con un gajo de limón',
  },
]

export default function DeTemporada() {
  const reduce = useReducedMotion()

  return (
    <section id="temporada" className="bg-temporada py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-[65ch]">
          <motion.h2
            className="text-h2 font-medium"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            De temporada: pan de muerto
          </motion.h2>
          <div className="mt-5 space-y-4 text-ink">
            <p>
              Mis panes de muerto son muy conocidos por su delicioso relleno,
              que los lleva a otro nivel. Mi parte favorita del otoño, que
              también es mi estación favorita, es llenar la cocina con los
              aromas de azahares, ralladura de naranja y otros ingredientes
              mientras preparo este pan tradicional.
            </p>
          </div>
        </div>

        <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {SABORES.map((item, i) => (
            <motion.div
              key={item.name}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              className="w-64 flex-shrink-0 snap-start md:w-auto"
            >
              <div className="aspect-square w-full overflow-hidden rounded-md">
                <img
                  src={item.img}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 text-center font-display text-h3 text-brand">
                {item.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
