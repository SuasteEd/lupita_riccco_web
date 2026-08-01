/*
  Paso 1 de 3 — Sube los precios del Excel de referencia a Firestore
  (colección "cake_prices", documento "current").

  Uso:
    npx ts-node scripts/seed-cake-prices.ts ./Libro1.xlsx

  Autenticación (elige una):
    Opción A (recomendada) — Service Account JSON:
      1. Firebase Console > Configuración del proyecto > Cuentas de servicio
         > Generar nueva clave privada.
      2. Guarda el archivo descargado como scripts/service-account.json
         (ya está en .gitignore, nunca se sube al repo).
    Opción B — variable de entorno:
      export GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu/service-account.json
      El script detecta automáticamente cuál usar: si existe
      scripts/service-account.json la usa; si no, cae a
      GOOGLE_APPLICATION_CREDENTIALS.

  IMPORTANTE — bandas por combinación, no globales:
    Los datos reales del Excel NO comparten un mismo corte de bandas entre
    combinaciones (ej. "Buttercream" corta distinto a "Chantilly" en varias
    filas). Por eso las bandas se calculan por cada combinación
    sabor+relleno+cobertura de forma independiente, y el array `bands[]`
    del documento es la UNIÓN de todas las bandas distintas que aparecieron
    (para reportes/stats), no una regla única aplicada a todas las filas.
    Esto evita asignar un precio incorrecto a alguna combinación.
*/

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'
import * as dotenv from 'dotenv'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import type { FieldValue as FieldValueType } from 'firebase-admin/firestore'

dotenv.config()

// __dirname no existe en ESM nativo (este proyecto usa "type": "module").
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// La build ESM de "xlsx" (xlsx.mjs) no hace auto-require('fs') como la build
// CommonJS — sin esto, XLSX.readFile falla con "Cannot access file" incluso
// si el archivo existe, porque su _fs interno queda undefined.
XLSX.set_fs(fs)

type Cobertura = 'chantilly' | 'queso_crema' | 'buttercream'

interface Band {
  label: string
  min: number
  max: number
}

interface PriceDoc {
  updatedAt: FieldValueType
  updatedBy: string
  version: number
  bands: Band[]
  prices: Record<string, number>
  stats: {
    totalCombinaciones: number
    saboresEncontrados: string[]
    rellenosEncontrados: string[]
    coberturasEncontradas: string[]
    bandsGeneradas: string[]
    valoresNoReconocidos: string[]
  }
}

// Vocabulario canónico: debe coincidir con src/config/cakeRules.ts
const SABOR_MAP: Record<string, string> = {
  'red velvet': 'Red Velvet',
  café: 'Café',
  cafe: 'Café',
  vainilla: 'Vainilla',
  chocolate: 'Chocolate',
  zanahoria: 'Zanahoria',
  marmoleado: 'Marmoleado',
  fresa: 'Fresa',
  nuez: 'Nuez',
}

const RELLENO_MAP: Record<string, string> = {
  'queso zarzamora': 'Queso/Zarzamora',
  'queso/zarzamora': 'Queso/Zarzamora',
  'crema de café': 'Crema de café',
  'crema de cafe': 'Crema de café',
  'crema pastelera': 'Crema pastelera',
  ferrero: 'Ferrero Rocher',
  'ferrero rocher': 'Ferrero Rocher',
  fresa: 'Fresa',
  'mermelada de fresa': 'Mermelada de fresa',
  durazno: 'Durazno',
  oreo: 'Oreo',
  'dulce de leche': 'Dulce de leche y nuez',
  'dulce de leche y nuez': 'Dulce de leche y nuez',
  nutella: 'Nutella',
}

const COBERTURA_MAP: Record<string, Cobertura> = {
  chantilly: 'chantilly',
  'queso crema': 'queso_crema',
  buttercream: 'buttercream',
}

const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function normalize(
  raw: unknown,
  map: Record<string, string>,
  categoria: string,
  excelRow: number,
  columna: string,
  unrecognized: string[],
): string {
  const original = String(raw ?? '').trim()
  const key = original.toLowerCase()
  const mapped = map[key]
  if (mapped) return mapped
  unrecognized.push(`${categoria}: "${original}" (fila ${excelRow}, columna ${columna})`)
  return original
}

interface ParsedRow {
  excelRow: number
  sabor: string
  relleno: string
  cobertura: string
  prices: { tamano: number; precio: number }[]
}

function parseWorkbook(filePath: string): {
  rows: ParsedRow[]
  tamanos: number[]
  unrecognized: string[]
  rowErrors: string[]
  priceErrors: string[]
} {
  const wb = XLSX.readFile(filePath)
  const sheetName = wb.SheetNames[0]
  if (!sheetName) throw new Error('El archivo Excel no tiene hojas.')
  const sheet = wb.Sheets[sheetName]
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

  const header = raw[0]
  if (!header) throw new Error('El archivo Excel no tiene fila de encabezado.')

  // Columnas de tamaño: desde la D (índice 3) en adelante, mientras sean números.
  const tamanoCols: { idx: number; tamano: number }[] = []
  for (let i = 3; i < header.length; i++) {
    const v = header[i]
    if (typeof v === 'number') {
      tamanoCols.push({ idx: i, tamano: v })
    } else {
      break
    }
  }
  if (tamanoCols.length === 0) {
    throw new Error(
      'No se encontraron columnas de tamaño numéricas a partir de la columna D del encabezado. Verifica la estructura del Excel.',
    )
  }

  const unrecognized: string[] = []
  const rowErrors: string[] = []
  const priceErrors: string[] = []
  const rows: ParsedRow[] = []

  const dataRows = raw.slice(1)
  dataRows.forEach((r, i) => {
    const excelRow = i + 2 // fila 1 es encabezado
    const isEmpty = !r || r.every((c) => c === null || c === '')
    if (isEmpty) return

    const saborRaw = r[0]
    const rellenoRaw = r[1]
    const coberturaRaw = r[2]

    if (saborRaw === null || String(saborRaw).trim() === '') {
      rowErrors.push(`Fila ${excelRow}: falta "Sabor de Pan" (columna A).`)
      return
    }
    if (rellenoRaw === null || String(rellenoRaw).trim() === '') {
      rowErrors.push(`Fila ${excelRow}: falta "Relleno" (columna B).`)
      return
    }
    if (coberturaRaw === null || String(coberturaRaw).trim() === '') {
      rowErrors.push(`Fila ${excelRow}: falta "Crema / Cobertura" (columna C).`)
      return
    }

    const sabor = normalize(saborRaw, SABOR_MAP, 'Sabor', excelRow, 'A', unrecognized)
    const relleno = normalize(rellenoRaw, RELLENO_MAP, 'Relleno', excelRow, 'B', unrecognized)
    const cobertura = normalize(
      coberturaRaw,
      COBERTURA_MAP,
      'Cobertura',
      excelRow,
      'C',
      unrecognized,
    )

    const prices: { tamano: number; precio: number }[] = []
    tamanoCols.forEach(({ idx, tamano }) => {
      const cell = r[idx]
      if (typeof cell === 'number' && Number.isFinite(cell)) {
        prices.push({ tamano, precio: cell })
      } else {
        const col = COL_LETTERS[idx] ?? `#${idx}`
        priceErrors.push(
          `Fila ${excelRow}, columna ${col} (tamaño ${tamano}): valor de precio inválido o vacío (${JSON.stringify(cell)}).`,
        )
      }
    })

    if (prices.length === 0) {
      rowErrors.push(`Fila ${excelRow}: ninguna columna de precio tiene un valor numérico válido, se omite la fila.`)
      return
    }

    rows.push({ excelRow, sabor, relleno, cobertura, prices })
  })

  return {
    rows,
    tamanos: tamanoCols.map((t) => t.tamano),
    unrecognized: [...new Set(unrecognized)].sort(),
    rowErrors,
    priceErrors,
  }
}

function bandLabel(min: number, max: number): string {
  return min === max ? `${min}` : `${min}-${max}`
}

function buildDocument(parsed: ReturnType<typeof parseWorkbook>): PriceDoc {
  const prices: Record<string, number> = {}
  const bandsByLabel = new Map<string, Band>()
  const sabores = new Set<string>()
  const rellenos = new Set<string>()
  const coberturas = new Set<string>()

  for (const row of parsed.rows) {
    sabores.add(row.sabor)
    rellenos.add(row.relleno)
    coberturas.add(row.cobertura)

    // Agrupa tamaños consecutivos (según el orden de columnas del Excel)
    // con el mismo precio, dentro de ESTA combinación únicamente.
    let start = 0
    const sorted = row.prices // ya vienen en el orden de las columnas de tamaño
    for (let i = 1; i <= sorted.length; i++) {
      const endOfRun = i === sorted.length || sorted[i].precio !== sorted[start].precio
      if (endOfRun) {
        const min = sorted[start].tamano
        const max = sorted[i - 1].tamano
        const label = bandLabel(min, max)
        const precio = sorted[start].precio
        prices[`${row.sabor}|${row.relleno}|${row.cobertura}|${label}`] = precio
        if (!bandsByLabel.has(label)) bandsByLabel.set(label, { label, min, max })
        start = i
      }
    }
  }

  const bands = [...bandsByLabel.values()].sort((a, b) => a.min - b.min)

  return {
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: 'seed_script_v1',
    version: 1,
    bands,
    prices,
    stats: {
      totalCombinaciones: parsed.rows.length,
      saboresEncontrados: [...sabores].sort(),
      rellenosEncontrados: [...rellenos].sort(),
      coberturasEncontradas: [...coberturas].sort(),
      bandsGeneradas: bands.map((b) => b.label),
      valoresNoReconocidos: parsed.unrecognized,
    },
  }
}

function printSummary(parsed: ReturnType<typeof parseWorkbook>, doc: PriceDoc): void {
  console.log('\n========== RESUMEN ==========')
  console.log(`Tamaños detectados en el encabezado: ${parsed.tamanos.join(', ')}`)
  console.log(`Filas procesadas correctamente: ${doc.stats.totalCombinaciones}`)
  console.log(`Entradas de precio generadas (prices): ${Object.keys(doc.prices).length}`)
  console.log(`Sabores encontrados (${doc.stats.saboresEncontrados.length}): ${doc.stats.saboresEncontrados.join(', ')}`)
  console.log(`Rellenos encontrados (${doc.stats.rellenosEncontrados.length}): ${doc.stats.rellenosEncontrados.join(', ')}`)
  console.log(`Coberturas encontradas (${doc.stats.coberturasEncontradas.length}): ${doc.stats.coberturasEncontradas.join(', ')}`)
  console.log(`Bandas generadas (unión de todas las combinaciones): ${doc.stats.bandsGeneradas.join(', ')}`)

  if (doc.stats.valoresNoReconocidos.length > 0) {
    console.log(`\n⚠️  VALORES NO RECONOCIDOS (${doc.stats.valoresNoReconocidos.length}) — se guardaron tal cual, revisa el Excel:`)
    doc.stats.valoresNoReconocidos.forEach((v) => console.log(`   - ${v}`))
  } else {
    console.log('\n✅ Sin valores no reconocidos.')
  }

  if (parsed.rowErrors.length > 0) {
    console.log(`\n⚠️  FILAS OMITIDAS (${parsed.rowErrors.length}):`)
    parsed.rowErrors.forEach((e) => console.log(`   - ${e}`))
  }

  if (parsed.priceErrors.length > 0) {
    console.log(`\n⚠️  CELDAS DE PRECIO INVÁLIDAS (${parsed.priceErrors.length}) — se omitió solo esa celda, la fila sigue procesada con los precios válidos restantes:`)
    parsed.priceErrors.forEach((e) => console.log(`   - ${e}`))
  }

  console.log('==============================\n')
}

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
    'No se encontraron credenciales. Coloca scripts/service-account.json o define GOOGLE_APPLICATION_CREDENTIALS. Ver instrucciones al inicio de este archivo.',
  )
}

async function main(): Promise<void> {
  const filePathArg = process.argv[2]
  if (!filePathArg) {
    console.error('Uso: npx ts-node scripts/seed-cake-prices.ts <ruta-al-excel>')
    process.exit(1)
  }

  const filePath = path.resolve(process.cwd(), filePathArg)
  if (!fs.existsSync(filePath)) {
    console.error(`Error: no se encontró el archivo "${filePath}".`)
    process.exit(1)
  }

  console.log(`Leyendo: ${filePath}`)
  const parsed = parseWorkbook(filePath)
  const doc = buildDocument(parsed)
  printSummary(parsed, doc)

  const answer = await askConfirmation('¿Continuar y escribir a Firestore? (s/n): ')
  if (answer !== 's') {
    console.log('Cancelado. No se escribió nada en Firestore.')
    process.exit(0)
  }

  initFirebaseAdmin()
  const db = getFirestore()
  const currentRef = db.collection('cake_prices').doc('current')

  let historyDocId: string | null = null
  try {
    const existing = await currentRef.get()
    if (existing.exists) {
      const historyRef = db.collection('cake_prices_history').doc()
      await historyRef.set({
        ...existing.data(),
        supersededAt: FieldValue.serverTimestamp(),
      })
      historyDocId = historyRef.id
      console.log(`Documento anterior archivado en cake_prices_history/${historyDocId}`)
    }
  } catch (err) {
    console.error('Error al archivar el documento anterior. NO se escribió el nuevo documento "current".')
    console.error(err)
    process.exit(1)
  }

  try {
    await currentRef.set(doc)
  } catch (err) {
    console.error(
      historyDocId
        ? `El historial se guardó correctamente (cake_prices_history/${historyDocId}), pero la escritura de "current" falló. Puedes reintentar solo la escritura de "current".`
        : 'La escritura de "current" falló (no había documento previo que archivar).',
    )
    console.error(err)
    process.exit(1)
  }

  console.log('\n✅ Listo.')
  console.log(`   cake_prices/current escrito con ${doc.stats.totalCombinaciones} combinaciones.`)
  if (historyDocId) console.log(`   Documento anterior archivado en cake_prices_history/${historyDocId}.`)
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
