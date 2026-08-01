import {
  corazonPersonasEquivalentes,
  getPrecioGrupoChico,
  isTamanoGrande,
  personasDeTamano,
} from './cakeRules'
import type { BusinessRulesConfig } from './businessRulesDefault'
import type { CakePricesDocument } from './cakePrices'
import type { OrderDraft } from '../types/order'

export interface PriceEstimate {
  base: number | null
  estructuraPisos: number | null
  empaque: number
  extras: { tipo: string; label: string; monto: number }[]
  incluyeFondant: boolean
  total: number | null
  requiresCotizacion: boolean
  cotizacionReason: string | null
}

export function calculateEstimate(
  draft: OrderDraft,
  config: BusinessRulesConfig,
  pricesDoc: CakePricesDocument | null,
): PriceEstimate {
  if (!draft.forma || !draft.tamano) {
    return {
      base: null,
      estructuraPisos: null,
      empaque: 0,
      extras: [],
      incluyeFondant: false,
      total: null,
      requiresCotizacion: false,
      cotizacionReason: null,
    }
  }

  const forma = draft.forma
  const tamano = draft.tamano
  const personas = personasDeTamano(config, tamano)

  let base: number | null = null
  let cotizacionReason: string | null = null

  if (isTamanoGrande(config, forma, tamano)) {
    cotizacionReason = 'Los pasteles de este tamaño se cotizan de forma personalizada'
  } else if (draft.relleno) {
    const precioFijo = getPrecioGrupoChico(config, tamano, draft.relleno)
    if (precioFijo !== null) {
      // Precio fijo total (grupo chico) — NO se multiplica por personas.
      base = precioFijo
    } else if (draft.sabor && draft.cobertura && pricesDoc) {
      // Para corazón: el lookup de precio usa el escalón equivalente,
      // pero el total se calcula con las personas REALES del tamaño elegido.
      const personasParaLookup =
        forma === 'corazon' ? corazonPersonasEquivalentes(config, personas) : personas
      const band = pricesDoc.bands.find((b) => personasParaLookup >= b.min && personasParaLookup <= b.max)
      if (band) {
        const clave = `${draft.sabor}|${draft.relleno}|${draft.cobertura}|${band.label}`
        const precioPorPersona = pricesDoc.prices[clave]
        if (precioPorPersona !== undefined) {
          base = precioPorPersona * personas
        }
      }
      if (base === null) {
        cotizacionReason = 'No se encontró precio para esta combinación'
      }
    } else {
      cotizacionReason = 'No se encontró precio para esta combinación'
    }
  } else {
    cotizacionReason = 'No se encontró precio para esta combinación'
  }

  let estructuraPisos: number | null = null
  if (draft.esPisos) {
    if (personas <= config.umbrales.pisosEstructuraEstandarMax) {
      estructuraPisos = config.costoEstructuraPisos.estandar
    } else if (personas <= config.umbrales.pisosEstructuraMediaMax) {
      estructuraPisos = config.costoEstructuraPisos.media
    } else {
      estructuraPisos = config.costoEstructuraPisos.grande
    }
  }

  const empaque = draft.empaqueTipo === 'caja_acetato' ? config.costoEmpaque.caja_acetato : 0

  const extras: { tipo: string; label: string; monto: number }[] = []
  let incluyeFondant = false
  for (const selected of draft.extras) {
    const extraConfig = config.extras.find((e) => e.tipo === selected.tipo)
    if (!extraConfig) continue

    if (selected.tipo === 'fondant') {
      incluyeFondant = true
      continue
    }
    if (!extraConfig.sumaAlEstimado) continue

    let monto = 0
    if (extraConfig.esPorPieza && selected.cantidad) {
      monto = (extraConfig.precioPorPieza ?? 0) * selected.cantidad
    } else if (!extraConfig.esRango) {
      monto = extraConfig.precioFijo ?? 0
    } else {
      monto = extraConfig.precioBase ?? 0
    }
    extras.push({ tipo: extraConfig.tipo, label: extraConfig.label, monto })
  }

  if (base === null) {
    return {
      base: null,
      estructuraPisos,
      empaque,
      extras,
      incluyeFondant,
      total: null,
      requiresCotizacion: true,
      cotizacionReason,
    }
  }

  const total = base + (estructuraPisos ?? 0) + empaque + extras.reduce((sum, e) => sum + e.monto, 0)

  return {
    base,
    estructuraPisos,
    empaque,
    extras,
    incluyeFondant,
    total,
    requiresCotizacion: false,
    cotizacionReason: null,
  }
}
