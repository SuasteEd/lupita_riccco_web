import { motion, useReducedMotion } from 'motion/react'

export default function Historia() {
  const reduce = useReducedMotion()

  return (
    <section id="historia" className="bg-card py-20 md:py-28">
      <motion.div
        className="mx-auto max-w-[65ch] px-4 md:px-8"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-h2 font-medium">Un poco de mi historia</h2>

        <div className="mt-6 space-y-5 text-ink">
          <p>
            Este proyecto comenzó el 17 de marzo de 2020, cuando vendí mi
            primer pastel. Inició como un emprendimiento en la cocina de la
            casa de mis papás. El horno de mi mamá fue mi primera
            herramienta, y recuerdo con mucho cariño la batidora que mi papá
            me compró, pues me ayudó a sacar mis primeros pedidos. Salía por
            las calles de mi comunidad a vender postres por rebanadas, y así
            logré pagar mis gastos universitarios.
          </p>
          <p>
            Con el tiempo, fui creciendo y las ventas aumentaron
            considerablemente. Pasé de hacer un pastel por semana a tener
            entre 6 y 8 pedidos cada fin de semana. Fue así como pude comprar
            mi primera batidora profesional, una Kitchenaid Artisan azul, que
            fue un gran logro para mí.
          </p>
          <p>
            Mis redes sociales comenzaron con una página creada para un
            proyecto universitario, y decidí seguir publicando mis
            creaciones allí. Con el paso de los meses, las ventas continuaron
            aumentando cada vez más.
          </p>
          <p>
            El 27 de julio de ese año logré abrir mi tienda física en la
            comunidad de Los Rodríguez, aunque sigo realizando entregas desde
            la casa de mis papás. Hoy en día tengo una licenciatura en
            Gastronomía y mi emprendimiento ha crecido tanto que ahora es una
            pequeña empresa que brinda empleo a al menos 6 personas.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
