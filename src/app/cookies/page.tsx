import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Cookies — INDEXA",
  description: "Política de cookies de INDEXA. Conoce qué cookies utilizamos y cómo puedes gestionarlas.",
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-indexa-blue sm:text-4xl">
          Política de Cookies
        </h1>
        <p className="mt-2 text-sm text-gray-400">Última actualización: 17 de marzo de 2026</p>

        <div className="prose prose-gray mt-10 max-w-none text-gray-600 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-indexa-gray-dark [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-indexa-gray-dark [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:leading-relaxed">
          <h2>1. ¿Qué son las Cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
            Permiten que el sitio recuerde tus acciones y preferencias durante un período de tiempo, para que no tengas
            que volver a configurarlas cada vez que regreses.
          </p>

          <h2>2. Cookies que Utilizamos</h2>

          <h3>Cookies Estrictamente Necesarias</h3>
          <p>Estas cookies son esenciales para el funcionamiento de la plataforma:</p>
          <ul>
            <li><strong>firebaseAuthToken</strong> — Mantiene tu sesión iniciada de forma segura. Expira al cerrar sesión.</li>
            <li><strong>__session</strong> — Cookie de sesión de Firebase. Necesaria para la autenticación.</li>
          </ul>

          <h3>Cookies de Rendimiento y Analítica</h3>
          <p>Nos ayudan a entender cómo se utiliza la plataforma:</p>
          <ul>
            <li><strong>Google Analytics / Firebase Analytics</strong> — Recopilan datos anónimos sobre el uso de la plataforma,
            como páginas visitadas, tiempo de permanencia y tipo de dispositivo. Estos datos nos permiten mejorar la experiencia.</li>
          </ul>

          <h3>Cookies de Terceros</h3>
          <p>Algunos servicios de terceros que utilizamos pueden establecer sus propias cookies:</p>
          <ul>
            <li><strong>Stripe</strong> — Para el procesamiento seguro de pagos. Stripe puede establecer cookies para prevenir fraude.</li>
            <li><strong>Google (Firebase)</strong> — Para autenticación y servicios de base de datos en tiempo real.</li>
            <li><strong>Vercel</strong> — Para optimización de rendimiento y caché de la plataforma.</li>
          </ul>

          <h2>3. ¿Cómo Gestionar las Cookies?</h2>
          <p>
            Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una cookie.
            Sin embargo, algunas funciones de la Plataforma pueden no funcionar correctamente si desactivas las cookies.
          </p>
          <p>Instrucciones por navegador:</p>
          <ul>
            <li><strong>Google Chrome</strong>: Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
            <li><strong>Mozilla Firefox</strong>: Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
            <li><strong>Safari</strong>: Preferencias → Privacidad → Gestionar datos del sitio web</li>
            <li><strong>Microsoft Edge</strong>: Configuración → Cookies y permisos del sitio</li>
          </ul>

          <h2>4. Base Legal</h2>
          <p>
            El uso de cookies en INDEXA se fundamenta en la Ley Federal de Protección de Datos Personales en
            Posesión de los Particulares (LFPDPPP), la Ley Federal de Protección al Consumidor, y las mejores
            prácticas internacionales de privacidad digital.
          </p>

          <h2>5. Cambios en esta Política</h2>
          <p>
            Podemos actualizar esta política periódicamente. Cualquier cambio será publicado en esta página
            con la fecha de última actualización.
          </p>

          <h2>6. Más Información</h2>
          <p>
            Para más detalles sobre cómo tratamos tus datos, consulta nuestro{" "}
            <Link href="/privacidad" className="text-indexa-blue hover:underline">Aviso de Privacidad</Link>.
            Para consultas:{" "}
            <a href="mailto:privacidad@indexa.com.mx" className="text-indexa-blue hover:underline">privacidad@indexa.com.mx</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
