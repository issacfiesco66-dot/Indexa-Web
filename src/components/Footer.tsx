export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-indexa-blue text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-2xl font-extrabold tracking-tight">INDEXA</span>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Presencia digital para PYMES. Creamos, posicionamos y hacemos crecer tu negocio en internet.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Servicios</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="#soluciones" className="text-sm text-white/70 hover:text-white transition-colors">Páginas Web</a></li>
              <li><a href="#soluciones" className="text-sm text-white/70 hover:text-white transition-colors">E-commerce</a></li>
              <li><a href="#soluciones" className="text-sm text-white/70 hover:text-white transition-colors">SEO</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Empresa</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="#precios" className="text-sm text-white/70 hover:text-white transition-colors">Precios</a></li>
              <li><a href="#contacto" className="text-sm text-white/70 hover:text-white transition-colors">Contacto</a></li>
              <li><a href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Iniciar Sesión</a></li>
              <li><a href="/registro" className="text-sm text-white/70 hover:text-white transition-colors">Crear Cuenta</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/50">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Aviso de Privacidad</a></li>
              <li><a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Términos de Servicio</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/50">
          &copy; {currentYear} INDEXA. Todos los derechos reservados. | www.indexa.com.mx
        </div>
      </div>
    </footer>
  );
}
