import { useRef, useState } from 'react'
import { ArrowClockwise, Image, X } from '@phosphor-icons/react'
import { EMPAQUE_BASE, EXTRAS_DISPONIBLES, getEmpaquesDisponibles, personasDeTamano } from '../../../config/cakeRules'
import type { ExtraOpcion } from '../../../config/cakeRules'
import { uploadReferenceImage, validateReferenceImage } from '../../../lib/cloudinaryUpload'
import type { OrderDraft } from '../../../types/order'
import { Field, RadioCards } from '../fields'

export function Step3EmpaqueExtras({
  draft,
  update,
}: {
  draft: OrderDraft
  update: (patch: Partial<OrderDraft>) => void
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!draft.tamano) return null
  const personas = personasDeTamano(draft.tamano)
  const empaques = getEmpaquesDisponibles(personas)

  function toggleExtra(extra: ExtraOpcion) {
    const exists = draft.extras.some((e) => e.tipo === extra.tipo)
    update({
      extras: exists ? draft.extras.filter((e) => e.tipo !== extra.tipo) : [...draft.extras, extra],
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
          {EXTRAS_DISPONIBLES.map((extra) => {
            const checked = draft.extras.some((e) => e.tipo === extra.tipo)
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
                  onChange={() => toggleExtra(extra)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                <span className="text-sm text-ink">{extra.descripcion}</span>
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
