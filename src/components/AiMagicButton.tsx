"use client";

import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Sparkles, Loader2, Check, Wand2, ExternalLink } from "lucide-react";

interface AiMagicButtonProps {
  sitioId: string;
  sitioNombre: string;
  sitioSlug: string;
  onOfertaCreated?: () => void;
}

type Step = "idle" | "generating" | "saving" | "done" | "error";

export default function AiMagicButton({
  sitioId,
  sitioNombre,
  sitioSlug,
  onOfertaCreated,
}: AiMagicButtonProps) {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<{
    titulo: string;
    descripcion: string;
    colorBanner: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 5) {
      setErrorMsg("Describe tu oferta con al menos 5 caracteres.");
      return;
    }

    setStep("generating");
    setErrorMsg("");
    setResult(null);

    try {
      // 1. Call AI API
      const res = await fetch("/api/ai/generate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), nombreNegocio: sitioNombre }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al generar la oferta.");
      }

      const oferta = data.oferta;
      setResult(oferta);

      // 2. Save to Firestore automatically
      setStep("saving");

      if (!db || !sitioId) {
        throw new Error("No se puede guardar — base de datos no disponible.");
      }

      const newOferta = {
        id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        titulo: oferta.titulo,
        descripcion: oferta.descripcion,
        imagenUrl: "",
        fechaFin: oferta.fechaFin,
        activa: true,
        colorBanner: oferta.colorBanner,
        creadaPorIA: true,
      };

      await updateDoc(doc(db, "sitios", sitioId), {
        ofertasActivas: arrayUnion(newOferta),
      });

      setStep("done");
      onOfertaCreated?.();

      // Reset after 8 seconds
      setTimeout(() => {
        setStep("idle");
        setPrompt("");
        setResult(null);
      }, 8000);
    } catch (err) {
      console.error("AI Magic error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado.");
      setStep("error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-200">
          <Wand2 size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">AI Magic</h3>
          <p className="text-[11px] text-gray-400">Crea ofertas con inteligencia artificial</p>
        </div>
      </div>

      {/* Input */}
      {step === "idle" || step === "error" ? (
        <>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setErrorMsg(""); }}
              onKeyDown={handleKeyDown}
              placeholder="Quiero una oferta de 2x1 en aceites para motor solo por este fin de semana"
              rows={2}
              className="w-full resize-none rounded-xl border border-purple-200 bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md transition-all hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              title="Generar con IA"
            >
              <Sparkles size={16} />
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            Describe lo que quieres y la IA creará título, descripción y color automáticamente.
          </p>
          {errorMsg && (
            <p className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-600">
              {errorMsg}
            </p>
          )}
        </>
      ) : step === "generating" ? (
        <div className="flex items-center gap-3 rounded-xl bg-purple-50 border border-purple-200 px-4 py-4">
          <Loader2 size={20} className="animate-spin text-purple-500" />
          <div>
            <p className="text-sm font-semibold text-purple-700">La IA está pensando...</p>
            <p className="text-xs text-purple-400">Generando tu oferta perfecta</p>
          </div>
        </div>
      ) : step === "saving" ? (
        <div className="flex items-center gap-3 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-4">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
          <div>
            <p className="text-sm font-semibold text-indigo-700">Publicando en tu web...</p>
            <p className="text-xs text-indigo-400">Guardando la oferta en tu sitio</p>
          </div>
        </div>
      ) : step === "done" && result ? (
        <div className="space-y-3">
          {/* Success banner */}
          <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
              <Check size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-700">
                ¡Listo! La IA ya publicó tu oferta.
              </p>
              <p className="text-xs text-green-500 mt-0.5">
                Revisa tu web ahora mismo.
              </p>
            </div>
          </div>

          {/* Preview card */}
          <div
            className="rounded-xl p-4 text-white shadow-md"
            style={{ backgroundColor: result.colorBanner }}
          >
            <p className="text-base font-extrabold leading-tight">{result.titulo}</p>
            <p className="mt-1 text-sm opacity-90">{result.descripcion}</p>
          </div>

          {/* CTA */}
          {sitioSlug && (
            <a
              href={`/sitio/${sitioSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ExternalLink size={13} />
              Ver en mi sitio web
            </a>
          )}
        </div>
      ) : null}
    </div>
  );
}
