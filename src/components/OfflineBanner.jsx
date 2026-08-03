import { useEffect, useState } from 'react'
import { WifiSlashIcon } from '@phosphor-icons/react'

/*
  Fondo fijo (--color-dark, NO --danger): --danger invierte su luminancia
  entre temas (oscuro en claro, claro en oscuro — ver tokens.css), así que
  ningún color de texto único pasa WCAG AA en los dos casos. --color-dark +
  --color-background (texto) es el mismo par ya usado en Mapa.jsx, 15.8:1
  en ambos temas, verificado.
*/
export function OfflineBanner() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))

  useEffect(() => {
    function goOnline() {
      setOnline(true)
    }
    function goOffline() {
      setOnline(false)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-[var(--color-dark)] px-4 py-2 text-center text-sm font-medium text-on-brand"
    >
      <WifiSlashIcon size={18} weight="bold" className="flex-shrink-0" />
      Sin conexión a internet — algunas partes de la página pueden no funcionar bien.
    </div>
  )
}
