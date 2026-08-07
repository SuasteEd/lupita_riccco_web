import { CheckCircle } from '@phosphor-icons/react'
import type { BusinessRulesConfig } from '../../config/businessRulesDefault'
import type { OrderDraft } from '../../types/order'
import { buildWhatsAppUrl } from '../../utils/whatsapp'

export function SuccessScreen({
  onClose,
  requiresCotizacion,
  draft,
  config,
}: {
  onClose: () => void
  requiresCotizacion: boolean
  draft: OrderDraft
  config: BusinessRulesConfig
}) {
  const copy = requiresCotizacion
    ? {
        title: 'Tu solicitud fue guardada',
        body: 'Guardamos los detalles de tu pedido. Ahora continúa la conversación por WhatsApp para que te confirmemos el precio y la disponibilidad.',
        buttonLabel: 'Continuar por WhatsApp',
        whatsappUrl: buildWhatsAppUrl(draft, config),
      }
    : {
        title: 'Tu solicitud fue enviada',
        body: 'Te contactaremos pronto por WhatsApp para confirmar tu pedido y el precio final. Si necesitas corregir algún dato, escríbenos directamente por ahí.',
        buttonLabel: 'Escribir por WhatsApp',
        whatsappUrl: 'https://wa.me/5214152160729',
      }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <CheckCircle size={56} weight="light" className="text-brand" />
      <h3 className="font-display text-2xl text-brand">{copy.title}</h3>
      <p className="max-w-sm text-ink-soft">{copy.body}</p>
      <a
        href={copy.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-pill bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
      >
        {copy.buttonLabel}
      </a>
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        Cerrar
      </button>
    </div>
  )
}
