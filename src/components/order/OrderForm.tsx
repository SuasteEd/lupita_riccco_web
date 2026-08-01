import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { X } from '@phosphor-icons/react'
import { fechaMinimaEntrega, loadBusinessRules } from '../../config/cakeRules'
import { DEFAULT_CONFIG, type BusinessRulesConfig } from '../../config/businessRulesDefault'
import { loadCakePrices, type CakePricesDocument } from '../../config/cakePrices'
import { calculateEstimate } from '../../config/pricing'
import { BusinessRulesContext } from '../../context/BusinessRulesContext'
import { getSubmitCooldownRemainingMs, isHoneypotTripped, markSubmitted } from '../../lib/antiSpam'
import { toDateInputValue } from '../../lib/date'
import { submitOrder } from '../../lib/firestoreOrders'
import { isValidPhone } from '../../lib/phone'
import { sanitizeOrderDraft } from '../../lib/sanitizeOrderDraft'
import { EMPTY_ORDER_DRAFT, type OrderDraft } from '../../types/order'
import { buildWhatsAppUrl } from '../../utils/whatsapp'
import { SuccessScreen } from './SuccessScreen'
import { Step1FormaTamano } from './steps/Step1FormaTamano'
import { Step2SaborRellenoCobertura } from './steps/Step2SaborRellenoCobertura'
import { Step3EmpaqueExtras } from './steps/Step3EmpaqueExtras'
import { Step4ContactoFecha } from './steps/Step4ContactoFecha'
import { Step5Confirmacion } from './steps/Step5Confirmacion'

const STEP_TITLES = [
  'Forma y tamaño',
  'Sabor, relleno y cobertura',
  'Empaque y extras',
  'Contacto y fecha',
  'Confirmación',
]

function isEmailValid(email: string): boolean {
  return email.trim() === '' || /^\S+@\S+\.\S+$/.test(email.trim())
}

/** Traduce errores técnicos de Firebase a algo que un cliente entienda. */
function friendlySubmitError(err: unknown): string {
  if (err instanceof Error && err.message === 'TIMEOUT') {
    return 'Está tardando más de lo normal. Seguimos intentando en segundo plano; si no confirmamos en un momento, escríbenos directo por WhatsApp para no duplicar tu pedido.'
  }
  const code = (err as { code?: string } | null)?.code
  if (code === 'permission-denied') {
    return 'No pudimos enviar tu solicitud ahora mismo. Escríbenos directo por WhatsApp mientras lo resolvemos.'
  }
  if (code === 'unavailable') {
    return 'Parece que no hay conexión con el servidor. Revisa tu internet e intenta de nuevo.'
  }
  return 'No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.'
}

function canAdvance(step: number, draft: OrderDraft, config: BusinessRulesConfig): boolean {
  switch (step) {
    case 1:
      return draft.forma !== null && draft.tamano !== null
    case 2:
      return draft.sabor !== null && draft.relleno !== null && draft.cobertura !== null
    case 3:
      return true
    case 4:
      return (
        draft.nombre.trim().length > 0 &&
        draft.direccion.trim().length > 0 &&
        isValidPhone(draft.telefono, draft.telefonoPais) &&
        draft.fechaEntrega.length > 0 &&
        draft.fechaEntrega >= toDateInputValue(fechaMinimaEntrega(config, draft.esPisos)) &&
        isEmailValid(draft.email)
      )
    default:
      return true
  }
}

export function OrderForm({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<OrderDraft>(EMPTY_ORDER_DRAFT)
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [rulesConfig, setRulesConfig] = useState<BusinessRulesConfig>(DEFAULT_CONFIG)
  const [rulesLoading, setRulesLoading] = useState(true)
  const [pricesDoc, setPricesDoc] = useState<CakePricesDocument | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([loadBusinessRules(), loadCakePrices()])
      .then(([rules, prices]) => {
        if (cancelled) return
        setRulesConfig(rules)
        setPricesDoc(prices)
      })
      .finally(() => {
        if (!cancelled) setRulesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Determina qué botón muestra el footer en el paso 5 (Enviar solicitud vs
  // WhatsApp) — se recalcula aquí, no solo dentro de Step5Confirmacion, porque
  // el footer con los botones vive en OrderForm, no en el step.
  const estimate = useMemo(
    () => calculateEstimate(draft, rulesConfig, pricesDoc),
    [draft, rulesConfig, pricesDoc],
  )

  function update(patch: Partial<OrderDraft>) {
    setDraft((prev) => sanitizeOrderDraft({ ...prev, ...patch }, rulesConfig))
  }

  function handleNext() {
    if (canAdvance(step, draft, rulesConfig)) {
      setShowErrors(false)
      setStep((s) => Math.min(s + 1, 5))
    } else {
      setShowErrors(true)
    }
  }

  function handleBack() {
    setShowErrors(false)
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleSubmit() {
    if (isHoneypotTripped(draft.honeypot)) {
      // Bot detectado en silencio: no delatamos el honeypot, solo no hacemos nada.
      return
    }
    const cooldown = getSubmitCooldownRemainingMs()
    if (cooldown > 0) {
      setSubmitError('Ya enviamos una solicitud desde este navegador hace poco. Espera unos minutos o escríbenos directo por WhatsApp.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    // Se marca ANTES de que resuelva la promesa, no solo al tener éxito:
    // así, si el intento solo va lento (ver Promise.race abajo) y el
    // cliente insiste en el botón, el cooldown lo detiene en vez de
    // disparar una segunda escritura del mismo pedido.
    markSubmitted()

    // Un solo llamado real a submitOrder — se referencia dos veces, nunca
    // se vuelve a invocar, para no arriesgar una escritura duplicada.
    const submitPromise = submitOrder(draft, rulesConfig, pricesDoc)
    // Si termina después de que el timeout ya mostró un error, igual
    // reflejamos el éxito en vez de dejar al cliente pensando que falló.
    submitPromise.then((id) => setSuccessId(id)).catch(() => {})

    try {
      // Contra un proyecto de Firebase real casi siempre resuelve en segundos,
      // pero el SDK reintenta indefinidamente ante problemas de red/config en
      // vez de fallar rápido — sin este timeout, un problema de conectividad
      // dejaría al cliente viendo "Enviando..." para siempre.
      const id = await Promise.race([
        submitPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 15000),
        ),
      ])
      setSuccessId(id)
    } catch (err) {
      setSubmitError(friendlySubmitError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const StepComponent = (() => {
    // Solo el paso 1 muestra skeleton: es el único que depende de catálogos
    // (sabor/tamaño) que pueden diferir entre DEFAULT_CONFIG y lo real de
    // Firestore. El resto de los pasos no se alcanzan hasta que el paso 1
    // avanza, para entonces rulesLoading ya casi siempre resolvió.
    if (step === 1 && rulesLoading) {
      return (
        <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Cargando opciones">
          <div className="h-10 rounded-md bg-card" />
          <div className="h-10 rounded-md bg-card" />
          <div className="h-10 w-2/3 rounded-md bg-card" />
        </div>
      )
    }
    switch (step) {
      case 1:
        return <Step1FormaTamano draft={draft} update={update} />
      case 2:
        return <Step2SaborRellenoCobertura draft={draft} update={update} />
      case 3:
        return <Step3EmpaqueExtras draft={draft} update={update} />
      case 4:
        return <Step4ContactoFecha draft={draft} update={update} showErrors={showErrors} />
      case 5:
        return <Step5Confirmacion draft={draft} pricesDoc={pricesDoc} />
      default:
        return null
    }
  })()

  return (
    <BusinessRulesContext.Provider value={rulesConfig}>
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-dark)]/60 backdrop-blur-sm md:items-center md:p-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-md bg-canvas md:max-w-lg md:rounded-md md:border md:border-border-subtle"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <p className="font-display text-lg text-brand">Pedido personalizado</p>
            {!successId && (
              <p className="text-xs text-ink-soft">
                Paso {step} de 5 · {STEP_TITLES[step - 1]}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-card hover:text-ink"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {successId ? (
            <SuccessScreen onClose={onClose} />
          ) : (
            // Solo animación de entrada (sin exit/mode="wait"): el título
            // "Paso X de 5" del header cambia en el mismo instante que el
            // contenido, sin una ventana donde uno diga X y el otro X-1
            // mientras el paso anterior termina de desvanecerse.
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {StepComponent}
            </motion.div>
          )}

          {/* Honeypot: invisible para personas, tentador para bots de autollenado */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="sitio_web">No llenar este campo</label>
            <input
              id="sitio_web"
              name="sitio_web"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={draft.honeypot}
              onChange={(e) => update({ honeypot: e.target.value })}
            />
          </div>
        </div>

        {!successId && (
          <div className="border-t border-border-subtle px-5 py-4">
            {/* Fuera del área con scroll (arriba) a propósito: un error de
                envío tiene que verse sin que el cliente tenga que bajar. */}
            {submitError && <p className="mb-3 text-sm text-danger">{submitError}</p>}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="rounded-pill px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-0"
              >
                Atrás
              </button>
              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-pill bg-brand px-6 py-2.5 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
                >
                  Siguiente
                </button>
              ) : estimate.requiresCotizacion ? (
                // Tamaño grande / sin precio en tabla: bypasea Firestore por
                // completo, va directo a WhatsApp — nunca se crea un
                // web_order_request para estos casos.
                <a
                  href={buildWhatsAppUrl(draft, rulesConfig)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-pill bg-brand px-6 py-2.5 text-center text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
                >
                  Solicitar cotización por WhatsApp →
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-pill bg-brand px-6 py-2.5 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
    </BusinessRulesContext.Provider>
  )
}
