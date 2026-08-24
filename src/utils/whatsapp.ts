import { FORMAS, personasDeTamano } from '../config/cakeRules'
import type { BusinessRulesConfig } from '../config/businessRulesDefault'
import type { OrderDraft } from '../types/order'

/*
  Se usa cuando requiresCotizacion es true (pricing.ts): tamaños grandes o
  combinaciones sin precio en tabla. El pedido se guarda primero como
  web_order_request (status "pending_whatsapp", ver firestoreOrders.ts) —
  este mensaje solo arma el texto prellenado del link de WhatsApp que se
  ofrece en SuccessScreen después de guardar, para continuar la conversación.

  El wizard hoy solo permite UN sabor y UN relleno (draft.sabor/relleno
  son string | null, sin importar el tamaño) — no hay multi-selección
  para tamaños grandes todavía, así que el mensaje usa ese único valor.
*/

const WHATSAPP_NUMBER = '5214152160729'

function formatTamanoLabel(tamano: string, personas: number): string {
  if (tamano === 'mini') return 'Mini'
  if (tamano === '+100') return 'Más de 100 personas'
  return `${personas} personas`
}

function formatFechaEntrega(fechaEntrega: string): string | null {
  if (!fechaEntrega) return null
  // fechaEntrega viene como yyyy-mm-dd desde <input type="date">.
  const [year, month, day] = fechaEntrega.split('-').map(Number)
  const fecha = new Date(year, month - 1, day)
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function buildWhatsAppMessage(draft: OrderDraft, config: BusinessRulesConfig): string {
  const lineas: string[] = ['Hola, quiero cotizar un pastel personalizado:']

  if (draft.nombre.trim()) lineas.push(`Nombre: ${draft.nombre.trim()}`)

  if (draft.forma) {
    const formaLabel = FORMAS.find((f) => f.value === draft.forma)?.label ?? draft.forma
    const tamanoLabel = draft.tamano
      ? formatTamanoLabel(draft.tamano, personasDeTamano(config, draft.tamano))
      : null
    lineas.push(`Forma: ${formaLabel}${tamanoLabel ? ` — ${tamanoLabel}` : ''}`)
  }

  if (draft.sabor) lineas.push(`Sabor: ${draft.sabor}`)
  if (draft.relleno) lineas.push(`Relleno: ${draft.relleno}`)

  const fechaLabel = formatFechaEntrega(draft.fechaEntrega)
  if (fechaLabel) {
    lineas.push(
      `Fecha estimada de entrega: ${fechaLabel}${draft.horaEntrega ? `, ${draft.horaEntrega}` : ''}`,
    )
  }

  if (draft.extras.length > 0) {
    const extrasLabels = draft.extras
      .map((selected) => {
        const extra = config.extras.find((e) => e.tipo === selected.tipo)
        if (!extra) return null
        return selected.cantidad ? `${extra.label} x${selected.cantidad}` : extra.label
      })
      .filter((label): label is string => label !== null)
    if (extrasLabels.length > 0) lineas.push(`Extras: ${extrasLabels.join(', ')}`)
  }

  lineas.push('')
  lineas.push('Me gustaría recibir una cotización para este pedido.')

  return lineas.join('\n')
}

export function buildWhatsAppUrl(draft: OrderDraft, config: BusinessRulesConfig): string {
  const mensaje = buildWhatsAppMessage(draft, config)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`
}
