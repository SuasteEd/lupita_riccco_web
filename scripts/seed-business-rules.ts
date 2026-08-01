/*
  Carga inicial (y migraciones manuales futuras) de las reglas de negocio
  a Firestore: colección "business_rules", documento "current".

  Uso:
    npx tsx scripts/seed-business-rules.ts

  Autenticación: igual que scripts/seed-cake-prices.ts — Service Account
  JSON en scripts/service-account.json (recomendado) o
  GOOGLE_APPLICATION_CREDENTIALS. Ver scripts/seed-cake-prices.ts para
  el detalle de cómo configurarlo.

  Por qué firebase-admin y no src/config/firebase.ts (client SDK):
  1. src/config/firebase.ts lee sus valores de import.meta.env, que es
     una sustitución que hace Vite en build/dev — no existe fuera de
     Vite, así que este archivo no puede correr como script de Node
     (import.meta.env.VITE_FIREBASE_API_KEY sería undefined).
  2. Aunque se resolviera eso, el client SDK solo puede escribir lo que
     las Security Rules permitan. Hoy la regla catch-all del proyecto
     (`match /{document=**} { allow read, write: if request.auth != null }`)
     ya permite escribir a CUALQUIER colección a cualquier sesión
     autenticada (incluida la auth anónima de la app Flutter) — un
     script de seed que use el client SDK tendría que además iniciar
     sesión (aunque sea anónima) para poder escribir, lo cual no aporta
     ninguna garantía real de "solo admins" sobre la que el Paso 4 del
     plan quiere apoyarse.
  firebase-admin bypasea las Security Rules por diseño — es la
  herramienta correcta para un script de migración administrativa que
  nunca se ejecuta en el navegador del cliente.
*/

import * as readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { DEFAULT_CONFIG } from '../src/config/businessRulesDefault.js'

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
    console.log(`Usando GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`)
    initializeApp()
    return
  }
  throw new Error(
    'No se encontraron credenciales. Coloca scripts/service-account.json o define GOOGLE_APPLICATION_CREDENTIALS.',
  )
}

async function main(): Promise<void> {
  console.log('Documento a escribir: business_rules/current')
  console.log(`Campos de negocio: ${Object.keys(DEFAULT_CONFIG).length}`)
  console.log(`Sabores clásico: ${DEFAULT_CONFIG.sabores.clasico.length}`)
  console.log(`Rellenos clásico: ${DEFAULT_CONFIG.rellenos.clasico.length}`)
  console.log(`Extras: ${DEFAULT_CONFIG.extras.map((e) => e.tipo).join(', ')}`)

  initFirebaseAdmin()
  const db = getFirestore()
  const currentRef = db.collection('business_rules').doc('current')

  const existing = await currentRef.get()
  if (existing.exists) {
    console.log('\n⚠️  Ya existe un documento business_rules/current.')
    const data = existing.data()
    console.log(`   version actual: ${data?.version}`)
    console.log(`   updatedBy actual: ${data?.updatedBy}`)
    const confirm = await askConfirmation(
      '¿Confirmas que quieres SOBRESCRIBIRLO? Se archivará una copia antes de sobrescribir. (s/n): ',
    )
    if (confirm !== 's') {
      console.log('Cancelado. No se escribió nada en Firestore.')
      process.exit(0)
    }
  } else {
    console.log('\nNo existe un documento previo — esta será la carga inicial.')
    const confirm = await askConfirmation('¿Continuar y escribir a Firestore? (s/n): ')
    if (confirm !== 's') {
      console.log('Cancelado. No se escribió nada en Firestore.')
      process.exit(0)
    }
  }

  let historyDocId: string | null = null
  if (existing.exists) {
    try {
      const historyRef = db.collection('business_rules_history').doc()
      await historyRef.set({
        ...existing.data(),
        supersededAt: FieldValue.serverTimestamp(),
      })
      historyDocId = historyRef.id
      console.log(`Documento anterior archivado en business_rules_history/${historyDocId}`)
    } catch (err) {
      console.error('Error al archivar el documento anterior. NO se escribió el nuevo documento "current".')
      console.error(err)
      process.exit(1)
    }
  }

  try {
    await currentRef.set({
      ...DEFAULT_CONFIG,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: 'seed_script_initial',
      version: 1,
    })
  } catch (err) {
    console.error(
      historyDocId
        ? `El historial se guardó correctamente (business_rules_history/${historyDocId}), pero la escritura de "current" falló. Puedes reintentar solo la escritura de "current".`
        : 'La escritura de "current" falló (no había documento previo que archivar).',
    )
    console.error(err)
    process.exit(1)
  }

  console.log('\n✅ Listo.')
  console.log('   business_rules/current escrito correctamente.')
  if (historyDocId) console.log(`   Documento anterior archivado en business_rules_history/${historyDocId}.`)
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
