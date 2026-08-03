import { Suspense, lazy, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Historia from './components/Historia.jsx'
import Favoritos from './components/Favoritos.jsx'
import DeTemporada from './components/DeTemporada.jsx'
import RolesDeCanela from './components/RolesDeCanela.jsx'
import Bebidas from './components/Bebidas.jsx'
import Footer from './components/Footer.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// Carga diferida: el SDK de Firebase (~800 KB) solo se descarga cuando el
// cliente realmente abre el formulario de pedido, no en la carga inicial
// de la landing (afecta LCP si va en el bundle principal).
const OrderForm = lazy(() =>
  import('./components/order/OrderForm.tsx').then((m) => ({ default: m.OrderForm })),
)

// Mismo "chrome" que el modal real (fondo oscuro + tarjeta centrada) para
// que pasar de "cargando" a "cargado" no salte visualmente — antes esto
// era fallback={null}, así que un clic en "Pedido personalizado" con
// conexión lenta no mostraba nada hasta que el chunk (~180 KB gzip)
// terminara de bajar.
function OrderFormLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-dark)]/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-md bg-canvas px-10 py-10">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-brand"
          aria-hidden="true"
        />
        <p className="text-sm text-ink-soft">Cargando formulario...</p>
      </div>
    </div>
  )
}

function App() {
  const [orderFormOpen, setOrderFormOpen] = useState(false)

  return (
    <>
      <Header onOpenOrderForm={() => setOrderFormOpen(true)} />
      <main>
        <Hero onOpenOrderForm={() => setOrderFormOpen(true)} />
        <Historia />
        <Favoritos />
        <DeTemporada />
        <RolesDeCanela />
        <Bebidas />
      </main>
      <Footer />
      {orderFormOpen && (
        // Boundary propio (no solo el de main.jsx): si el chunk del
        // formulario falla al cargar o algo truena adentro, el cliente ve
        // un error acotado al modal y puede reintentar — el resto de la
        // landing (detrás) sigue completa e interactiva, no se va a blanco.
        <ErrorBoundary
          title="No pudimos abrir el formulario"
          message="Revisa tu conexión e intenta de nuevo, o escríbenos directo por WhatsApp."
          onRetry={() => setOrderFormOpen(false)}
        >
          <Suspense fallback={<OrderFormLoading />}>
            <OrderForm onClose={() => setOrderFormOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  )
}

export default App
