import { createContext, useContext } from 'react'
import { DEFAULT_CONFIG, type BusinessRulesConfig } from '../config/businessRulesDefault'

/*
  DEFAULT_CONFIG como valor por defecto del contexto (no null/undefined):
  así, cualquier paso del wizard que llame useBusinessRules() antes de que
  OrderForm termine de cargar Firestore recibe reglas usables de inmediato,
  nunca un config vacío que rompa las funciones de cakeRules.ts.
*/
export const BusinessRulesContext = createContext<BusinessRulesConfig>(DEFAULT_CONFIG)

export function useBusinessRules(): BusinessRulesConfig {
  return useContext(BusinessRulesContext)
}
