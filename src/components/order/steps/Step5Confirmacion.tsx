import {
  COBERTURA_LABELS,
  EMPAQUE_ACETATO,
  EMPAQUE_BASE,
  FORMAS,
  personasDeTamano,
} from '../../../config/cakeRules'
import type { OrderDraft } from '../../../types/order'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border-subtle py-2.5 text-sm last:border-b-0">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}

export function Step5Confirmacion({ draft }: { draft: OrderDraft }) {
  if (!draft.forma || !draft.tamano || !draft.cobertura) return null

  const personas = personasDeTamano(draft.tamano)
  const formaLabel = FORMAS.find((f) => f.value === draft.forma)?.label ?? draft.forma
  const tamanoLabel =
    draft.tamano === 'mini'
      ? 'Mini'
      : draft.tamano === '+100'
        ? 'Más de 100 personas'
        : `${personas} personas`
  const empaqueLabel = draft.empaqueTipo === 'caja_acetato' ? EMPAQUE_ACETATO.nombre : EMPAQUE_BASE.nombre

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-lg text-brand">Tu pastel</h3>
        <div className="mt-1">
          <Row label="Forma" value={formaLabel} />
          <Row label="Tamaño" value={tamanoLabel} />
          {draft.esPisos && <Row label="Pisos" value="Sí" />}
          {draft.esTresLeches && <Row label="3 leches" value="Sí" />}
          <Row label="Sabor" value={draft.sabor ?? ''} />
          <Row label="Relleno" value={draft.relleno ?? ''} />
          <Row label="Cobertura" value={COBERTURA_LABELS[draft.cobertura]} />
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-brand">Empaque y extras</h3>
        <div className="mt-1">
          <Row label="Empaque" value={empaqueLabel} />
          {draft.extras.length > 0 && (
            <Row label="Extras" value={draft.extras.map((e) => e.descripcion).join(', ')} />
          )}
          {draft.imagenReferencia && (
            <div className="flex items-center justify-between gap-4 border-b border-border-subtle py-2.5 text-sm last:border-b-0">
              <span className="text-ink-soft">Imagen de referencia</span>
              <img
                src={draft.imagenReferencia}
                alt="Vista previa de referencia"
                className="h-10 w-10 rounded-sm object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-brand">Contacto y entrega</h3>
        <div className="mt-1">
          <Row label="Nombre" value={draft.nombre} />
          <Row label="WhatsApp" value={draft.telefono} />
          <Row label="Dirección" value={draft.direccion} />
          {draft.email && <Row label="Correo" value={draft.email} />}
          <Row label="Fecha de entrega" value={draft.fechaEntrega} />
          {draft.comentarios && <Row label="Comentarios" value={draft.comentarios} />}
        </div>
      </div>

      <p className="text-sm text-ink-soft">
        Esto es una solicitud de cotización, no un pedido pagado. Te contactaremos por WhatsApp para
        confirmar disponibilidad y precio final.
      </p>
    </div>
  )
}
