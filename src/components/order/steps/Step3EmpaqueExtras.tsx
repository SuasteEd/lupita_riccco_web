import { useRef, useState } from 'react'
import { ArrowClockwise, Image, X } from '@phosphor-icons/react'
import { EMPAQUE_BASE, getEmpaquesDisponibles, personasDeTamano } from '../../../config/cakeRules'
import type { ExtraConfig } from '../../../config/cakeRules'
import { useBusinessRules } from '../../../context/BusinessRulesContext'
import { uploadReferenceImage, validateReferenceImage } from '../../../lib/cloudinaryUpload'
import type { OrderDraft } from '../../../types/order'
import { Field, RadioCards } from '../fields'

/** Texto de precio de un extra según su combinación de esRango/sumaAlEstimado — nunca
 *  se muestra un monto si sumaAlEstimado es false (el precio se confirma después). */
function precioTexto(extra: ExtraConfig): string {
  if (!extra.sumaAlEstimado) return 'precio se confirma al aprobar el pedido'
  if (extra.esRango) return `desde $${extra.precioBase}`
  return `$${extra.precioFijo}`
}

export function Step3EmpaqueExtras({
  draft,
  update,
}: {
  draft: OrderDraft
  update: (patch: Partial<OrderDraft>) => void
}) {
  const config = useBusinessRules()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!draft.tamano) return null
  const personas = personasDeTamano(config, draft.tamano)
  const empaques = getEmpaquesDisponibles(config, personas)

  function toggleExtra(tipo: string) {
    const exists = draft.extras.some((e) => e.tipo === tipo)
    update({
      extras: exists ? draft.extras.filter((e) => e.tipo !== tipo) : [...draft.extras, { tipo }],
    })
  }

  function setCantidad(tipo: string, cantidad: number) {
    if (cantidad <= 0) {
      update({ extras: draft.extras.filter((e) => e.tipo !== tipo) })
      return
    }
    const exists = draft.extras.some((e) => e.tipo === tipo)
    update({
      extras: exists
        ? draft.extras.map((e) => (e.tipo === tipo ? { ...e, cantidad } : e))
        : [...draft.extras, { tipo, cantidad }],
    })
  }

  async function doUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadReferenceImage(file)
      update({ imagenReferencia: url })
    } catch (err) {
      // Opcional a propósito: si falla, el resto del formulario sigue
      // intacto y el cliente puede reintentar o simplemente continuar
      // sin imagen (imagenReferencia se queda en null).
      setUploadError(err instanceof Error ? err.message : 'No pudimos subir la imagen.')
    } finally {
      setUploading(false)
    }
  }

  function handleFile(file: File | null) {
    if (!file) {
      setSelectedFile(null)
      setUploadError(null)
      update({ imagenReferencia: null })
      return
    }
    const error = validateReferenceImage(file)
    if (error) {
      setUploadError(error)
      return
    }
    setSelectedFile(file)
    void doUpload(file)
  }

  function handleRemove() {
    setSelectedFile(null)
    setUploadError(null)
    update({ imagenReferencia: null })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Field label="Empaque">
          <RadioCards
            options={empaques.map((e) => ({ value: e.tipo, label: e.nombre, description: e.descripcion }))}
            value={draft.empaqueTipo}
            onChange={(empaqueTipo) => update({ empaqueTipo })}
          />
        </Field>
        <p className="mt-2 text-xs text-ink-soft">
          {EMPAQUE_BASE.nombre}: {EMPAQUE_BASE.descripcion}
        </p>
      </div>

      <Field label="Extras (opcional)">
        <div className="flex flex-col gap-2">
          {config.extras.map((extra) => {
            const selected = draft.extras.find((e) => e.tipo === extra.tipo)

            if (extra.esPorPieza) {
              return (
                <div
                  key={extra.tipo}
                  className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3 transition-colors duration-200 ${
                    selected ? 'border-brand bg-card-strong' : 'border-border-subtle bg-canvas'
                  }`}
                >
                  <div>
                    <p className="text-sm text-ink">{extra.label}</p>
                    <p className="text-xs text-ink-soft">${extra.precioPorPieza}/pieza</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={selected?.cantidad ?? 0}
                    onChange={(e) => setCantidad(extra.tipo, Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                    aria-label={`Cantidad de ${extra.label}`}
                    className="w-16 rounded-sm border border-border-subtle bg-canvas px-2 py-1 text-right text-sm text-ink"
                  />
                </div>
              )
            }

            const checked = Boolean(selected)
            return (
              <label
                key={extra.tipo}
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors duration-200 ${
                  checked ? 'border-brand bg-card-strong' : 'border-border-subtle bg-canvas'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleExtra(extra.tipo)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                <span className="text-sm text-ink">
                  {extra.label} — <span className="text-ink-soft">{precioTexto(extra)}</span>
                </span>
              </label>
            )
          })}
        </div>
      </Field>

      <Field
        label="Imagen de referencia (opcional)"
        error={uploadError ?? undefined}
        hint={!uploadError ? 'JPG, PNG o WEBP, máximo 10 MB. Es opcional, puedes continuar sin ella.' : undefined}
      >
        {draft.imagenReferencia ? (
          <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-card px-3 py-3">
            <img
              src={draft.imagenReferencia}
              alt="Vista previa de referencia"
              className="h-14 w-14 flex-shrink-0 rounded-sm object-cover"
            />
            <span className="flex-1 truncate text-sm text-ink">
              {selectedFile?.name ?? 'Imagen subida'}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Quitar imagen"
              className="flex-shrink-0 text-ink-soft hover:text-danger"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        ) : uploading ? (
          <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-border-subtle px-4 py-6 text-sm font-medium text-ink-soft">
            Subiendo imagen...
          </div>
        ) : uploadError ? (
          <button
            type="button"
            onClick={() => selectedFile && void doUpload(selectedFile)}
            className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-danger px-4 py-6 text-sm font-medium text-danger transition-colors duration-200 hover:bg-card"
          >
            <ArrowClockwise size={20} weight="light" />
            Reintentar subida
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-border-subtle px-4 py-6 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-brand hover:text-brand"
          >
            <Image size={20} weight="light" />
            Adjuntar foto de inspiración
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </Field>
    </div>
  )
}
