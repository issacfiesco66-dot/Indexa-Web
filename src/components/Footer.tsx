export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#050816] text-white">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-indexa-orange/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
              <li><a href="#soluciones" className="text-sm text-white/50 hover:text-white transition-colors">Sitios Web con IA</a></li>
              <li><a href="#soluciones" className="text-sm text-white/50 hover:text-white transition-colors">Marketing Automatizado</a></li>
              <li><a href="#soluciones" className="text-sm text-white/50 hover:text-white transition-colors">SEO Inteligente</a></li>
              <li><a href="#precios" className="text-sm text-white/50 hover:text-white transition-colors">Precios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Cuenta</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/registro" className="text-sm text-white/50 hover:text-white transition-colors">Crear Cuenta</a></li>
              <li><a href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Iniciar Sesión</a></li>
              <li><a href="#contacto" className="text-sm text-white/50 hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/30">Legal</h4>
            <ul className="mt-4 space-y-2.5">
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Aviso de Privacidad</a></li>
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">Términos de Servicio</a></li>
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
