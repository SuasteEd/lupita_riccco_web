import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { personasDeTamano } from '../config/cakeRules'
import { normalizePhone } from './phone'
import type { OrderDraft } from '../types/order'

/*
  Nombre de colección confirmado por el negocio: "web_order_requests"
  (distinto de "pedidos", que se mencionó al inicio del brief — si eso
  fue un error y en realidad debe ser "pedidos", este es el único lugar
  que hay que tocar).
*/
export const ORDERS_COLLECTION = 'web_order_requests'

export async function submitOrder(draft: OrderDraft): Promise<string> {
  if (!draft.forma || !draft.tamano || !draft.sabor || !draft.relleno || !draft.cobertura) {
    throw new Error('Faltan campos obligatorios del pastel.')
  }
  const telefono = normalizePhone(draft.telefono, draft.telefonoPais)
  if (!telefono) throw new Error('Teléfono inválido.')
  if (!draft.nombre.trim()) throw new Error('Falta el nombre.')
  if (!draft.direccion.trim()) throw new Error('Falta la dirección.')
  if (!draft.fechaEntrega) throw new Error('Falta la fecha de entrega.')

  // Ya es un secure_url de Cloudinary (o null) — la subida ocurrió antes,
  // en Step3EmpaqueExtras, vía src/lib/cloudinaryUpload.ts.
  const imagenReferencia = draft.imagenReferencia

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    createdAt: serverTimestamp(),
    status: 'pending',
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
      personas: personasDeTamano(draft.tamano),
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
    precioFinal: null,
    notaAdmin: null,
    fechaResolucion: null,
  })

  return docRef.id
}
