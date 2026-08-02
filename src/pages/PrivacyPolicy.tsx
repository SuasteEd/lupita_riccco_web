import { LegalPageLayout, LegalSection } from './LegalPageLayout'

const WHATSAPP_URL = 'https://wa.me/5214152160729'

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Política de privacidad">
      <LegalSection number={1} title="Responsable de los datos">
        <p>
          <strong>María Guadalupe Rico Rivera</strong>, bajo el nombre comercial{' '}
          <strong>Lupita Riccco</strong>, cafetería y repostería artesanal ubicada en Los
          Rodríguez, Guanajuato, México, es responsable de los datos personales que nos
          compartes a través de este sitio. Puedes contactarnos por WhatsApp en{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            wa.me/5214152160729
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection number={2} title="Datos que recolectamos">
        <p>Cuando llenas el formulario de pedido personalizado, te pedimos:</p>
        <ul>
          <li>Nombre completo</li>
          <li>Número de teléfono (WhatsApp)</li>
          <li>Dirección, si tu pedido requiere entrega</li>
          <li>Correo electrónico (opcional)</li>
          <li>Imagen de referencia del diseño que quieres (opcional)</li>
          <li>Detalles del pedido: tipo de pastel, sabor, fecha de entrega, etc.</li>
        </ul>
      </LegalSection>

      <LegalSection number={3} title="Para qué usamos tus datos">
        <p>Usamos tu información únicamente para:</p>
        <ul>
          <li>Gestionar y confirmar tu pedido personalizado</li>
          <li>Contactarte por WhatsApp para confirmar disponibilidad y precio final</li>
          <li>Coordinar la entrega o recolección de tu pedido</li>
        </ul>
        <p>
          <strong>No usamos tus datos para publicidad ni los compartimos con terceros.</strong>
        </p>
      </LegalSection>

      <LegalSection number={4} title="Cómo almacenamos tus datos">
        <p>
          Tu información se guarda de forma segura en Firebase (Google Cloud). Solo el
          personal autorizado de Lupita Riccco tiene acceso a ella.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Cookies y analítica">
        <p>
          Este sitio usa Firebase Analytics para medir el tráfico de forma anónima —
          páginas visitadas, tiempo de sesión — sin recolectar datos personales a través
          de cookies. Puedes desactivar las cookies desde tu navegador cuando quieras.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Tus derechos sobre tus datos (derechos ARCO)">
        <p>
          Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos
          personales (derechos ARCO). Para ejercer cualquiera de estos derechos,
          escríbenos por WhatsApp:{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            wa.me/5214152160729
          </a>
          . Te respondemos en un plazo máximo de 20 días hábiles.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Cambios a esta política">
        <p>
          Podemos actualizar esta política de vez en cuando. La versión vigente siempre
          va a estar disponible en{' '}
          <a href="/privacidad">lupitariccco.com/privacidad</a>.
        </p>
        <p className="text-sm">Última actualización: 1 de agosto de 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  )
}
