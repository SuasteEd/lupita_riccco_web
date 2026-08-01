import type { Cobertura, EmpaqueTipo, Forma } from '../config/cakeRules'
import type { PhoneCountry } from '../lib/phone'

/**
 * Selección mínima de un extra: solo la referencia (tipo) y, si aplica,
 * la cantidad. El label/precio NO se duplica aquí — se busca en
 * config.extras (BusinessRulesConfig, vía useBusinessRules()) cuando
 * hace falta mostrarlo, para que el borrador nunca cargue una copia de
 * datos de negocio que podría quedar desactualizada.
 */
export interface SelectedExtra {
  tipo: string
  /** Solo para extras con esPorPieza: true (ej. macarons) — cantidad de piezas. */
  cantidad?: number
}

/** Estado que va viviendo en el wizard mientras el cliente llena el formulario. */
export interface OrderDraft {
  forma: Forma | null
  tamano: string | null
  esPisos: boolean
  esTresLeches: boolean
  sabor: string | null
  relleno: string | null
  cobertura: Cobertura | null
  empaqueTipo: EmpaqueTipo
  extras: SelectedExtra[]
  /** secure_url de Cloudinary ya subida — nunca el binario ni base64. */
  imagenReferencia: string | null
  nombre: string
  telefonoPais: PhoneCountry
  telefono: string
  direccion: string
  email: string
  fechaEntrega: string // yyyy-mm-dd desde <input type="date">
  comentarios: string
  /** Honeypot: un bot que llena todos los campos ocultos delata que no es humano. */
  honeypot: string
}

export const EMPTY_ORDER_DRAFT: OrderDraft = {
  forma: null,
  tamano: null,
  esPisos: false,
  esTresLeches: false,
  sabor: null,
  relleno: null,
  cobertura: null,
  empaqueTipo: 'carton_dorado',
  extras: [],
  imagenReferencia: null,
  nombre: '',
  telefonoPais: 'MX',
  telefono: '',
  direccion: '',
  email: '',
  fechaEntrega: '',
  comentarios: '',
  honeypot: '',
}
