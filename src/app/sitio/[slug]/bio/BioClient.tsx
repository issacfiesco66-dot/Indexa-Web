"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { SitioData, BioLink, Oferta } from "@/types/lead";

interface BioClientProps {
  sitioId: string;
  data: SitioData;
  source: string;
}

const SOURCE_LABELS: Record<string, string> = {
  fb: "Facebook",
  ig: "Instagram",
  tt: "TikTok",
  wa: "WhatsApp",
};

// Default bio links when none configured — smart CTA set
function getDefaultLinks(data: SitioData): BioLink[] {
  const links: BioLink[] = [];

  // Active offers become links automatically
  const now = new Date();
  const activeOfertas = (data.ofertasActivas ?? []).filter(
    (o: Oferta) => o.activa && o.titulo && new Date(o.fechaFin + "T23:59:59") >= now
  );

  if (activeOfertas.length > 0) {
    links.push({
      id: "oferta-destacada",
      tipo: "oferta",
      titulo: activeOfertas[0].titulo,
      descripcion: activeOfertas[0].descripcion || "Promoción por tiempo limitado",
      url: "",
      emoji: "🔥",
      activo: true,
    });
  }

  // WhatsApp reservation / contact
  if (data.whatsapp) {
    links.push({
      id: "reserva-wa",
      tipo: "reserva",
      titulo: "Reserva Aquí",
      descripcion: "Aparta tu lugar por WhatsApp",
      url: "",
      emoji: "📅",
      activo: true,
    });

    links.push({
      id: "contacto-wa",
      tipo: "whatsapp",
      titulo: "Envíanos un Mensaje",
      descripcion: "Respuesta inmediata por WhatsApp",
      url: "",
      emoji: "💬",
      activo: true,
    });
  }

  // Coupon for followers
  links.push({
    id: "cupon-seguidor",
    tipo: "cupon",
    titulo: "Cupón Exclusivo para Seguidores",
    descripcion: "Muestra esta pantalla y obtén tu descuento",
    url: "",
    emoji: "🎁",
    activo: true,
  });

  // Menu / services
  if (data.servicios && data.servicios.length > 0) {
    links.push({
      id: "menu-servicios",
      tipo: "menu",
      titulo: "Nuestros Servicios",
      descripcion: "Conoce todo lo que ofrecemos",
      url: "",
      emoji: "📋",
      activo: true,
    });
  }

  // Website link
  links.push({
    id: "sitio-web",
    tipo: "link",
    titulo: "Visita Nuestro Sitio Web",
    descripcion: "Toda nuestra información en un solo lugar",
    url: `/sitio/${data.slug}`,
    emoji: "🌐",
    activo: true,
  });

  return links;
}

function getWhatsAppUrl(whatsapp: string, message: string): string {
  const digits = whatsapp.replace(/[^\d+]/g, "");
  const num = digits.startsWith("+") ? digits : `+52${digits}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export default function BioClient({ sitioId, data, source }: BioClientProps) {
  const tracked = useRef(false);

  // Track visit on mount
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch("/api/bio-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitioId, source }),
    }).catch(() => {});
  }, [sitioId, source]);

  const bioLinks = data.bioLinks && data.bioLinks.length > 0
    ? data.bioLinks.filter((l) => l.activo)
    : getDefaultLinks(data);

  const color = data.colorPrincipal || "#002366";
  const sourceName = SOURCE_LABELS[source] || null;

  // Handle link click
  const handleClick = (link: BioLink) => {
    // Track click
    fetch("/api/bio-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sitioId, source, linkId: link.id }),
    }).catch(() => {});

    // Navigate based on type
    switch (link.tipo) {
      case "whatsapp":
        window.open(
          getWhatsAppUrl(data.whatsapp, `Hola, los contacto desde su perfil de ${sourceName || "redes sociales"} 👋`),
          "_blank"
        );
        break;
      case "reserva":
        window.open(
          getWhatsAppUrl(data.whatsapp, `Hola, quiero hacer una reservación 📅`),
          "_blank"
        );
        break;
      case "oferta":
        window.open(
          getWhatsAppUrl(data.whatsapp, `Hola, vi su promoción "${link.titulo}" y me interesa 🔥`),
          "_blank"
        );
        break;
      case "cupon":
        // Show coupon in an alert-like experience (stays on page)
        break;
      case "menu":
        window.location.href = `/sitio/${data.slug}#servicios`;
        break;
      case "link":
        if (link.url) {
          window.location.href = link.url.startsWith("http") ? link.url : link.url;
        }
        break;
    }
  };

  // Active offers for the special offer card
  const now = new Date();
  const activeOfertas = (data.ofertasActivas ?? []).filter(
    (o: Oferta) => o.activa && o.titulo && new Date(o.fechaFin + "T23:59:59") >= now
  );

  return (
    <div
      className="flex min-h-screen flex-col items-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 px-4 py-8 sm:py-12"
      style={{ "--bio-color": color } as React.CSSProperties}
    >
      {/* Source welcome badge */}
      {sourceName && (
        <div className="mb-6 animate-fade-in rounded-full bg-white/10 px-4 py-1.5 text-center text-xs font-medium text-white/70 backdrop-blur-sm">
          Viniste desde <span className="font-bold text-white">{sourceName}</span> — ¡Bienvenido! 👋
        </div>
      )}

      {/* Profile header */}
      <div className="flex flex-col items-center">
        {data.logoUrl ? (
          <Image
            src={data.logoUrl}
            alt={data.nombre}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full border-4 object-cover shadow-2xl"
            priority
            style={{ borderColor: color }}
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-black text-white shadow-2xl"
            style={{ backgroundColor: color, borderColor: `${color}88` }}
          >
            {data.nombre.charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="mt-4 text-center text-2xl font-extrabold text-white">
          {data.nombre}
        </h1>

        {data.eslogan && (
          <p className="mt-1 text-center text-sm text-white/60">{data.eslogan}</p>
        )}

        {(data.categoria || data.ciudad) && (
          <p className="mt-1 text-center text-xs text-white/40">
            {[data.categoria, data.ciudad].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>

      {/* Active offer highlight */}
      {activeOfertas.length > 0 && (
        <button
          onClick={() => handleClick({
            id: "oferta-destacada",
            tipo: "oferta",
            titulo: activeOfertas[0].titulo,
            descripcion: activeOfertas[0].descripcion,
            url: "",
            emoji: "🔥",
            activo: true,
          })}
          className="group mt-8 w-full max-w-md animate-pulse-slow overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-[2px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-gray-950/50 px-5 py-4 backdrop-blur-sm">
            {activeOfertas[0].imagenUrl && (
              <Image
                src={activeOfertas[0].imagenUrl}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl object-cover"
              />
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                🔥 Oferta del Momento
              </p>
              <p className="truncate text-lg font-extrabold text-white">
                {activeOfertas[0].titulo}
              </p>
              {activeOfertas[0].descripcion && (
                <p className="truncate text-xs text-white/60">
                  {activeOfertas[0].descripcion}
                </p>
              )}
            </div>
            <span className="flex-shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
              Ver →
            </span>
          </div>
        </button>
      )}

      {/* Bio links */}
      <div className="mt-6 w-full max-w-md space-y-3">
        {bioLinks
          .filter((l) => l.id !== "oferta-destacada" || activeOfertas.length === 0)
          .map((link) => (
            <button
              key={link.id}
              onClick={() => handleClick(link)}
              className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: `${color}22` }}
              >
                {link.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{link.titulo}</p>
                {link.descripcion && (
                  <p className="mt-0.5 truncate text-xs text-white/50">{link.descripcion}</p>
                )}
              </div>
              <svg
                className="h-4 w-4 flex-shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
      </div>

      {/* Coupon modal-like card (always visible for followers) */}
      {bioLinks.some((l) => l.tipo === "cupon") && (
        <div className="mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-5 text-center">
          <p className="text-2xl">🎁</p>
          <p className="mt-2 text-sm font-extrabold text-amber-300">
            Cupón Exclusivo para Seguidores
          </p>
          <p className="mt-1 text-xs text-white/50">
            Muestra esta pantalla en el establecimiento
          </p>
          <div className="mx-auto mt-3 rounded-xl border-2 border-dashed border-amber-400/50 bg-amber-400/10 px-6 py-3">
            <p className="font-mono text-lg font-extrabold tracking-widest text-amber-300">
              {data.nombre.substring(0, 4).toUpperCase()}-{sourceName ? sourceName.substring(0, 2).toUpperCase() : "VIP"}-2025
            </p>
          </div>
          <p className="mt-2 text-[10px] text-white/30">
            Válido presentando este código. Un uso por persona.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-[10px] text-white/20">
          Powered by <span className="font-bold">INDEXA</span>
        </p>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
