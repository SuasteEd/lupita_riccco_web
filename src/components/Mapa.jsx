const MAPS_SHARE_URL = 'https://maps.app.goo.gl/WfCoyDQP5CAxrKUMA'
const LAT = 21.0416102
const LNG = -100.6449629

export default function Mapa() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-md border border-border-subtle">
        <iframe
          title="Ubicación de Lupita Riccco"
          src={`https://www.google.com/maps?q=loc:${LAT}+${LNG}&z=17&output=embed`}
          className="h-72 w-full md:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 text-center">
        <p className="font-medium text-ink">Lupita Riccco, Los Rodríguez</p>
        {/* TODO: reemplazar por la dirección completa (calle, colonia, CP) cuando la confirmes */}
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
