"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0e27]/90 backdrop-blur-xl shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
            <span className="text-sm font-black text-white">IX</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">INDEXA</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#soluciones" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Servicios
          </a>
          <a href="#como-funciona" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Cómo Funciona
          </a>
          <a href="#precios" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Precios
          </a>
          <Link href="/agencias" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Para Agencias
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-lg bg-gradient-to-r from-indexa-orange to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:shadow-indexa-orange/30 hover:-translate-y-0.5"
          >
            Prueba 14 días gratis
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label={menuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" role="navigation" aria-label="Menú principal" className="border-t border-white/10 bg-[#0a0e27]/95 backdrop-blur-xl px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <a href="#soluciones" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Servicios</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Cómo Funciona</a>
            <a href="#precios" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Precios</a>
            <Link href="/agencias" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Para Agencias</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Iniciar Sesión</Link>
            <Link
              href="/registro"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-lg bg-gradient-to-r from-indexa-orange to-orange-500 px-5 py-2.5 text-center text-sm font-bold text-white"
            >
              Prueba 14 días gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
