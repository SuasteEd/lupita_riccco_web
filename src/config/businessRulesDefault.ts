/*
  Fuente de verdad única para las reglas de negocio del formulario.
  ------------------------------------------------------------------
  BusinessRulesConfig y DEFAULT_CONFIG viven aquí (y no directo en
  cakeRules.ts ni duplicados en scripts/seed-business-rules.ts) para que
  el script de seed y el fallback de la app SIEMPRE usen exactamente los
  mismos valores — si vivieran en dos lugares, divergirían la primera
  vez que alguien edite uno y se le olvide el otro.

  DEFAULT_CONFIG es el fallback si Firestore no está disponible (offline,
  downtime, error de red). No incluye updatedAt/updatedBy/version: esos
  son metadata del documento de Firestore, no reglas de negocio — el
  script de seed los agrega al escribir.
*/

export interface ExtraConfig {
  tipo: string
  label: string
  esRango: boolean
  sumaAlEstimado: boolean
  descripcion: string | null
  precioFijo?: number
  precioBase?: number
  precioMax?: number
  precioPorPieza?: number
  esPorPieza?: boolean
}

export interface BusinessRulesConfig {
  formas: string[]
  tamanosPorForma: Record<string, string[]>
  personasEspeciales: Record<string, number>
  tamanosGrupoChico: string[]
  tamanosGrupoChicoConPrecioFijo: string[]
  tamanosGrandes: string[]
  tamanosGrandesRectangular: string[]
  umbrales: {
    pisosPersonasMin: number
    tresLechesPersonasMax: number
    empaqueAcetatoPersonasMin: number
    empaqueAcetatoPersonasMax: number
    pisosEstructuraEstandarMax: number
    pisosEstructuraMediaMax: number
  }
  sabores: { grupoChico: string[]; tresLeches: string[]; clasico: string[] }
  rellenos: { grupoChico: string[]; tresLeches: string[]; clasico: string[] }
  corazonEscalones: Record<string, number>
  preciosGrupoChicoFijos: Record<string, number>
  costoEstructuraPisos: { estandar: number; media: number; grande: number }
  costoEmpaque: { caja_acetato: number }
  extras: ExtraConfig[]
  leadTimeDias: number
  leadTimeDiasPisos: number
  avisos: Record<string, string>
}

export const DEFAULT_CONFIG: BusinessRulesConfig = {
  formas: ['circular', 'corazon', 'rectangular'],

  tamanosPorForma: {
    circular: ['mini', '4', '8', '10', '15', '20', '30', '40', '50', '60', '70', '80', '+100'],
    corazon: ['10', '15', '20'],
    rectangular: ['30', '50', '70', '100'],
  },

  personasEspeciales: { mini: 1, '+100': 100 },

  tamanosGrupoChico: ['mini', '4', '8'],

  tamanosGrupoChicoConPrecioFijo: ['mini', '4'],

  tamanosGrandes: ['60', '70', '80', '+100'],

  tamanosGrandesRectangular: ['70', '100'],

  umbrales: {
    pisosPersonasMin: 20,
    tresLechesPersonasMax: 70,
    empaqueAcetatoPersonasMin: 10,
    empaqueAcetatoPersonasMax: 30,
    pisosEstructuraEstandarMax: 60,
    pisosEstructuraMediaMax: 100,
  },

  sabores: {
    grupoChico: ['Vainilla'],
    tresLeches: ['Vainilla', 'Chocolate', 'Café', 'Nuez'],
    clasico: ['Red Velvet', 'Café', 'Zanahoria', 'Marmoleado', 'Vainilla', 'Chocolate', 'Fresa', 'Nuez'],
  },

  rellenos: {
    grupoChico: ['Mermelada de fresa', 'Nutella'],
    tresLeches: ['Fresa', 'Durazno', 'Oreo'],
    clasico: [
      'Queso/Zarzamora',
      'Crema de café',
      'Crema pastelera',
      'Ferrero Rocher',
      'Fresa',
      'Mermelada de fresa',
      'Durazno',
      'Oreo',
      'Dulce de leche y nuez',
    ],
  },

  corazonEscalones: { '10': 15, '15': 20, '20': 30 },

  preciosGrupoChicoFijos: {
    mini: 150,
    '4|Mermelada de fresa': 270,
    '4|Nutella': 300,
  },

  costoEstructuraPisos: { estandar: 70, media: 350, grande: 500 },

  costoEmpaque: { caja_acetato: 120 },

  extras: [
    {
      tipo: 'acrilico_personalizado',
      label: 'Acrílico personalizado',
      precioFijo: 120,
      esRango: false,
      sumaAlEstimado: true,
      descripcion: null,
    },
    {
      tipo: 'cake_topper',
      label: 'Cake topper personalizado',
      precioBase: 80,
      precioMax: 150,
      esRango: true,
      sumaAlEstimado: true,
      descripcion: 'precio final puede llegar a $150 según diseño',
    },
    {
      tipo: 'macarons',
      label: 'Macarons',
      precioPorPieza: 35,
      esRango: false,
      sumaAlEstimado: true,
      esPorPieza: true,
      descripcion: null,
    },
    {
      tipo: 'flores',
      label: 'Flores naturales',
      precioBase: 60,
      precioMax: 90,
      esRango: true,
      sumaAlEstimado: true,
      descripcion: 'entre $60 y $90 según arreglo',
    },
    {
      tipo: 'fondant',
      label: 'Fondant / figuras decorativas',
      precioBase: 30,
      precioMax: 250,
      esRango: true,
      sumaAlEstimado: false,
      descripcion: 'precio varía según detalle — se confirma al aprobar el pedido',
    },
  ],

  leadTimeDias: 3,
  leadTimeDiasPisos: 5,

  avisos: {
    grupoChico:
      'Los pasteles pequeños tienen espacio reducido para decoraciones — algunas opciones de personalización pueden no estar disponibles.',
    baseMaderaDevolucion:
      'Las bases de madera se prestan con el pedido y deben devolverse al momento de la entrega.',
    tamanosGrandes:
      'Los pasteles de este tamaño se cotizan de forma personalizada, ya que pueden incluir múltiples sabores y rellenos.',
    precioEstimado: 'Precio final sujeto a confirmación por WhatsApp antes de apartar el pedido.',
  },
}
