/*
  Reglas de negocio del formulario de pedido personalizado.
  ------------------------------------------------------------------
  Los catálogos y umbrales (tamaños, sabores, rellenos, precios fijos,
  lead times, extras...) YA NO viven hardcodeados aquí — vienen de
  Firestore (business_rules/current), vía loadBusinessRules(). Cada
  función de este archivo recibe ese config como primer parámetro en
  vez de leer constantes de módulo, para que un cambio de negocio (ej.
  agregar un sabor, mover el lead time de 3 a 5 días) se refleje sin
  redesplegar ni la web ni la app de Flutter.

  DEFAULT_CONFIG (en ./businessRulesDefault, no duplicado aquí) es el
  fallback si Firestore no responde — ver loadBusinessRules() abajo.

  Lo que SIGUE siendo estático aquí a propósito: FORMAS, COBERTURA_LABELS
  y EMPAQUE_BASE/EMPAQUE_ACETATO — texto de UI (labels/descripciones) que
  el documento de Firestore no incluye, así que se quedan aquí sin
  importar qué.

  TAMANOS_POR_FORMA y EXTRAS_DISPONIBLES (el catálogo placeholder viejo:
  vela_numero/topper/tarjeta, con su tipo ExtraOpcion) YA SE ELIMINARON —
  ambos tenían equivalente directo en Firestore (config.tamanosPorForma,
  config.extras) y sus únicos consumidores (Step1FormaTamano.tsx,
  Step3EmpaqueExtras.tsx) ya migraron a leer del config vía contexto.

  Decisiones registradas explícitamente (confirmadas con el negocio):
  - "personas" se deriva 1:1 del tamaño elegido, nunca es un campo libre.
  - El "grupo chico" de sabor/relleno es tamaño ∈ {mini, 4, 8}. El
    catálogo "clásico" completo aplica desde tamaño 10 en adelante.
  - tamaño "mini" → personas: 1 · tamaño "+100" → personas: 100.
    Son pisos conservadores solo para evaluar umbrales; el tamaño real
    elegido se guarda tal cual en el pedido para que el admin lo vea.
  - Cobertura fija en queso crema para tamaño ∈ config.tamanosGrupoChico
    (el mismo set que "grupo chico" — en el config actual son
    idénticos, por eso se reutiliza en vez de tener un campo aparte).
  - Pisos (tiered) NUNCA disponible en forma rectangular — un rectangular
    siempre es de un solo piso. Pisos solo aplica a circular/corazón con
    más personas que config.umbrales.pisosPersonasMin.
*/

import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { BusinessRulesConfig, ExtraConfig } from './businessRulesDefault'
import { DEFAULT_CONFIG } from './businessRulesDefault'

export type Forma = 'circular' | 'corazon' | 'rectangular'
export type Cobertura = 'chantilly' | 'queso_crema' | 'buttercream'
export type EmpaqueTipo = 'carton_dorado' | 'caja_acetato'

export const FORMAS: { value: Forma; label: string }[] = [
  { value: 'circular', label: 'Circular' },
  { value: 'corazon', label: 'Corazón' },
  { value: 'rectangular', label: 'Rectangular' },
]

/** Lee business_rules/current una sola vez (sin listener en tiempo real: si el negocio
 *  actualiza reglas mid-sesión, el cliente las ve en su próxima visita, no a la mitad
 *  de su pedido). Nunca deja al formulario roto: cualquier fallo cae a DEFAULT_CONFIG
 *  silenciosamente para el usuario (el error solo se loguea en consola). */
export async function loadBusinessRules(): Promise<BusinessRulesConfig> {
  try {
    const docRef = doc(db, 'business_rules', 'current')
    const snap = await getDoc(docRef)
    if (!snap.exists()) {
      console.warn('[cakeRules] business_rules/current no existe — usando DEFAULT_CONFIG')
      return DEFAULT_CONFIG
    }
    return snap.data() as BusinessRulesConfig
  } catch (error) {
    console.error('[cakeRules] Error leyendo business_rules:', error)
    return DEFAULT_CONFIG
  }
}

/** tamaño ("30", "mini", "+100", ...) -> número de personas que se guarda y se usa para evaluar reglas. */
export function personasDeTamano(config: BusinessRulesConfig, tamano: string): number {
  if (tamano in config.personasEspeciales) return config.personasEspeciales[tamano]
  const n = Number(tamano)
  if (!Number.isFinite(n)) {
    throw new Error(`Tamaño desconocido, no se puede derivar personas: ${tamano}`)
  }
  return n
}

/** Para forma "corazon": escala la cuenta de personas según config.corazonEscalones
 *  (un corazón de un tamaño nominal necesita más masa que un circular equivalente,
 *  así que sus umbrales de pisos/tres-leches se evalúan con la cifra escalada, no
 *  la nominal). Si personasReales no tiene entrada en la tabla, se regresa tal cual. */
export function corazonPersonasEquivalentes(config: BusinessRulesConfig, personasReales: number): number {
  const key = String(personasReales)
  return key in config.corazonEscalones ? config.corazonEscalones[key] : personasReales
}

/** Rectangular es siempre de un piso — pisos solo aplica a circular/corazón. */
export function isPisosDisponible(config: BusinessRulesConfig, forma: Forma, personas: number): boolean {
  return forma !== 'rectangular' && personas > config.umbrales.pisosPersonasMin
}

export function isTresLechesDisponible(
  config: BusinessRulesConfig,
  forma: Forma,
  personas: number,
  esPisos: boolean,
): boolean {
  return forma === 'rectangular' && personas <= config.umbrales.tresLechesPersonasMax && !esPisos
}

/** forma "rectangular" usa config.tamanosGrandesRectangular; el resto usa config.tamanosGrandes. */
export function isTamanoGrande(config: BusinessRulesConfig, forma: Forma, tamano: string): boolean {
  if (forma === 'rectangular') return config.tamanosGrandesRectangular.includes(tamano)
  return config.tamanosGrandes.includes(tamano)
}

export function getSaboresDisponibles(
  config: BusinessRulesConfig,
  params: { tamano: string; esTresLeches: boolean },
): string[] {
  if (config.tamanosGrupoChico.includes(params.tamano)) return config.sabores.grupoChico
  if (params.esTresLeches) return config.sabores.tresLeches
  return config.sabores.clasico
}

export function getRellenosDisponibles(
  config: BusinessRulesConfig,
  params: { tamano: string; esTresLeches: boolean },
): string[] {
  if (config.tamanosGrupoChico.includes(params.tamano)) return config.rellenos.grupoChico
  if (params.esTresLeches) return config.rellenos.tresLeches
  return config.rellenos.clasico
}

/** Precio fijo de grupo chico: primero intenta la clave compuesta "tamano|relleno"
 *  (ej. "4" varía por relleno), y si no existe cae a la clave simple "tamano" (ej.
 *  "mini", que no varía por relleno). null si el tamaño no tiene precio fijo. */
export function getPrecioGrupoChico(config: BusinessRulesConfig, tamano: string, relleno: string): number | null {
  const compuesta = `${tamano}|${relleno}`
  if (compuesta in config.preciosGrupoChicoFijos) return config.preciosGrupoChicoFijos[compuesta]
  if (tamano in config.preciosGrupoChicoFijos) return config.preciosGrupoChicoFijos[tamano]
  return null
}

export interface CoberturaResultado {
  /** Si no es null, la cobertura está forzada y el UI no debe dejar elegir. */
  fija: Cobertura | null
  opciones: Cobertura[]
}

export function getCoberturaDisponible(
  config: BusinessRulesConfig,
  params: { tamano: string; esTresLeches: boolean; esPisos: boolean },
): CoberturaResultado {
  if (config.tamanosGrupoChico.includes(params.tamano)) return { fija: 'queso_crema', opciones: ['queso_crema'] }
  if (params.esTresLeches) return { fija: 'chantilly', opciones: ['chantilly'] }
  if (params.esPisos) return { fija: 'buttercream', opciones: ['buttercream'] }
  return { fija: null, opciones: ['chantilly', 'queso_crema', 'buttercream'] }
}

export const COBERTURA_LABELS: Record<Cobertura, string> = {
  chantilly: 'Chantilly',
  queso_crema: 'Queso crema',
  buttercream: 'Buttercream',
}

export interface EmpaqueOpcion {
  tipo: EmpaqueTipo
  nombre: string
  descripcion: string
}

export const EMPAQUE_BASE: EmpaqueOpcion = {
  tipo: 'carton_dorado',
  nombre: 'Base de cartón dorado',
  descripcion: 'Incluida siempre, sin costo extra.',
}

export const EMPAQUE_ACETATO: EmpaqueOpcion = {
  tipo: 'caja_acetato',
  nombre: 'Caja de acetato',
  descripcion: 'Incluye listón y vela de chispa. El costo se confirma por WhatsApp.',
}

/** Caja de acetato solo aplica para pedidos medianos (config.umbrales.empaqueAcetatoPersonasMin a Max, inclusive). */
export function getEmpaquesDisponibles(config: BusinessRulesConfig, personas: number): EmpaqueOpcion[] {
  const opciones = [EMPAQUE_BASE]
  if (personas >= config.umbrales.empaqueAcetatoPersonasMin && personas <= config.umbrales.empaqueAcetatoPersonasMax) {
    opciones.push(EMPAQUE_ACETATO)
  }
  return opciones
}

export function fechaMinimaEntrega(config: BusinessRulesConfig, esPisos: boolean): Date {
  const dias = esPisos ? config.leadTimeDiasPisos : config.leadTimeDias
  const fecha = new Date()
  fecha.setHours(0, 0, 0, 0)
  fecha.setDate(fecha.getDate() + dias)
  return fecha
}

export function formatFechaMinima(config: BusinessRulesConfig, esPisos: boolean): string {
  return fechaMinimaEntrega(config, esPisos).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export type { BusinessRulesConfig, ExtraConfig }
