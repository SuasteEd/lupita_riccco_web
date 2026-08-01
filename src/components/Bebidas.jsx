import { motion, useReducedMotion } from 'motion/react'

/*
  Carrusel en vez de grid: son muchas fotos de bebidas sin que cada una
  necesite su propia composición dedicada (a diferencia de "Nuestros
  favoritos", donde cada producto sí gana un lugar curado). Scroll
  nativo con snap, sin autoplay — el usuario lo controla, nada se mueve
  solo (MOTION_INTENSITY sutil, sin animación sin motivo).
*/
/*
  Orden a propósito: las 7 fotos de un solo producto (más vistosas, colores
  fuertes) van primero; las 4 charolas combo (varias bebidas juntas, sin un
  producto protagonista) cierran el carrusel.
*/
const BEBIDAS = [
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518771/b6_nejsgm.jpg',
    alt: 'Raspado azul con popote',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518771/b5_gkp4rd.jpg',
    alt: 'Mangonada con chamoy y chile en el borde',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518771/b7_aazcbp.jpg',
    alt: 'Agua fresca de mango con perlas',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518769/b3_qcblfr.jpg',
    alt: 'Café helado con crema batida, chispas de colores y una velita',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518770/b2_w43qv7.jpg',
    alt: 'Agua mineral con rodajas de limón',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518772/b11_pfrpqw.jpg',
    alt: 'Café helado con caramelo',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518771/b9_iyzoem.jpg',
    alt: 'Agua fresca roja mineral',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518770/b4_rygsgr.jpg',
    alt: 'Matcha helado y cafés con caramelo',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436781/1_z4rjon.jpg',
    alt: 'Cafés helados, brownie y limonada en un portavasos',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785518770/b1_xpz55a.jpg',
    alt: 'Limonada, café helado y agua fresca roja en un portavasos',
  },
  {
    img: 'https://res.cloudinary.com/bdeo51wl/image/upload/v1785436780/7_y9dpzn.jpg',
    alt: 'Cuatro cafés helados en un portavasos de cartón',
  },
]

export default function Bebidas() {
  const reduce = useReducedMotion()

  return (
    <section id="bebidas" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-h2 font-medium">Bebidas</h2>
          <p className="mt-3 max-w-md text-ink-soft">
            Variedad de bebidas para disfrutar, solas o junto con tu
            postre favorito.
          </p>
        </motion.div>

        <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {BEBIDAS.map((item) => (
            <div
              key={item.img}
              className="aspect-[4/5] w-56 flex-shrink-0 snap-start overflow-hidden rounded-md sm:w-64"
            >
              <img
                src={item.img}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {/* Espaciador para que la última tarjeta también respire al hacer snap */}
          <div className="w-px flex-shrink-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
