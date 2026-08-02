import { useEffect } from 'react'
import { useLocation } from 'react-router'

/*
  react-router NO hace scroll al inicio al cambiar de ruta (a diferencia
  de una navegación tradicional de página completa) — sin esto, entrar a
  /privacidad o /terminos desde un link del footer (que suele estar hasta
  abajo de la landing) deja la página nueva en ese mismo scroll, mostrando
  el footer en vez del título de la página.
*/
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
