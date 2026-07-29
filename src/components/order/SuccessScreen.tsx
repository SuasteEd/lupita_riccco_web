import { CheckCircle } from '@phosphor-icons/react'

export function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <CheckCircle size={56} weight="light" className="text-brand" />
      <h3 className="font-display text-2xl text-brand">Tu solicitud fue enviada</h3>
      <p className="max-w-sm text-ink-soft">
        Te contactaremos pronto por WhatsApp para confirmar tu pedido y el precio final. Si necesitas
        corregir algún dato, escríbenos directamente por ahí.
      </p>
      <a
        href="https://wa.me/5214152160729"
        target="_blank"
        rel="noreferrer"
        className="rounded-pill bg-brand px-6 py-3 text-sm font-semibold text-on-brand transition-transform duration-200 active:scale-[0.98]"
      >
        Escribir por WhatsApp
      </a>
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-medium text-ink-soft underline-offset-4 hover:underline"
      >
        Cerrar
      </button>
    </div>
  )
}
