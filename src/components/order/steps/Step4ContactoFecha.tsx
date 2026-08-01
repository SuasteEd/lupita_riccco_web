import { fechaMinimaEntrega, formatFechaMinima } from '../../../config/cakeRules'
import { useBusinessRules } from '../../../context/BusinessRulesContext'
import { toDateInputValue } from '../../../lib/date'
import { isValidPhone, PHONE_COUNTRIES, type PhoneCountry } from '../../../lib/phone'
import type { OrderDraft } from '../../../types/order'
import { Field, Select, Textarea, TextInput } from '../fields'

export function Step4ContactoFecha({
  draft,
  update,
  showErrors,
}: {
  draft: OrderDraft
  update: (patch: Partial<OrderDraft>) => void
  showErrors: boolean
}) {
  const config = useBusinessRules()
  const minDateValue = toDateInputValue(fechaMinimaEntrega(config, draft.esPisos))

  const nombreError = showErrors && !draft.nombre.trim() ? 'Escribe tu nombre.' : undefined
  const direccionError = showErrors && !draft.direccion.trim() ? 'Escribe tu dirección.' : undefined
  const telefonoError =
    showErrors && !isValidPhone(draft.telefono, draft.telefonoPais)
      ? 'Escribe un número de WhatsApp válido a 10 dígitos.'
      : undefined
  const fechaError =
    showErrors && (!draft.fechaEntrega || draft.fechaEntrega < minDateValue)
      ? `Elige una fecha a partir del ${formatFechaMinima(config, draft.esPisos)}.`
      : undefined
  const emailError =
    showErrors && draft.email.trim() && !/^\S+@\S+\.\S+$/.test(draft.email.trim())
      ? 'Ese correo no se ve válido.'
      : undefined

  return (
    <div className="flex flex-col gap-5">
      <Field label="Nombre" htmlFor="nombre" error={nombreError}>
        <TextInput
          id="nombre"
          value={draft.nombre}
          onChange={(e) => update({ nombre: e.target.value })}
          error={nombreError}
          placeholder="Tu nombre"
        />
      </Field>

      <Field
        label="WhatsApp"
        htmlFor="telefono"
        error={telefonoError}
        hint={!telefonoError ? 'A 10 dígitos, te contactaremos por aquí para confirmar.' : undefined}
      >
        <div className="flex gap-2">
          <Select
            aria-label="País del número"
            value={draft.telefonoPais}
            onChange={(e) => update({ telefonoPais: e.target.value as PhoneCountry })}
            className="w-[6.5rem] flex-shrink-0"
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.dialCode} {c.value}
              </option>
            ))}
          </Select>
          <TextInput
            id="telefono"
            type="tel"
            value={draft.telefono}
            onChange={(e) => update({ telefono: e.target.value })}
            error={telefonoError}
            placeholder="4151234567"
            className="flex-1"
          />
        </div>
      </Field>

      <Field
        label="Dirección"
        htmlFor="direccion"
        error={direccionError}
        hint={!direccionError ? 'Calle, número y colonia, para la entrega.' : undefined}
      >
        <TextInput
          id="direccion"
          value={draft.direccion}
          onChange={(e) => update({ direccion: e.target.value })}
          error={direccionError}
          placeholder="Calle, número, colonia"
        />
      </Field>

      <Field label="Correo (opcional)" htmlFor="email" error={emailError}>
        <TextInput
          id="email"
          type="email"
          value={draft.email}
          onChange={(e) => update({ email: e.target.value })}
          error={emailError}
          placeholder="tucorreo@ejemplo.com"
        />
      </Field>

      <Field
        label="Fecha de entrega"
        htmlFor="fecha"
        error={fechaError}
        hint={
          !fechaError
            ? `Con al menos ${draft.esPisos ? config.leadTimeDiasPisos : config.leadTimeDias} días de anticipación.`
            : undefined
        }
      >
        <TextInput
          id="fecha"
          type="date"
          min={minDateValue}
          value={draft.fechaEntrega}
          onChange={(e) => update({ fechaEntrega: e.target.value })}
          error={fechaError}
        />
      </Field>

      <Field label="Comentarios (opcional)" htmlFor="comentarios">
        <Textarea
          id="comentarios"
          rows={3}
          value={draft.comentarios}
          onChange={(e) => update({ comentarios: e.target.value })}
          placeholder="Alguna referencia, alergias, colores..."
        />
      </Field>
    </div>
  )
}
