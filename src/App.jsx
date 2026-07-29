import { Suspense, lazy, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Historia from './components/Historia.jsx'
import Favoritos from './components/Favoritos.jsx'
import DeTemporada from './components/DeTemporada.jsx'
import RolesDeCanela from './components/RolesDeCanela.jsx'
import Footer from './components/Footer.jsx'

// Carga diferida: el SDK de Firebase (~800 KB) solo se descarga cuando el
// cliente realmente abre el formulario de pedido, no en la carga inicial
// de la landing (afecta LCP si va en el bundle principal).
const OrderForm = lazy(() =>
  import('./components/order/OrderForm.tsx').then((m) => ({ default: m.OrderForm })),
)

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
      </main>
      <Footer />
      {orderFormOpen && (
        <Suspense fallback={null}>
          <OrderForm onClose={() => setOrderFormOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default App
