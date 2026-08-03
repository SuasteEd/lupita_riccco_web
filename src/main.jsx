import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './styles/global.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { OfflineBanner } from './components/OfflineBanner.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'
import TermsAndConditions from './pages/TermsAndConditions.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Sin onRetry a propósito: red de seguridad de último recurso, si algo
        truena aquí arriba (fuera del modal del pedido) lo más confiable es
        recargar la página completa, no intentar un reset de estado parcial. */}
    <ErrorBoundary
      title="Algo salió mal"
      message="Tuvimos un problema inesperado cargando la página. Intenta de nuevo."
    >
      <OfflineBanner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos" element={<TermsAndConditions />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
