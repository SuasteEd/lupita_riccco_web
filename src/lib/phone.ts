export type PhoneCountry = 'MX' | 'US'

export const PHONE_COUNTRIES: { value: PhoneCountry; label: string; dialCode: string }[] = [
  { value: 'MX', label: 'México (+52)', dialCode: '+52' },
  { value: 'US', label: 'Estados Unidos (+1)', dialCode: '+1' },
]

/**
 * Normaliza un número de WhatsApp/celular a E.164 según el país elegido.
 * Acepta que el cliente lo escriba con o sin lada de país, espacios, guiones
 * o paréntesis. Devuelve null si no se puede normalizar a un número válido.
 *
 * México usa "+521" + 10 dígitos (no "+52" a secas): es el formato que
 * espera wa.me / WhatsApp Business API para números mexicanos, el mismo
 * que ya se usa en los links de WhatsApp del resto del sitio.
 * Estados Unidos usa el estándar NANP: "+1" + 10 dígitos.
 */
export function normalizePhone(raw: string, country: PhoneCountry): string | null {
  const digits = raw.replace(/\D/g, '')

  if (country === 'MX') {
    let local: string | null = null
    if (digits.length === 10) {
      local = digits
    } else if (digits.length === 12 && digits.startsWith('52')) {
      local = digits.slice(2)
    } else if (digits.length === 13 && digits.startsWith('521')) {
      local = digits.slice(3)
    }
    if (!local || local.length !== 10) return null
    return `+521${local}`
  }

  // US
  let local: string | null = null
  if (digits.length === 10) {
    local = digits
  } else if (digits.length === 11 && digits.startsWith('1')) {
    local = digits.slice(1)
  }
  if (!local || local.length !== 10) return null
  return `+1${local}`
}

export function isValidPhone(raw: string, country: PhoneCountry): boolean {
  return normalizePhone(raw, country) !== null
}
