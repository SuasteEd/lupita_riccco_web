const MAPS_SHARE_URL = 'https://maps.app.goo.gl/WfCoyDQP5CAxrKUMA'
const LAT = 21.0416102
const LNG = -100.6449629

export default function Mapa() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      {/*
        Tratamiento "postal": mat color crema fijo (--color-background, NO
        el token de superficie que cambia con el tema) — una postal física
        no cambia de color en modo oscuro, así que se toma como excepción
        deliberada al mismo patrón que --text-on-brand en tokens.css.
        Ligera rotación + sombra cálida para que se sienta como algo
        colocado sobre la mesa, no un mapa embebido más.
      */}
      <div className="-rotate-1 rounded-md bg-[var(--color-background)] p-3 shadow-[0_12px_28px_-8px_rgba(26,26,26,0.28)] ring-1 ring-black/5 transition-transform duration-300 ease-out hover:rotate-0 md:p-4">
        <div className="overflow-hidden rounded-sm">
          <iframe
            title="Ubicación de Lupita Riccco"
            src={`https://www.google.com/maps?q=loc:${LAT}+${LNG}&z=17&output=embed`}
            className="h-72 w-full md:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-1 text-center">
        <p className="font-medium text-ink">Lupita Riccco, Los Rodríguez</p>
        <a
          href={MAPS_SHARE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
        >
          Cómo llegar
        </a>
      </div>
    </div>
  )
}
