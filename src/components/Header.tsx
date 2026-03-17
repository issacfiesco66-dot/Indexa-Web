"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-indexa-blue">
          INDEXA
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#soluciones" className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue transition-colors">
            Servicios
          </a>
          <a href="#precios" className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue transition-colors">
            Precios
          </a>
          <a href="#contacto" className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue transition-colors">
            Contacto
          </a>
          <Link
            href="/login"
            className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-lg bg-indexa-orange px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indexa-orange/90"
          >
            Crear Cuenta Gratis
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-indexa-gray-dark transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-indexa-gray-dark transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-indexa-gray-dark transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            <a href="#soluciones" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue">
              Servicios
            </a>
            <a href="#precios" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue">
              Precios
            </a>
            <a href="#contacto" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue">
              Contacto
            </a>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-lg bg-indexa-orange px-5 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-indexa-orange/90"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
