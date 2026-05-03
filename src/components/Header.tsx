"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { servicios } from "@/lib/serviciosData";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);

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
          <div
            className="relative"
            onMouseEnter={() => setServiciosOpen(true)}
            onMouseLeave={() => setServiciosOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-white">
              Servicios
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`h-4 w-4 transition-transform ${serviciosOpen ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {serviciosOpen && (
              <div className="absolute left-1/2 top-full z-50 w-[480px] -translate-x-1/2 pt-3">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e27]/95 p-3 shadow-2xl backdrop-blur-xl">
                  <div className="grid gap-1 sm:grid-cols-2">
                    {servicios.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/servicios/${s.slug}`}
                        className="group flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-white/5"
                      >
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${s.cardAccent}, ${s.cardAccent}aa)`,
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d={s.cardIconPath} />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{s.cardTitle}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-white/50">{s.cardDescription}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-white/5 pt-2">
                    <a href="#soluciones" className="block rounded-lg px-3 py-2 text-xs font-semibold text-indexa-orange hover:bg-indexa-orange/10">
                      Ver todos los servicios →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          <a href="#por-que-converte" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            ¿Por qué convierte?
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
            <div className="flex flex-col gap-1.5 border-l border-white/10 pl-3">
              {servicios.map((s) => (
                <Link
                  key={s.slug}
                  href={`/servicios/${s.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-xs text-white/55 hover:text-white"
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: s.cardAccent }}
                  />
                  {s.cardTitle}
                </Link>
              ))}
            </div>
            <a href="#por-que-converte" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">¿Por qué convierte?</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Cómo Funciona</a>
            <a href="#precios" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Precios</a>
            <Link href="/probar" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/70 hover:text-white">Probar sin cuenta</Link>
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
