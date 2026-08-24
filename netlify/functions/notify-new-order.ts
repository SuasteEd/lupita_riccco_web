import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

const ORDERS_COLLECTION = 'web_order_requests'
const TOKENS_COLLECTION = 'fcm_tokens'

function getAdminApp(): App {
  const existing = getApps()[0]
  if (existing) return existing

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!serviceAccountJson) {
    throw new Error('Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY.')
  }
  return initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let orderId: unknown
  try {
    ;({ orderId } = await req.json())
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }
  if (typeof orderId !== 'string' || !orderId) {
    return new Response('Missing orderId', { status: 400 })
  }

  try {
    const app = getAdminApp()
    const db = getFirestore(app)

    // No confiamos en el payload del cliente para el contenido del push —
    // se relee el pedido con Admin SDK para evitar que alguien dispare
    // notificaciones falsas llamando a este endpoint con datos inventados.
    const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId)
    const orderSnap = await orderRef.get()
    if (!orderSnap.exists) {
      return new Response('Order not found', { status: 404 })
    }
    const order = orderSnap.data()!
    if (order.notifiedAt) {
      console.log(`notify-new-order: pedido ${orderId} ya estaba notificado, se omite`)
      return new Response('Already notified', { status: 200 })
    }

    // El id de cada doc en fcm_tokens es el propio token FCM (no hay un
    // campo "token" separado) — así lo guarda la app Flutter admin/POS.
    const tokensSnap = await db.collection(TOKENS_COLLECTION).get()
    const tokens = tokensSnap.docs.map((d) => d.id)
    console.log(`notify-new-order: ${tokens.length} token(s) encontrados en ${TOKENS_COLLECTION}`)
    if (tokens.length === 0) {
      return new Response('No device tokens registered', { status: 200 })
    }

    const cliente = order.cliente ?? {}
    const pastel = order.pastel ?? {}
    const resumenPastel = [pastel.tamano, pastel.forma].filter(Boolean).join(' ')
    const body = order.requiresCotizacion
      ? `${cliente.nombre ?? 'Cliente'} — ${resumenPastel} — cotización por WhatsApp`
      : `${cliente.nombre ?? 'Cliente'} — ${resumenPastel} — $${order.precioEstimado ?? '?'}`

    const response = await getMessaging(app).sendEachForMulticast({
      tokens,
      notification: {
        title: '¡Nuevo pedido!',
        body,
      },
    })
    console.log(
      `notify-new-order: envío completado — successCount=${response.successCount} failureCount=${response.failureCount}`,
    )

    const deadTokens: string[] = []
    response.responses.forEach((r, i) => {
      if (!r.success) {
        console.error(`notify-new-order: token ${tokens[i]} falló —`, r.error?.code, r.error?.message)
        if (r.error?.code === 'messaging/registration-token-not-registered') {
          deadTokens.push(tokens[i])
        }
      }
    })
    if (deadTokens.length > 0) {
      await Promise.all(deadTokens.map((t) => db.collection(TOKENS_COLLECTION).doc(t).delete()))
    }

    await orderRef.update({ notifiedAt: FieldValue.serverTimestamp() })

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('notify-new-order failed', err)
    return new Response('Internal error', { status: 500 })
  }
}
