/*
  Migración puntual: agrega '70' a tamanosGrandesRectangular en
  business_rules/current. Motivo: rectangular 70 personas (el tamaño
  máximo de 3 leches, tresLechesPersonasMax=70) no tenía precio real en
  cake_prices/current (el Excel original solo cubría tamaños 10-50) —
  sin este cambio caía silenciosamente a "no se encontró precio" en vez
  de la cotización explícita que sí reciben los demás tamaños grandes.

  Uso:
    npx tsx scripts/update-tamanos-grandes-rectangular.ts

  Mismo patrón que scripts/seed-business-rules.ts: archiva el documento
  completo actual en business_rules_history ANTES de tocar "current",
  pide confirmación explícita, y usa firebase-admin (no el client SDK)
  por las mismas razones documentadas ahí.
*/

import * as readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function askConfirmation(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

function initFirebaseAdmin(): void {
  const serviceAccountPath = path.join(__dirname, 'service-account.json')
  if (fs.existsSync(serviceAccountPath)) {
    console.log(`Usando credenciales de: ${serviceAccountPath}`)
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'))
    initializeApp({ credential: cert(serviceAccount) })
    return
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp()
    return
  }
  throw new Error('No se encontraron credenciales. Coloca scripts/service-account.json.')
}

async function main(): Promise<void> {
  initFirebaseAdmin()
  const db = getFirestore()
  const currentRef = db.collection('business_rules').doc('current')

  const existing = await currentRef.get()
  if (!existing.exists) {
    console.error('No existe business_rules/current — no hay nada que migrar. Corre primero seed-business-rules.ts.')
    process.exit(1)
  }

  const data = existing.data() as { tamanosGrandesRectangular?: string[]; version?: number; updatedBy?: string }
  const actual: string[] = data.tamanosGrandesRectangular ?? []

  console.log('\n========== RESUMEN ==========')
  console.log(`version actual: ${data.version}`)
  console.log(`updatedBy actual: ${data.updatedBy}`)
  console.log(`tamanosGrandesRectangular actual: ${JSON.stringify(actual)}`)

  if (actual.includes('70')) {
    console.log('\n✅ "70" ya está en tamanosGrandesRectangular — nada que hacer.')
    process.exit(0)
  }

  const nuevo = [...actual, '70'].sort((a, b) => Number(a) - Number(b))
  console.log(`tamanosGrandesRectangular nuevo:  ${JSON.stringify(nuevo)}`)
  console.log(`version nueva: ${(data.version ?? 0) + 1}`)
  console.log('==============================\n')

  const confirm = await askConfirmation(
    '¿Continuar? Se archivará el documento actual completo y luego se actualizará "current". (s/n): ',
  )
  if (confirm !== 's') {
    console.log('Cancelado. No se escribió nada en Firestore.')
    process.exit(0)
  }

  let historyDocId: string | null = null
  try {
    const historyRef = db.collection('business_rules_history').doc()
    await historyRef.set({ ...existing.data(), supersededAt: FieldValue.serverTimestamp() })
    historyDocId = historyRef.id
    console.log(`Documento anterior archivado en business_rules_history/${historyDocId}`)
  } catch (err) {
    console.error('Error al archivar el documento anterior. NO se actualizó "current".')
    console.error(err)
    process.exit(1)
  }

  try {
    await currentRef.update({
      tamanosGrandesRectangular: nuevo,
      version: (data.version ?? 0) + 1,
      updatedBy: 'manual_update_tamanosGrandesRectangular',
      updatedAt: FieldValue.serverTimestamp(),
    })
  } catch (err) {
    console.error(
      `El historial se guardó correctamente (business_rules_history/${historyDocId}), pero el update de "current" falló. Puedes reintentar solo el update.`,
    )
    console.error(err)
    process.exit(1)
  }

  console.log('\n✅ Listo. business_rules/current actualizado.')
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
