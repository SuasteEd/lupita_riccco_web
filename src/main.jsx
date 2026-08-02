import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './styles/global.css'
import App from './App.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'
import TermsAndConditions from './pages/TermsAndConditions.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/terminos" element={<TermsAndConditions />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
