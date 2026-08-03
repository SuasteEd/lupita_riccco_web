import { motion, useReducedMotion } from 'motion/react'

/*
  Fotos reales del negocio, alojadas en Cloudinary (cloud_name bdeo51wl).
  Cada una se eligió como la mejor toma disponible de ese producto entre
  varias opciones — ver conversación para el resto del set si se necesita
  variar alguna más adelante.
*/
const FAVORITOS = [
  {
    name: 'Helados en forma de fruta',
    note: 'Los únicos en la comunidad que los hacen.',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436781/4_tj16b8.jpg',
    alt: 'Postres helados con forma y color de fruta real, sobre platitos individuales',
    span: 'md:col-span-2 md:row-span-2',
    aspect: 'aspect-square md:aspect-auto md:h-full',
  },
  {
    name: 'Queso y zarzamora',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436789/23_r38ldx.jpg',
    alt: 'Rebanada de pastel de queso y zarzamora siendo levantada del pastel completo',
    span: 'md:col-span-2',
    aspect: 'aspect-[4/3]',
  },
  {
    name: 'Pastel desnudo relleno de frutas (redondo)',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436786/13_w253f9.jpg',
    alt: 'Pastel desnudo redondo relleno de frutas, cubierto de moras frescas',
    span: 'md:col-span-1',
    aspect: 'aspect-[4/5]',
  },
  {
    name: 'Pastel desnudo relleno de frutas (rectangular)',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436787/14_cesbid.jpg',
    alt: 'Pastel desnudo rectangular relleno de frutas, cubierto de moras frescas',
    span: 'md:col-span-1',
    aspect: 'aspect-[4/5]',
  },
  {
    name: 'Zanahoria',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436789/25_wxsemf.jpg',
    alt: 'Rebanada de pastel de zanahoria decorada con una zanahoria de betún',
    span: 'md:col-span-1',
    aspect: 'aspect-[4/5]',
  },
  {
    name: 'Chocolate',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436790/24_ubm383.jpg',
    alt: 'Rebanada de pastel de chocolate con relleno de ganache',
    span: 'md:col-span-1',
    aspect: 'aspect-[4/5]',
  },
  {
    name: 'Cheesecake',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436781/8_pljgfx.jpg',
    alt: 'Tres cheesecakes individuales, con frutos rojos y con caramelo',
    span: 'md:col-span-1',
    aspect: 'aspect-[4/5]',
  },
  {
    name: 'Fresas con crema',
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436781/2_tgg0xm.jpg',
    alt: 'Dos vasos de fresas con crema en capas',
    span: 'md:col-span-1',
    aspect: 'aspect-[4/5]',
    note: 'Incluye cheesecake o brownie'
  },
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
        Nuestros favoritos
      </motion.h2>
      <p className="mt-3 max-w-md text-ink-soft">Lo que más piden en la tienda.</p>

      <div className="mt-10 grid grid-flow-dense gap-5 md:grid-cols-4">
        {FAVORITOS.map((item, i) => (
          <motion.div
            key={item.name}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
            className={`group flex flex-col ${item.span ?? ''}`}
          >
            <div className={`overflow-hidden rounded-md ${item.aspect} md:flex-1`}>
              <img
                src={item.img}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <p className="mt-3 font-display text-h3 text-brand">{item.name}</p>
            {item.note && <p className="text-sm text-ink-soft">{item.note}</p>}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
