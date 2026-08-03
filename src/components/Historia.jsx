import {
  CakeIcon,
  GraduationCapIcon,
  InstagramLogoIcon,
  StorefrontIcon,
  TrendUpIcon,
} from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'

/*
  Resumen de la historia real en 5 hitos (el texto largo original vivía
  en 4 párrafos corridos — poco atractivo para escanear). Cada hito es
  un hecho real, solo que dicho en una frase en vez de un párrafo.
*/
const HITOS = [
  {
    label: '17 de marzo, 2020',
    text: 'Vendí mi primer pastel, hecho en la cocina de mis papás con el horno de mi mamá.',
    Icon: CakeIcon,
  },
  {
    label: 'Meses después',
    text: 'De un pastel a la semana a 8 pedidos cada fin de semana. Compré mi primera batidora profesional.',
    Icon: TrendUpIcon,
  },
  {
    label: 'Redes sociales',
    text: 'Una página para un proyecto universitario se volvió el lugar donde compartía cada creación.',
    Icon: InstagramLogoIcon,
  },
  {
    label: '27 de julio, 2024',
    text: 'Abrí mi tienda física en Los Rodríguez, sin dejar las entregas desde casa de mis papás.',
    Icon: StorefrontIcon,
  },
  {
    label: 'Hoy',
    text: 'Licenciada en Gastronomía. Mi cocina de casa es ahora una pequeña empresa.',
    Icon: GraduationCapIcon,
  },
]

export default function Historia() {
  const reduce = useReducedMotion()

  return (
    <section id="historia" className="bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.h2
          className="text-h2 font-medium"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Un poco de mi historia
        </motion.h2>

        <div className="relative mt-14">
          {/* Línea conectora: vertical en móvil (pasa por el centro de los
              íconos de 48px, left-6 = 24px), horizontal en escritorio. */}
          <div
            aria-hidden="true"
            className="absolute left-6 top-0 bottom-0 w-px bg-border-subtle md:left-6 md:right-6 md:top-6 md:bottom-auto md:h-px md:w-auto"
          />

          <div className="relative flex flex-col gap-10 md:flex-row md:justify-between md:gap-4">
            {HITOS.map((hito, i) => (
              <motion.div
                key={hito.label}
                className="relative flex gap-4 md:flex-1 md:flex-col md:items-center md:gap-3 md:text-center"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                  <hito.Icon size={22} weight="bold" />
                </div>
                <div className="md:px-2">
                  <p className="font-display text-sm font-semibold text-brand">{hito.label}</p>
                  <p className="mt-1 text-sm text-ink-soft">{hito.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
