import {
  FORMAS,
  TAMANOS_POR_FORMA,
  isPisosDisponible,
  isTresLechesDisponible,
  personasDeTamano,
  type Forma,
} from '../../../config/cakeRules'
import type { OrderDraft } from '../../../types/order'
import { ChipGroup, Field, Select, Toggle } from '../fields'

export function Step1FormaTamano({
  draft,
  update,
}: {
  draft: OrderDraft
  update: (patch: Partial<OrderDraft>) => void
}) {
  const tamanos = draft.forma ? TAMANOS_POR_FORMA[draft.forma] : []
  const personas = draft.tamano ? personasDeTamano(draft.tamano) : null
  const pisosDisponible = draft.forma !== null && personas !== null && isPisosDisponible(draft.forma, personas)
  const tresLechesDisponible =
    draft.forma !== null &&
    personas !== null &&
    isTresLechesDisponible(draft.forma, personas, draft.esPisos)

  return (
    <div className="flex flex-col gap-6">
      <Field label="Forma del pastel">
        <ChipGroup
          options={FORMAS.map((f) => f.value)}
          value={draft.forma}
          onChange={(forma: Forma) => update({ forma })}
          getLabel={(v) => FORMAS.find((f) => f.value === v)?.label ?? v}
        />
      </Field>

      {draft.forma && (
        <Field label="Tamaño">
          <Select
            value={draft.tamano ?? ''}
            onChange={(e) => update({ tamano: e.target.value || null })}
          >
            <option value="" disabled>
              Elige un tamaño
            </option>
            {tamanos.map((t) => (
              <option key={t} value={t}>
                {t === 'mini' ? 'Mini' : t === '+100' ? 'Más de 100 personas' : `${t} personas`}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {draft.tamano && pisosDisponible && (
        <Toggle
          label="Pastel de pisos"
          description="Disponible porque es para más de 20 personas. La cobertura queda fija en buttercream, la única que soporta la estructura."
          checked={draft.esPisos}
          onChange={(esPisos) => update({ esPisos })}
        />
      )}

      {draft.tamano && tresLechesDisponible && (
        <Toggle
          label="3 leches"
          description="La cobertura queda fija en chantilly."
          checked={draft.esTresLeches}
          onChange={(esTresLeches) => update({ esTresLeches })}
        />
      )}
    </div>
  )
}
