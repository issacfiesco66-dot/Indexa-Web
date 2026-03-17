import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Términos de Servicio — INDEXA",
  description: "Términos y condiciones de uso de la plataforma INDEXA.",
};

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-indexa-blue sm:text-4xl">
          Términos de Servicio
        </h1>
        <p className="mt-2 text-sm text-gray-400">Última actualización: 17 de marzo de 2026</p>

        <div className="prose prose-gray mt-10 max-w-none text-gray-600 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-indexa-gray-dark [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-indexa-gray-dark [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed">
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar la plataforma INDEXA (en adelante &quot;la Plataforma&quot;, &quot;el Servicio&quot; o &quot;INDEXA&quot;),
            aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguno de estos términos,
            no deberás utilizar la Plataforma.
          </p>

          <h2>2. Descripción del Servicio</h2>
          <p>INDEXA es una plataforma de presencia digital que ofrece:</p>
          <ul>
            <li>Creación y alojamiento de sitios web profesionales para negocios</li>
            <li>Panel de gestión para personalizar contenido, logo y datos de contacto</li>
            <li>Herramientas de marketing digital y automatización</li>
            <li>Integración con sistemas de chatbots para gestión web</li>
            <li>Analítica de visitas y métricas de rendimiento</li>
            <li>Procesamiento de pagos mediante planes de suscripción</li>
          </ul>

          <h2>3. Registro y Cuenta de Usuario</h2>
          <ul>
            <li>Debes proporcionar información veraz y actualizada al crear tu cuenta</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso</li>
            <li>Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
            <li>No puedes transferir tu cuenta a terceros sin autorización previa</li>
            <li>Debes ser mayor de 18 años para registrarte</li>
          </ul>

          <h2>4. Planes y Pagos</h2>
          <ul>
            <li>Los precios de los planes se muestran en pesos mexicanos (MXN) e incluyen IVA</li>
            <li>Los pagos se procesan de forma segura a través de Stripe</li>
            <li>Las suscripciones se renuevan automáticamente según el período contratado</li>
            <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de control</li>
            <li>No se realizan reembolsos por períodos parciales ya facturados</li>
            <li>INDEXA se reserva el derecho de modificar precios con aviso previo de 30 días</li>
          </ul>

          <h2>5. Uso Aceptable</h2>
          <p>Al utilizar INDEXA, te comprometes a NO:</p>
          <ul>
            <li>Publicar contenido ilegal, difamatorio, obsceno o que viole derechos de terceros</li>
            <li>Utilizar la plataforma para actividades fraudulentas o de spam</li>
            <li>Intentar acceder a cuentas o datos de otros usuarios</li>
            <li>Realizar ingeniería inversa o intentar vulnerar la seguridad de la plataforma</li>
            <li>Utilizar bots o scripts automatizados no autorizados</li>
            <li>Sobrecargar intencionalmente los servidores o infraestructura</li>
          </ul>

          <h2>6. Propiedad Intelectual</h2>
          <ul>
            <li>El contenido que subas a tu sitio web (textos, imágenes, logos) sigue siendo de tu propiedad</li>
            <li>INDEXA retiene la propiedad sobre la plataforma, código fuente, diseño y tecnología</li>
            <li>Las plantillas y herramientas proporcionadas son licenciadas, no vendidas</li>
            <li>Al subir contenido, nos otorgas licencia para mostrarlo en tu sitio web público</li>
          </ul>

          <h2>7. Sitios Web Generados</h2>
          <ul>
            <li>Los sitios web creados a través de INDEXA se alojan en nuestra infraestructura</li>
            <li>El sitio web estará disponible mientras tu suscripción esté activa</li>
            <li>Las demos generadas son de carácter temporal y pueden ser eliminadas sin previo aviso</li>
            <li>INDEXA incluirá un crédito &quot;Creado por INDEXA&quot; en los sitios web generados</li>
          </ul>

          <h2>8. Limitación de Responsabilidad</h2>
          <p>
            INDEXA no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten
            del uso o imposibilidad de uso de la Plataforma. Nuestra responsabilidad total no excederá el monto
            pagado por el usuario en los últimos 12 meses.
          </p>

          <h2>9. Disponibilidad del Servicio</h2>
          <p>
            Nos esforzamos por mantener la Plataforma disponible 24/7, pero no garantizamos un tiempo de
            actividad del 100%. Podremos realizar mantenimientos programados con aviso previo.
          </p>

          <h2>10. Terminación</h2>
          <ul>
            <li>Puedes cancelar tu cuenta en cualquier momento</li>
            <li>INDEXA puede suspender o cancelar cuentas que violen estos términos</li>
            <li>Al cancelar, tus datos serán eliminados en un plazo de 30 días</li>
          </ul>

          <h2>11. Privacidad</h2>
          <p>
            El tratamiento de tus datos personales se rige por nuestro{" "}
            <Link href="/privacidad" className="text-indexa-blue hover:underline">Aviso de Privacidad</Link>.
            Al utilizar la Plataforma, aceptas dicho aviso.
          </p>

          <h2>12. Legislación Aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia
            será resuelta ante los tribunales competentes de la Ciudad de México.
          </p>

          <h2>13. Modificaciones</h2>
          <p>
            INDEXA se reserva el derecho de modificar estos términos. Los cambios entrarán en vigor al ser
            publicados en esta página. El uso continuado de la Plataforma constituye la aceptación de los
            términos modificados.
          </p>

          <h2>14. Contacto</h2>
          <p>
            Para consultas sobre estos términos:{" "}
            <a href="mailto:legal@indexa.com.mx" className="text-indexa-blue hover:underline">legal@indexa.com.mx</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
