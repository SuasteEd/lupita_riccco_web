import {
  getCoberturaDisponible,
  getEmpaquesDisponibles,
  getRellenosDisponibles,
  getSaboresDisponibles,
  isPisosDisponible,
  isTresLechesDisponible,
  personasDeTamano,
} from '../config/cakeRules'
import type { BusinessRulesConfig } from '../config/businessRulesDefault'
import type { OrderDraft } from '../types/order'

/**
 * Re-aplica todo el árbol de reglas de negocio después de CUALQUIER cambio
 * en el borrador, sin importar qué campo cambió. En vez de tener casos
 * especiales por transición ("si cambia forma, limpia tamaño"; "si cambia
 * tamaño, limpia sabor"...), esto simplemente recalcula qué sigue siendo
 * válido y descarta lo que dejó de serlo. Así el borrador nunca puede
 * quedar en un estado inconsistente (ej. tamaño "mini" con cobertura
 * "buttercream" elegida antes de cambiar el tamaño).
 */
export function sanitizeOrderDraft(draft: OrderDraft, config: BusinessRulesConfig): OrderDraft {
  let { forma, tamano, esPisos, esTresLeches, sabor, relleno, cobertura, empaqueTipo } = draft

  if (!forma) {
    tamano = null
  } else if (tamano && !config.tamanosPorForma[forma].includes(tamano)) {
    tamano = null
  }

  const personas = tamano ? personasDeTamano(config, tamano) : null

  esPisos = Boolean(forma && personas !== null && esPisos && isPisosDisponible(config, forma, personas))
  esTresLeches = Boolean(
    forma && personas !== null && esTresLeches && isTresLechesDisponible(config, forma, personas, esPisos),
  )

  if (tamano) {
    const sabores = getSaboresDisponibles(config, { tamano, esTresLeches })
    if (sabor && !sabores.includes(sabor)) sabor = null

    const rellenos = getRellenosDisponibles(config, { tamano, esTresLeches })
    if (relleno && !rellenos.includes(relleno)) relleno = null

    const coberturaInfo = getCoberturaDisponible(config, { tamano, esTresLeches, esPisos })
    if (coberturaInfo.fija) {
      cobertura = coberturaInfo.fija
    } else if (cobertura && !coberturaInfo.opciones.includes(cobertura)) {
      cobertura = null
    }
  } else {
    sabor = null
    relleno = null
    cobertura = null
  }

  if (personas !== null) {
    const empaques = getEmpaquesDisponibles(config, personas)
    if (!empaques.some((e) => e.tipo === empaqueTipo)) empaqueTipo = 'carton_dorado'
  } else {
    empaqueTipo = 'carton_dorado'
  }

  return { ...draft, forma, tamano, esPisos, esTresLeches, sabor, relleno, cobertura, empaqueTipo }
}
