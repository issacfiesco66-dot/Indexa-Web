import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Aviso de Privacidad — INDEXA",
  description: "Aviso de privacidad de INDEXA. Conoce cómo recopilamos, usamos y protegemos tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-indexa-blue sm:text-4xl">
          Aviso de Privacidad
        </h1>
        <p className="mt-2 text-sm text-gray-400">Última actualización: 17 de marzo de 2026</p>

        <div className="prose prose-gray mt-10 max-w-none text-gray-600 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-indexa-gray-dark [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-indexa-gray-dark [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed">
          <h2>1. Identidad del Responsable</h2>
          <p>
            <strong>INDEXA</strong> (en adelante &quot;INDEXA&quot;, &quot;nosotros&quot; o &quot;la Plataforma&quot;), con domicilio en México,
            es responsable del tratamiento de los datos personales que nos proporciones, de conformidad con la
            Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
          </p>

          <h2>2. Datos Personales que Recopilamos</h2>
          <p>Podemos recopilar los siguientes datos personales:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono / WhatsApp</li>
            <li>Nombre del negocio</li>
            <li>Dirección del negocio</li>
            <li>Información de facturación y pago (procesada por Stripe, no almacenamos datos de tarjetas)</li>
            <li>Datos de navegación y uso de la plataforma (cookies, dirección IP, tipo de dispositivo)</li>
          </ul>

          <h2>3. Finalidades del Tratamiento</h2>
          <h3>Finalidades primarias (necesarias):</h3>
          <ul>
            <li>Crear y administrar tu cuenta de usuario</li>
            <li>Proveer los servicios de creación de sitios web y presencia digital</li>
            <li>Procesar pagos y facturación</li>
            <li>Comunicarnos contigo respecto a tu cuenta y servicios contratados</li>
            <li>Atender solicitudes de soporte técnico</li>
          </ul>
          <h3>Finalidades secundarias (opcionales):</h3>
          <ul>
            <li>Enviar comunicaciones de marketing y promociones</li>
            <li>Realizar encuestas de satisfacción</li>
            <li>Mejorar nuestros productos y servicios mediante análisis estadístico</li>
          </ul>
          <p>
            Si no deseas que tus datos sean tratados para finalidades secundarias, puedes enviarnos un correo a{" "}
            <a href="mailto:privacidad@indexa.com.mx" className="text-indexa-blue hover:underline">privacidad@indexa.com.mx</a>.
          </p>

          <h2>4. Transferencia de Datos</h2>
          <p>Tus datos personales pueden ser transferidos a:</p>
          <ul>
            <li><strong>Firebase (Google Cloud)</strong> — Para autenticación y almacenamiento de datos</li>
            <li><strong>Stripe</strong> — Para el procesamiento seguro de pagos</li>
            <li><strong>Resend</strong> — Para el envío de correos electrónicos transaccionales</li>
            <li><strong>Vercel</strong> — Para el alojamiento de la plataforma</li>
          </ul>
          <p>
            Estas transferencias se realizan conforme a lo establecido en la LFPDPPP y con proveedores que cumplen
            con estándares de seguridad adecuados.
          </p>

          <h2>5. Derechos ARCO</h2>
          <p>
            Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos personales
            (derechos ARCO). Para ejercer estos derechos, envía un correo a{" "}
            <a href="mailto:privacidad@indexa.com.mx" className="text-indexa-blue hover:underline">privacidad@indexa.com.mx</a>{" "}
            con la siguiente información:
          </p>
          <ul>
            <li>Nombre completo y correo electrónico asociado a tu cuenta</li>
            <li>Descripción clara del derecho que deseas ejercer</li>
            <li>Documento que acredite tu identidad (copia de INE o pasaporte)</li>
          </ul>
          <p>Responderemos tu solicitud en un plazo máximo de 20 días hábiles.</p>

          <h2>6. Uso de Cookies y Tecnologías de Rastreo</h2>
          <p>
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia en la plataforma.
            Para más información, consulta nuestra{" "}
            <Link href="/cookies" className="text-indexa-blue hover:underline">Política de Cookies</Link>.
          </p>

          <h2>7. Medidas de Seguridad</h2>
          <p>
            Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger tus datos personales
            contra daño, pérdida, alteración, destrucción o uso no autorizado, incluyendo:
          </p>
          <ul>
            <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
            <li>Autenticación segura mediante Firebase Authentication</li>
            <li>Reglas de seguridad en Firestore para control de acceso granular</li>
            <li>Procesamiento de pagos con certificación PCI DSS a través de Stripe</li>
          </ul>

          <h2>8. Modificaciones al Aviso de Privacidad</h2>
          <p>
            Nos reservamos el derecho de modificar este aviso de privacidad. Cualquier cambio será publicado
            en esta página con la fecha de última actualización. Te recomendamos revisarlo periódicamente.
          </p>

          <h2>9. Contacto</h2>
          <p>
            Para cualquier duda o aclaración sobre este aviso de privacidad, contáctanos en:{" "}
            <a href="mailto:privacidad@indexa.com.mx" className="text-indexa-blue hover:underline">privacidad@indexa.com.mx</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
