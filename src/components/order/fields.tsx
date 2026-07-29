import type { ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'

const inputBase =
  'w-full rounded-sm border bg-canvas px-3.5 py-2.5 text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 transition-colors duration-200'

function inputClass(error?: string) {
  return `${inputBase} ${error ? 'border-danger focus:ring-danger/20' : 'border-border-subtle focus:border-brand focus:ring-brand/20'}`
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string },
) {
  const { error, className, ...rest } = props
  return <input className={`${inputClass(error)} ${className ?? ''}`} {...rest} />
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string },
) {
  const { error, className, ...rest } = props
  return <textarea className={`${inputClass(error)} resize-none ${className ?? ''}`} {...rest} />
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string },
) {
  const { error, className, children, ...rest } = props
  return (
    <div className="relative">
      {/* appearance-none + flecha propia: la nativa del navegador queda
          pegada al borde sin aire, sin importar el padding del <select>. */}
      <select
        className={`${inputClass(error)} appearance-none pr-10 ${className ?? ''}`}
        {...rest}
      >
        {children}
      </select>
      <CaretDownIcon
        size={16}
        weight="bold"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
      />
    </div>
  )
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  getLabel = (v) => v,
}: {
  options: T[]
  value: T | null
  onChange: (v: T) => void
  getLabel?: (v: T) => string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={`rounded-pill border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              active
                ? 'border-brand bg-brand text-on-brand'
                : 'border-border-subtle bg-canvas text-ink hover:border-brand'
            }`}
          >
            {getLabel(opt)}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3 rounded-md border px-4 py-3.5 text-left transition-colors duration-200 ${
        checked ? 'border-brand bg-card-strong' : 'border-border-subtle bg-canvas'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        className={`mt-0.5 flex h-5 w-9 flex-shrink-0 items-center rounded-pill border transition-colors duration-200 ${
          checked ? 'border-brand bg-brand justify-end' : 'border-border-subtle bg-canvas justify-start'
        }`}
      >
        <span className="mx-0.5 h-3.5 w-3.5 rounded-pill bg-canvas" />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-soft">{description}</span>}
      </span>
    </button>
  )
}

export function RadioCards<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description?: string }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex flex-col items-start gap-0.5 rounded-md border px-4 py-3 text-left transition-colors duration-200 ${
              active ? 'border-brand bg-card-strong' : 'border-border-subtle bg-canvas hover:border-brand'
            }`}
          >
            <span className="text-sm font-medium text-ink">{opt.label}</span>
            {opt.description && <span className="text-xs text-ink-soft">{opt.description}</span>}
          </button>
        )
      })}
    </div>
  )
}
