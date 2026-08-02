import { LegalPageLayout, LegalSection } from './LegalPageLayout'

const WHATSAPP_URL = 'https://wa.me/5214152160729'

export default function TermsAndConditions() {
  return (
    <LegalPageLayout title="Términos y condiciones">
      <LegalSection number={1} title="Pedidos y confirmación">
        <p>
          La solicitud que envías a través de la página web es solo una solicitud de
          cotización — no garantiza disponibilidad ni aparta tu fecha. Un pedido se
          considera apartado únicamente cuando el negocio lo confirma por WhatsApp y
          recibimos el anticipo correspondiente.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Anticipo y forma de pago">
        <p>
          Para agendar cualquier pedido se requiere un anticipo del 50% del total
          acordado. El resto se liquida al momento de la entrega.
        </p>
        <p>Formas de pago que aceptamos:</p>
        <ul>
          <li>
            <span className="block">Transferencia bancaria:</span>
            <span className="block font-medium text-ink">BBVA</span>
            <span className="block font-medium text-ink">4815163068920126</span>
            <span className="block font-medium text-ink">María Guadalupe Rico Rivera</span>
          </li>
          <li>Efectivo en el local</li>
        </ul>
      </LegalSection>

      <LegalSection number={3} title="Política de cancelación">
        <p>
          El anticipo no es reembolsable bajo ninguna circunstancia. Si cancelas tu
          pedido después de haberlo pagado, ese monto se pierde — te recomendamos
          confirmar todos los detalles de tu pedido antes de realizar el pago.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Tamaños y formas disponibles">
        <p>
          Trabajamos únicamente con los tamaños y formas de nuestro catálogo. No
          hacemos excepciones ni tamaños personalizados fuera de los disponibles.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Imagen de referencia">
        <p>
          Las imágenes de referencia que nos compartes son solo eso: una guía de estilo
          y diseño. El resultado final puede variar según la disponibilidad de
          materiales, la técnica y el criterio artístico de la pastelera. Nos esforzamos
          por acercarnos lo más posible al diseño que nos pides.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Bases de madera">
        <p>
          Los pasteles que requieren base de madera para soporte estructural (pedidos de
          pisos para más de 60 personas) incluyen la base en préstamo. Esta base debe
          devolverse al momento de recibir el pedido — si no se devuelve, se cobra el
          costo de reposición.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Tiempos de entrega">
        <ul>
          <li>Pedidos estándar: mínimo 3 días hábiles de anticipación</li>
          <li>Pasteles de pisos: mínimo 5 días hábiles de anticipación</li>
        </ul>
        <p>
          Estos tiempos están sujetos a disponibilidad. La fecha de entrega se confirma
          al momento de agendar el pedido.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Precios">
        <p>
          El estimado que muestra la página web es referencial y no es una oferta
          formal. El precio final se confirma por WhatsApp antes de pedirte el anticipo.
          Lupita Riccco se reserva el derecho de ajustar el precio final según los
          detalles específicos de tu pedido.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Contacto">
        <p>
          Para cualquier duda sobre estos términos, escríbenos por WhatsApp:{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            wa.me/5214152160729
          </a>
          .
        </p>
        <p className="text-sm">Última actualización: 1 de agosto de 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  )
}
