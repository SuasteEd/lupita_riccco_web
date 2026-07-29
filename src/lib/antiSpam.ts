/*
  Primera capa anti-spam, sin dependencias externas:
  - Honeypot: un campo invisible para humanos (oculto por CSS, nunca por
    `display:none`/`hidden` que algunos bots ya saben ignorar — aquí se
    posiciona fuera de pantalla) que los bots de autollenado sí rellenan.
  - Cooldown: no se puede enviar más de una solicitud desde el mismo
    navegador dentro de la ventana de tiempo definida.

  Esto detiene bots simples y el abuso casual. NO reemplaza reCAPTCHA v3
  para bots sofisticados — eso requiere un site key de Google (tuyo) y
  una Cloud Function que verifique el score en servidor, porque v3 no se
  puede validar de forma confiable solo en el cliente. Si más adelante
  quieres esa capa, dime y armamos la Cloud Function.
*/

const COOLDOWN_KEY = 'lr-last-order-submit'
const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutos entre solicitudes por navegador

export function isHoneypotTripped(honeypot: string): boolean {
  return honeypot.trim().length > 0
}

export function getSubmitCooldownRemainingMs(): number {
  const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0)
  const elapsed = Date.now() - last
  return Math.max(0, COOLDOWN_MS - elapsed)
}

export function markSubmitted(): void {
  localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
}
