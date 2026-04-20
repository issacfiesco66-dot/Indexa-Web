export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" aria-label="Pie de página de INDEXA" className="relative overflow-hidden bg-[#050816] text-white">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-indexa-orange/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-7">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
                <span className="text-sm font-black text-white">IX</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">INDEXA</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              Plataforma de inteligencia artificial para negocios. Creamos, posicionamos y escalamos tu presencia digital.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Plataforma</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/probar" className="text-sm text-white/50 hover:text-white transition-colors">Generar preview gratis</a></li>
              <li><a href="#soluciones" className="text-sm text-white/50 hover:text-white transition-colors">Sitios Web con IA</a></li>
              <li><a href="#soluciones" className="text-sm text-white/50 hover:text-white transition-colors">Marketing Automatizado</a></li>
              <li><a href="#soluciones" className="text-sm text-white/50 hover:text-white transition-colors">SEO Inteligente</a></li>
              <li><a href="#precios" className="text-sm text-white/50 hover:text-white transition-colors">Precios</a></li>
              <li><a href="/casos-de-exito" className="text-sm text-white/50 hover:text-white transition-colors">Casos de Éxito</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Recursos</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/guia" className="text-sm text-white/50 hover:text-white transition-colors">Todas las Guías</a></li>
              <li><a href="/guia/presencia-digital-pymes" className="text-sm text-white/50 hover:text-white transition-colors">Guía: Presencia Digital</a></li>
              <li><a href="/guia/seo-local-mexico" className="text-sm text-white/50 hover:text-white transition-colors">Guía: SEO Local México</a></li>
              <li><a href="/guia/marketing-digital-pymes" className="text-sm text-white/50 hover:text-white transition-colors">Guía: Marketing Digital</a></li>
              <li><a href="/guia/google-mi-negocio" className="text-sm text-white/50 hover:text-white transition-colors">Guía: Google Mi Negocio</a></li>
              <li><a href="/directorio" className="text-sm text-white/50 hover:text-white transition-colors">Directorio de Negocios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Ciudades</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/pagina-web-cdmx" className="text-sm text-white/50 hover:text-white transition-colors">CDMX</a></li>
              <li><a href="/pagina-web-guadalajara" className="text-sm text-white/50 hover:text-white transition-colors">Guadalajara</a></li>
              <li><a href="/pagina-web-monterrey" className="text-sm text-white/50 hover:text-white transition-colors">Monterrey</a></li>
              <li><a href="/pagina-web-puebla" className="text-sm text-white/50 hover:text-white transition-colors">Puebla</a></li>
              <li><a href="/pagina-web-queretaro" className="text-sm text-white/50 hover:text-white transition-colors">Querétaro</a></li>
              <li><a href="/pagina-web-tijuana" className="text-sm text-white/50 hover:text-white transition-colors">Tijuana</a></li>
              <li><a href="/pagina-web-merida" className="text-sm text-white/50 hover:text-white transition-colors">Mérida</a></li>
              <li><a href="/pagina-web-leon" className="text-sm text-white/50 hover:text-white transition-colors">León</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Por Giro</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/sitio-web-restaurante" className="text-sm text-white/50 hover:text-white transition-colors">Restaurantes</a></li>
              <li><a href="/sitio-web-dentista" className="text-sm text-white/50 hover:text-white transition-colors">Dentistas</a></li>
              <li><a href="/sitio-web-taller-mecanico" className="text-sm text-white/50 hover:text-white transition-colors">Talleres Mecánicos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Cuenta</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/registro" className="text-sm text-white/50 hover:text-white transition-colors">Prueba Gratis 14 días</a></li>
              <li><a href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Iniciar Sesión</a></li>
              <li><a href="/agencias" className="text-sm text-white/50 hover:text-white transition-colors">Para Agencias</a></li>
              <li><a href="#contacto" className="text-sm text-white/50 hover:text-white transition-colors">Contacto B2B</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Legal</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/privacidad" className="text-sm text-white/50 hover:text-white transition-colors">Aviso de Privacidad</a></li>
              <li><a href="/terminos" className="text-sm text-white/50 hover:text-white transition-colors">Términos de Servicio</a></li>
              <li><a href="/cookies" className="text-sm text-white/50 hover:text-white transition-colors">Política de Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 border-t border-white/5 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-white/30">
            &copy; {currentYear} INDEXA. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/20">
            Potenciado por Inteligencia Artificial
          </p>
        </div>
      </div>
    </footer>
  );
}
