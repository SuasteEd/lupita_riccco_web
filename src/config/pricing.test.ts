import { describe, expect, it } from 'vitest'
import { calculateEstimate } from './pricing'
import { DEFAULT_CONFIG } from './businessRulesDefault'
import type { CakePricesDocument } from './cakePrices'
import { EMPTY_ORDER_DRAFT, type OrderDraft } from '../types/order'

const mockPricesDoc: CakePricesDocument = {
  version: 1,
  updatedAt: null,
  bands: [
    { label: '10-20', min: 10, max: 20 },
    { label: '30-50', min: 30, max: 50 },
  ],
  prices: {
    'Vainilla|Mermelada de fresa|chantilly|10-20': 35,
    'Vainilla|Mermelada de fresa|chantilly|30-50': 32,
    'Red Velvet|Fresa|chantilly|10-20': 37,
    'Red Velvet|Fresa|chantilly|30-50': 35,
    'Red Velvet|Fresa|buttercream|10-20': 42,
    'Chocolate|Oreo|buttercream|10-20': 45,
    'Vainilla|Mermelada de fresa|queso_crema|10-20': 38,
    'Vainilla|Mermelada de fresa|queso_crema|30-50': 34,
  },
}

function draft(overrides: Partial<OrderDraft>): OrderDraft {
  return { ...EMPTY_ORDER_DRAFT, ...overrides }
}

describe('calculateEstimate', () => {
  it('Test 1 — mini, precio fijo (no multiplica por personas)', () => {
    const result = calculateEstimate(
      draft({
        forma: 'circular',
        tamano: 'mini',
        sabor: 'Vainilla',
        relleno: 'Mermelada de fresa',
        cobertura: 'queso_crema',
        esTresLeches: false,
        esPisos: false,
        empaqueTipo: 'carton_dorado',
        extras: [],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBe(150)
    expect(result.total).toBe(150)
    expect(result.requiresCotizacion).toBe(false)
  })

  it('Test 2 — tamaño 4 + Nutella (precio fijo) + flores', () => {
    const result = calculateEstimate(
      draft({
        forma: 'circular',
        tamano: '4',
        sabor: 'Vainilla',
        relleno: 'Nutella',
        cobertura: 'queso_crema',
        esTresLeches: false,
        esPisos: false,
        empaqueTipo: 'carton_dorado',
        extras: [{ tipo: 'flores' }],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBe(300)
    expect(result.extras).toEqual([{ tipo: 'flores', label: 'Flores naturales', monto: 60 }])
    expect(result.total).toBe(360)
    expect(result.requiresCotizacion).toBe(false)
  })

  it('Test 3 — corazón 10 (escalón→15, band 10-20, ×10 personas reales)', () => {
    const result = calculateEstimate(
      draft({
        forma: 'corazon',
        tamano: '10',
        sabor: 'Vainilla',
        relleno: 'Mermelada de fresa',
        cobertura: 'chantilly',
        esTresLeches: false,
        esPisos: false,
        empaqueTipo: 'carton_dorado',
        extras: [],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBe(350)
    expect(result.total).toBe(350)
    expect(result.requiresCotizacion).toBe(false)
  })

  it('Test 4 — corazón 20 (escalón→30, band 30-50, ×20 personas reales)', () => {
    const result = calculateEstimate(
      draft({
        forma: 'corazon',
        tamano: '20',
        sabor: 'Vainilla',
        relleno: 'Mermelada de fresa',
        cobertura: 'chantilly',
        esTresLeches: false,
        esPisos: false,
        empaqueTipo: 'carton_dorado',
        extras: [],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBe(640)
    expect(result.total).toBe(640)
    expect(result.requiresCotizacion).toBe(false)
  })

  it('Test 5 — circular 50 + pisos (estructura estándar) + caja de acetato', () => {
    const result = calculateEstimate(
      draft({
        forma: 'circular',
        tamano: '50',
        sabor: 'Red Velvet',
        relleno: 'Fresa',
        cobertura: 'chantilly',
        esTresLeches: false,
        esPisos: true,
        empaqueTipo: 'caja_acetato',
        extras: [],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBe(1750)
    expect(result.estructuraPisos).toBe(70)
    expect(result.empaque).toBe(120)
    expect(result.total).toBe(1940)
    expect(result.requiresCotizacion).toBe(false)
  })

  it('Test 6 — circular 80 (tamaño grande → cotización)', () => {
    const result = calculateEstimate(
      draft({
        forma: 'circular',
        tamano: '80',
        sabor: 'Red Velvet',
        relleno: 'Fresa',
        cobertura: 'chantilly',
        esTresLeches: false,
        esPisos: false,
        empaqueTipo: 'carton_dorado',
        extras: [],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBeNull()
    expect(result.total).toBeNull()
    expect(result.requiresCotizacion).toBe(true)
    expect(result.cotizacionReason).toBe('Los pasteles de este tamaño se cotizan de forma personalizada')
  })

  it('Test 7 — rectangular 70, 3 leches (tamaño grande → cotización)', () => {
    const result = calculateEstimate(
      draft({
        forma: 'rectangular',
        tamano: '70',
        sabor: 'Vainilla',
        relleno: 'Mermelada de fresa',
        cobertura: 'chantilly',
        esTresLeches: true,
        esPisos: false,
        empaqueTipo: 'carton_dorado',
        extras: [],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBeNull()
    expect(result.total).toBeNull()
    expect(result.requiresCotizacion).toBe(true)
    expect(result.cotizacionReason).toBe('Los pasteles de este tamaño se cotizan de forma personalizada')
  })

  it('Test 8 — 15 personas + pisos + fondant + macarons×3 + flores', () => {
    const result = calculateEstimate(
      draft({
        forma: 'circular',
        tamano: '15',
        sabor: 'Chocolate',
        relleno: 'Oreo',
        cobertura: 'buttercream',
        esTresLeches: false,
        esPisos: true,
        empaqueTipo: 'carton_dorado',
        extras: [{ tipo: 'fondant' }, { tipo: 'macarons', cantidad: 3 }, { tipo: 'flores' }],
      }),
      DEFAULT_CONFIG,
      mockPricesDoc,
    )
    expect(result.base).toBe(675)
    expect(result.estructuraPisos).toBe(70)
    expect(result.empaque).toBe(0)
    expect(result.extras).toEqual([
      { tipo: 'macarons', label: 'Macarons', monto: 105 },
      { tipo: 'flores', label: 'Flores naturales', monto: 60 },
    ])
    expect(result.incluyeFondant).toBe(true)
    expect(result.total).toBe(910)
    expect(result.requiresCotizacion).toBe(false)
  })
})
