import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { personasDeTamano } from '../config/cakeRules'
import type { BusinessRulesConfig } from '../config/businessRulesDefault'
import type { CakePricesDocument } from '../config/cakePrices'
import { calculateEstimate } from '../config/pricing'
import { normalizePhone } from './phone'
import type { OrderDraft } from '../types/order'

/*
  Nombre de colección confirmado por el negocio: "web_order_requests"
  (distinto de "pedidos", que se mencionó al inicio del brief — si eso
  fue un error y en realidad debe ser "pedidos", este es el único lugar
  que hay que tocar).
*/
export const ORDERS_COLLECTION = 'web_order_requests'

export async function submitOrder(
  draft: OrderDraft,
  config: BusinessRulesConfig,
  pricesDoc: CakePricesDocument | null,
  termsAccepted: boolean,
): Promise<string> {
  if (!draft.forma || !draft.tamano || !draft.sabor || !draft.relleno || !draft.cobertura) {
    throw new Error('Faltan campos obligatorios del pastel.')
  }
  const telefono = normalizePhone(draft.telefono, draft.telefonoPais)
  if (!telefono) throw new Error('Teléfono inválido.')
  if (!draft.nombre.trim()) throw new Error('Falta el nombre.')
  if (!draft.direccion.trim()) throw new Error('Falta la dirección.')
  if (!draft.fechaEntrega) throw new Error('Falta la fecha de entrega.')
  // El botón "Enviar solicitud" ya está disabled sin esto marcado — esta
  // validación es solo defensa extra, igual que las de arriba.
  if (!termsAccepted) throw new Error('Falta aceptar los términos y la política de privacidad.')

  // Ya es un secure_url de Cloudinary (o null) — la subida ocurrió antes,
  // en Step3EmpaqueExtras, vía src/lib/cloudinaryUpload.ts.
  const imagenReferencia = draft.imagenReferencia

  // Se recalcula aquí (no se reutiliza el useMemo de Step5Confirmacion) para
  // garantizar que lo que se guarda en Firestore coincide exactamente con lo
  // que se le mostró al cliente, incluso si tocó algo en el último instante
  // sin que el useMemo del componente alcanzara a recalcular antes del submit.
  const estimate = calculateEstimate(draft, config, pricesDoc)

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    createdAt: serverTimestamp(),
    status: 'pendienteAnticipo',
    cliente: {
      nombre: draft.nombre.trim(),
      telefono,
      direccion: draft.direccion.trim(),
      email: draft.email.trim() || null,
    },
    pastel: {
      forma: draft.forma,
      esPisos: draft.esPisos,
      tamano: draft.tamano,
      personas: personasDeTamano(config, draft.tamano),
      esTresLeches: draft.esTresLeches,
      sabor: draft.sabor,
      relleno: draft.relleno,
      cobertura: draft.cobertura,
    },
    empaque: { tipo: draft.empaqueTipo },
    extras: draft.extras,
    imagenReferencia,
    fechaEntrega: Timestamp.fromDate(new Date(`${draft.fechaEntrega}T12:00:00`)),
    comentarios: draft.comentarios.trim() || null,
    precioEstimado: estimate.total,
    desglosePrecio:
      estimate.total !== null
        ? {
            base: estimate.base,
            estructuraPisos: estimate.estructuraPisos,
            empaque: estimate.empaque,
            extras: estimate.extras,
            incluyeFondant: estimate.incluyeFondant,
          }
        : null,
    requiresCotizacion: estimate.requiresCotizacion,
    cotizacionReason: estimate.cotizacionReason,
    termsAccepted: true,
    termsAcceptedAt: serverTimestamp(),
    precioFinal: null,
    notaAdmin: null,
    fechaResolucion: null,
  })

  return docRef.id
}
