"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import {
  ArrowLeft,
  Wand2,
  Loader2,
  Download,
  RefreshCw,
  Smartphone,
  Monitor,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  MoreHorizontal,
  Globe,
  Bookmark,
  Send,
} from "lucide-react";

type PreviewMode = "facebook" | "instagram";

export default function CrearAnuncioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [apiKey, setApiKey] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [headline, setHeadline] = useState("Tu Negocio Digital");
  const [description, setDescription] = useState("Descubre cómo impulsar tu negocio con inteligencia artificial. Crea tu presencia digital hoy.");
  const [ctaText, setCtaText] = useState("Más información");
  const [businessName, setBusinessName] = useState("Mi Negocio");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [generatedMime, setGeneratedMime] = useState("image/png");
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("facebook");

  // ── Load NanoBanana API key ──────────────────────────────────
  useEffect(() => {
    if (authLoading || !user || !db) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.nanoBananaApiKey) {
            setApiKey(data.nanoBananaApiKey);
          }
          if (data.displayName) {
            setBusinessName(data.displayName);
          }
        }
      } catch (err) {
        console.error("Error loading API key:", err);
      } finally {
        setPageLoading(false);
      }
    })();
  }, [user, authLoading]);

  // ── Generate image ───────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!user || !apiKey || !prompt.trim()) return;
    setGenerating(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apiKey,
          prompt: `Professional advertisement image for social media (Facebook/Instagram ad). ${prompt.trim()}. High quality, commercial photography style, clean composition, vibrant colors, no text overlay.`,
          aspectRatio: previewMode === "instagram" ? "1:1" : "16:9",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al generar la imagen.");
        return;
      }

      setGeneratedImage(data.image);
      setGeneratedMime(data.mimeType || "image/png");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  }, [user, apiKey, prompt, previewMode]);

  // ── Download image ───────────────────────────────────────────
  const handleDownload = () => {
    if (!generatedImage) return;
    const ext = generatedMime.includes("jpeg") ? "jpg" : "png";
    const link = document.createElement("a");
    link.href = `data:${generatedMime};base64,${generatedImage}`;
    link.download = `anuncio-indexa-${Date.now()}.${ext}`;
    link.click();
  };

  // ── Loading / Auth guard ─────────────────────────────────────
  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indexa-blue" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm text-center">
          <Wand2 size={40} className="mx-auto text-gray-300" />
          <h1 className="mt-4 text-lg font-bold text-indexa-gray-dark">API Key requerida</h1>
          <p className="mt-2 text-sm text-gray-500">
            Configura tu API key de NanoBanana en el panel de Marketing para generar imágenes con IA.
          </p>
          <Link
            href="/dashboard/marketing"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indexa-blue px-5 py-2.5 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} /> Ir a Marketing
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20";

  const imageSrc = generatedImage ? `data:${generatedMime};base64,${generatedImage}` : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/marketing"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indexa-blue"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-indexa-gray-dark">Crear Anuncio con IA</h1>
              <p className="text-[11px] text-gray-400">Genera imágenes y previsualiza tus ads</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode("facebook")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${previewMode === "facebook" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <Monitor size={14} className="inline mr-1" />Facebook
            </button>
            <button
              onClick={() => setPreviewMode("instagram")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${previewMode === "instagram" ? "bg-pink-100 text-pink-700" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <Smartphone size={14} className="inline mr-1" />Instagram
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Left: Form ──────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Image prompt */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-indexa-gray-dark">
                <Wand2 size={16} className="text-purple-500" />
                Generar imagen con IA
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe la imagen que quieres para tu anuncio... Ej: Una taza de café artesanal en una mesa de madera con iluminación cálida, estilo premium"
                rows={3}
                className={`mt-3 ${inputClass} resize-none`}
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indexa-orange px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {generating ? (
                    <><Loader2 size={16} className="animate-spin" /> Generando...</>
                  ) : (
                    <><Wand2 size={16} /> Generar Imagen</>
                  )}
                </button>
                {generatedImage && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Download size={14} /> Descargar
                  </button>
                )}
              </div>
              {error && (
                <p className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">{error}</p>
              )}
            </div>

            {/* Ad copy */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-indexa-gray-dark">Texto del anuncio</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Nombre del negocio</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Titular</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Descripción</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className={`mt-1 ${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500">Botón CTA</label>
                  <select
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className={`mt-1 ${inputClass}`}
                  >
                    <option>Más información</option>
                    <option>Comprar ahora</option>
                    <option>Registrarse</option>
                    <option>Enviar mensaje</option>
                    <option>Obtener oferta</option>
                    <option>Reservar ahora</option>
                    <option>Descargar</option>
                    <option>Ver más</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Preview ──────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-indexa-gray-dark">Vista Previa</h2>

            {previewMode === "facebook" ? (
              /* ── Facebook Ad Preview ──────────────────────────── */
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Post header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indexa-blue to-blue-400 text-xs font-bold text-white">
                    {businessName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{businessName}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>Patrocinado</span>
                      <span>·</span>
                      <Globe size={10} />
                    </div>
                  </div>
                  <MoreHorizontal size={20} className="text-gray-400" />
                </div>

                {/* Description */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-gray-800 leading-relaxed">{description}</p>
                </div>

                {/* Image */}
                <div className="relative aspect-[1.91/1] w-full bg-gray-100">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Ad preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-300">
                      <Wand2 size={40} />
                      <p className="mt-2 text-xs">Genera una imagen para ver la vista previa</p>
                    </div>
                  )}
                </div>

                {/* Link preview bar */}
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase text-gray-500 tracking-wide">tu-sitio.com</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{headline}</p>
                  </div>
                  <button className="flex-shrink-0 rounded-md bg-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-800">
                    {ctaText}
                  </button>
                </div>

                {/* Engagement bar */}
                <div className="border-t border-gray-100 px-4 py-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white">👍</span>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">❤️</span>
                      </div>
                      <span className="ml-1">128</span>
                    </div>
                    <span>24 comentarios · 12 compartidos</span>
                  </div>
                </div>
                <div className="flex border-t border-gray-100">
                  {[
                    { icon: ThumbsUp, label: "Me gusta" },
                    { icon: MessageCircle, label: "Comentar" },
                    { icon: Share2, label: "Compartir" },
                  ].map((a) => (
                    <button key={a.label} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50">
                      <a.icon size={16} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Instagram Ad Preview ─────────────────────────── */
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Post header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-xs font-bold text-white">
                    {businessName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">{businessName.toLowerCase().replace(/\s/g, "")}</p>
                    <p className="text-[10px] text-gray-500">Patrocinado</p>
                  </div>
                  <MoreHorizontal size={18} className="text-gray-600" />
                </div>

                {/* Image (1:1) */}
                <div className="relative aspect-square w-full bg-gray-100">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Ad preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-300">
                      <Wand2 size={40} />
                      <p className="mt-2 text-xs">Genera una imagen para ver la vista previa</p>
                    </div>
                  )}
                </div>

                {/* CTA bar */}
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{headline}</p>
                  </div>
                  <button className="flex-shrink-0 rounded-md bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    {ctaText}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-4">
                    <Heart size={22} className="text-gray-800" />
                    <MessageCircle size={22} className="text-gray-800" />
                    <Send size={22} className="text-gray-800" />
                  </div>
                  <Bookmark size={22} className="text-gray-800" />
                </div>

                {/* Likes & caption */}
                <div className="px-4 pb-3">
                  <p className="text-xs font-semibold text-gray-900">1,247 Me gusta</p>
                  <p className="mt-1 text-xs text-gray-800">
                    <span className="font-semibold">{businessName.toLowerCase().replace(/\s/g, "")}</span>{" "}
                    {description.length > 80 ? description.slice(0, 80) + "..." : description}
                  </p>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-xs font-bold text-gray-600">Consejos para mejores anuncios</h3>
              <ul className="mt-2 space-y-1.5 text-[11px] text-gray-500">
                <li>• Usa imágenes brillantes y de alto contraste</li>
                <li>• Mantén el texto del anuncio corto y directo</li>
                <li>• Incluye una llamada a la acción clara</li>
                <li>• Facebook recomienda imágenes de 1200x628px (1.91:1)</li>
                <li>• Instagram funciona mejor con formato cuadrado 1080x1080px</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
