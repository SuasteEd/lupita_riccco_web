import {
  COBERTURA_LABELS,
  getCoberturaDisponible,
  getRellenosDisponibles,
  getSaboresDisponibles,
} from '../../../config/cakeRules'
import { useBusinessRules } from '../../../context/BusinessRulesContext'
import type { OrderDraft } from '../../../types/order'
import { Field, RadioCards, Select } from '../fields'

export function Step2SaborRellenoCobertura({
  draft,
  update,
}: {
  draft: OrderDraft
  update: (patch: Partial<OrderDraft>) => void
}) {
  const config = useBusinessRules()
  if (!draft.tamano) return null

  const sabores = getSaboresDisponibles(config, { tamano: draft.tamano, esTresLeches: draft.esTresLeches })
  const rellenos = getRellenosDisponibles(config, { tamano: draft.tamano, esTresLeches: draft.esTresLeches })
  const coberturaInfo = getCoberturaDisponible(config, {
    tamano: draft.tamano,
    esTresLeches: draft.esTresLeches,
    esPisos: draft.esPisos,
  })

  return (
    <div className="flex flex-col gap-6">
      <Field label="Sabor del pan">
        <Select value={draft.sabor ?? ''} onChange={(e) => update({ sabor: e.target.value || null })}>
          <option value="" disabled>
            Elige un sabor
          </option>
          {sabores.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Relleno">
        <Select value={draft.relleno ?? ''} onChange={(e) => update({ relleno: e.target.value || null })}>
          <option value="" disabled>
            Elige un relleno
          </option>
          {rellenos.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Cobertura"
        hint={
          coberturaInfo.fija
            ? `Fija en ${COBERTURA_LABELS[coberturaInfo.fija]} por las opciones que elegiste antes.`
            : undefined
        }
      >
        {coberturaInfo.fija ? (
          <div className="rounded-md border border-border-subtle bg-card px-4 py-3 text-sm font-medium text-ink">
            {COBERTURA_LABELS[coberturaInfo.fija]}
          </div>
        ) : (
          <RadioCards
            options={coberturaInfo.opciones.map((c) => ({ value: c, label: COBERTURA_LABELS[c] }))}
            value={draft.cobertura}
            onChange={(cobertura) => update({ cobertura })}
          />
        )}
      </Field>
    </div>
  )
}
