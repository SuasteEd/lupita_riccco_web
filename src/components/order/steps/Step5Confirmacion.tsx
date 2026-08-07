import { useMemo } from 'react'
import {
  COBERTURA_LABELS,
  EMPAQUE_ACETATO,
  EMPAQUE_BASE,
  FORMAS,
  personasDeTamano,
} from '../../../config/cakeRules'
import type { CakePricesDocument } from '../../../config/cakePrices'
import { calculateEstimate } from '../../../config/pricing'
import { useBusinessRules } from '../../../context/BusinessRulesContext'
import type { OrderDraft } from '../../../types/order'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border-subtle py-2.5 text-sm last:border-b-0">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}

export function Step5Confirmacion({
  draft,
  pricesDoc,
  termsAccepted,
  onTermsAcceptedChange,
}: {
  draft: OrderDraft
  pricesDoc: CakePricesDocument | null
  termsAccepted: boolean
  onTermsAcceptedChange: (accepted: boolean) => void
}) {
  const config = useBusinessRules()
  const estimate = useMemo(() => calculateEstimate(draft, config, pricesDoc), [draft, config, pricesDoc])

  if (!draft.forma || !draft.tamano || !draft.cobertura) return null

  const personas = personasDeTamano(config, draft.tamano)
  const formaLabel = FORMAS.find((f) => f.value === draft.forma)?.label ?? draft.forma
  const tamanoLabel =
    draft.tamano === 'mini'
      ? 'Mini'
      : draft.tamano === '+100'
        ? 'Más de 100 personas'
        : `${personas} personas`
  const empaqueLabel = draft.empaqueTipo === 'caja_acetato' ? EMPAQUE_ACETATO.nombre : EMPAQUE_BASE.nombre
  const extrasLabels = draft.extras
    .map((selected) => {
      const extra = config.extras.find((e) => e.tipo === selected.tipo)
      if (!extra) return null
      return selected.cantidad ? `${extra.label} x${selected.cantidad}` : extra.label
    })
    .filter((label): label is string => label !== null)

  // Requiere estructura media/grande de soporte (no la estándar) — es cuando
  // se presta una base de madera que hay que devolver en la entrega.
  const requiereBaseDeMadera = draft.esPisos && personas > config.umbrales.pisosEstructuraEstandarMax

  return (
    <div className="flex flex-col gap-6">
      {estimate.requiresCotizacion ? (
        <div className="rounded-md border border-border-subtle bg-card px-4 py-4">
          <p className="text-sm font-medium text-ink">Este pedido requiere cotización personalizada.</p>
          {estimate.cotizacionReason && (
            <p className="mt-1 text-sm text-ink-soft">{estimate.cotizacionReason}</p>
          )}
          <p className="mt-3 text-sm text-ink-soft">
            Guarda tu solicitud y te llevamos directo a WhatsApp para afinar los detalles y recibir tu precio.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border-subtle bg-card-strong px-4 py-4">
          <p className="text-sm text-ink-soft">Estimado desde</p>
          <p className="font-display text-2xl text-brand">${estimate.total} MXN</p>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-ink">Ver desglose</summary>
            <div className="mt-2">
              <Row label={`Pastel base (${personas} personas)`} value={`$${estimate.base}`} />
              {estimate.estructuraPisos !== null && (
                <Row label="Estructura de soporte" value={`+$${estimate.estructuraPisos}`} />
              )}
              {estimate.empaque > 0 && <Row label="Caja de acetato" value={`+$${estimate.empaque}`} />}
              {estimate.extras.map((e) => (
                <Row key={e.tipo} label={e.label} value={`+$${e.monto}`} />
              ))}
              {estimate.incluyeFondant && <Row label="Fondant" value="incluido (se confirma al aprobar)" />}
            </div>
          </details>

          <p className="mt-3 text-xs text-ink-soft">{config.avisos.precioEstimado}</p>
          {requiereBaseDeMadera && (
            <p className="mt-2 rounded-sm bg-canvas px-3 py-2 text-xs text-ink">
              {config.avisos.baseMaderaDevolucion}
            </p>
          )}
        </div>
      )}

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
          {extrasLabels.length > 0 && <Row label="Extras" value={extrasLabels.join(', ')} />}
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

      {/* Se muestra en ambos caminos: con precio o cotización por WhatsApp,
          el pedido siempre se guarda como web_order_request. */}
      <label className="flex items-start gap-3 rounded-md border border-border-subtle bg-canvas px-4 py-3">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsAcceptedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[var(--color-primary)]"
        />
        <span className="text-sm text-ink">
          He leído y acepto los{' '}
          <a
            href="/terminos"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand underline underline-offset-4"
          >
            Términos y condiciones
          </a>{' '}
          y la{' '}
          <a
            href="/privacidad"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand underline underline-offset-4"
          >
            Política de privacidad
          </a>
          .
        </span>
      </label>
    </div>
  )
}
