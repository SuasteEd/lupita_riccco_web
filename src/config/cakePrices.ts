import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface CakePricesDocument {
  bands: { label: string; min: number; max: number }[]
  prices: Record<string, number>
  version: number
  updatedAt: unknown
}

/**
 * A diferencia de loadBusinessRules(), regresa null (no un fallback
 * hardcodeado) si Firestore no responde — no hay precios por default
 * razonables, y el estimador debe simplemente no mostrar precio en
 * vez de inventar uno.
 */
export async function loadCakePrices(): Promise<CakePricesDocument | null> {
  try {
    const docRef = doc(db, 'cake_prices', 'current')
    const snap = await getDoc(docRef)
    if (!snap.exists()) {
      return null
    }
    return snap.data() as CakePricesDocument
  } catch {
    return null
  }
}
