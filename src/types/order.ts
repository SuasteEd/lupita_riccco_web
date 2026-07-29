import type { Cobertura, EmpaqueTipo, ExtraOpcion, Forma } from '../config/cakeRules'
import type { PhoneCountry } from '../lib/phone'

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
  extras: ExtraOpcion[]
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
