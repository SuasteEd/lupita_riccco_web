/*
  Reglas de negocio del formulario de pedido personalizado.
  ------------------------------------------------------------------
  Todo lo que decide qué opciones se muestran o se bloquean vive aquí,
  no disperso en los componentes del wizard. Para ajustar catálogos,
  precios de referencia (si algún día se muestran) o umbrales, edita
  solo este archivo.

  Decisiones registradas explícitamente (confirmadas con el negocio):
  - "personas" se deriva 1:1 del tamaño elegido, nunca es un campo libre.
  - El "grupo chico" de sabor/relleno es tamaño ∈ {mini, 4, 8}. El
    catálogo "clásico" completo aplica desde tamaño 10 en adelante.
  - tamaño "mini" → personas: 1 · tamaño "+100" → personas: 100.
    Son pisos conservadores solo para evaluar umbrales; el tamaño real
    elegido se guarda tal cual en el pedido para que el admin lo vea.
  - Cobertura fija en queso crema para tamaño ∈ {mini, 4, 8}.
  - Pisos (tiered) NUNCA disponible en forma rectangular — un rectangular
    siempre es de un solo piso. Pisos solo aplica a circular/corazón con
    más de 20 personas.
  - Lead time mínimo de entrega y catálogo de "extras": no vinieron
    especificados por el negocio, son la única parte de este archivo
    que es una propuesta razonable en vez de una regla confirmada.
    Ajusta LEAD_TIME_DIAS* y EXTRAS_DISPONIBLES libremente.
*/

export type Forma = 'circular' | 'corazon' | 'rectangular'
export type Cobertura = 'chantilly' | 'queso_crema' | 'buttercream'
export type EmpaqueTipo = 'carton_dorado' | 'caja_acetato'

export const FORMAS: { value: Forma; label: string }[] = [
  { value: 'circular', label: 'Circular' },
  { value: 'corazon', label: 'Corazón' },
  { value: 'rectangular', label: 'Rectangular' },
]

export const TAMANOS_POR_FORMA: Record<Forma, string[]> = {
  circular: ['mini', '4', '8', '10', '15', '20', '30', '40', '50', '60', '70', '80', '+100'],
  corazon: ['10', '15', '20'],
  rectangular: ['30', '50', '70', '100'],
}

const PERSONAS_ESPECIALES: Record<string, number> = { mini: 1, '+100': 100 }

/** tamaño ("30", "mini", "+100", ...) -> número de personas que se guarda y se usa para evaluar reglas. */
export function personasDeTamano(tamano: string): number {
  if (tamano in PERSONAS_ESPECIALES) return PERSONAS_ESPECIALES[tamano]
  const n = Number(tamano)
  if (!Number.isFinite(n)) {
    throw new Error(`Tamaño desconocido, no se puede derivar personas: ${tamano}`)
  }
  return n
}

const TAMANOS_GRUPO_CHICO = new Set(['mini', '4', '8'])
const TAMANOS_COBERTURA_FIJA = new Set(['mini', '4', '8'])

/** Rectangular es siempre de un piso — pisos solo aplica a circular/corazón. */
export function isPisosDisponible(forma: Forma, personas: number): boolean {
  return forma !== 'rectangular' && personas > 20 
}

export function isTresLechesDisponible(forma: Forma, personas: number, esPisos: boolean): boolean {
  return forma === 'rectangular' && personas <= 70 && !esPisos
}

const SABOR_GRUPO_CHICO = ['Vainilla']
const SABOR_TRES_LECHES = ['Vainilla', 'Chocolate', 'Café', 'Nuez']
const SABOR_CLASICO = [
  'Red Velvet',
  'Café',
  'Zanahoria',
  'Marmoleado',
  'Vainilla',
  'Chocolate',
  'Fresa',
  'Nuez',
]

const RELLENO_GRUPO_CHICO = ['Mermelada de fresa', 'Nutella']
const RELLENO_TRES_LECHES = ['Fresa', 'Durazno', 'Oreo']
const RELLENO_CLASICO = [
  'Queso/Zarzamora',
  'Crema de café',
  'Crema pastelera',
  'Ferrero Rocher',
  'Fresa',
  'Mermelada de fresa',
  'Durazno',
  'Oreo',
  'Dulce de leche y nuez',
]

export function getSaboresDisponibles(params: { tamano: string; esTresLeches: boolean }): string[] {
  if (TAMANOS_GRUPO_CHICO.has(params.tamano)) return SABOR_GRUPO_CHICO
  if (params.esTresLeches) return SABOR_TRES_LECHES
  return SABOR_CLASICO
}

export function getRellenosDisponibles(params: { tamano: string; esTresLeches: boolean }): string[] {
  if (TAMANOS_GRUPO_CHICO.has(params.tamano)) return RELLENO_GRUPO_CHICO
  if (params.esTresLeches) return RELLENO_TRES_LECHES
  return RELLENO_CLASICO
}

export interface CoberturaResultado {
  /** Si no es null, la cobertura está forzada y el UI no debe dejar elegir. */
  fija: Cobertura | null
  opciones: Cobertura[]
}

export function getCoberturaDisponible(params: {
  tamano: string
  esTresLeches: boolean
  esPisos: boolean
}): CoberturaResultado {
  if (TAMANOS_COBERTURA_FIJA.has(params.tamano)) return { fija: 'queso_crema', opciones: ['queso_crema'] }
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

/** Caja de acetato solo aplica para pedidos medianos (10 a 30 personas inclusive). */
export function getEmpaquesDisponibles(personas: number): EmpaqueOpcion[] {
  const opciones = [EMPAQUE_BASE]
  if (personas >= 10 && personas <= 30) opciones.push(EMPAQUE_ACETATO)
  return opciones
}

export interface ExtraOpcion {
  tipo: string
  descripcion: string
}

/** Catálogo propuesto, no vino especificado por el negocio — edítalo libremente. */
export const EXTRAS_DISPONIBLES: ExtraOpcion[] = [
  { tipo: 'vela_numero', descripcion: 'Vela de número' },
  { tipo: 'topper', descripcion: 'Topper personalizado' },
  { tipo: 'tarjeta', descripcion: 'Tarjeta con dedicatoria' },
]

/** Días mínimos de anticipación para la fecha de entrega. Propuesta, ajustable. */
export const LEAD_TIME_DIAS = 3
export const LEAD_TIME_DIAS_PISOS = 5

export function fechaMinimaEntrega(esPisos: boolean): Date {
  const dias = esPisos ? LEAD_TIME_DIAS_PISOS : LEAD_TIME_DIAS
  const fecha = new Date()
  fecha.setHours(0, 0, 0, 0)
  fecha.setDate(fecha.getDate() + dias)
  return fecha
}

export function formatFechaMinima(esPisos: boolean): string {
  return fechaMinimaEntrega(esPisos).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
