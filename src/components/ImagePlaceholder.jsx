/*
  No hay generador de imágenes disponible en este entorno y el estilo de
  marca pedido es ilustración de línea a mano (como la portada de WhatsApp),
  no fotografía de stock — así que en vez de fingir con divs o fotos que no
  encajan con la marca, este placeholder queda honestamente marcado.
  Reemplázalo por la ilustración o foto real indicada en cada `note`.
*/
export default function ImagePlaceholder({ Icon, note, className = '', iconSize = 56 }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border-subtle bg-card p-8 text-center ${className}`}
    >
      <Icon size={iconSize} weight="light" className="text-brand" />
      <p className="text-xs text-ink-soft">{note}</p>
    </div>
  )
}
