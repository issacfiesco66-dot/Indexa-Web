"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Zap, BarChart3, Bot, ArrowRight, X } from "lucide-react";
import confetti from "canvas-confetti";

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  planName?: string;
  /** Where the CTA button navigates */
  ctaHref?: string;
  onCtaClick?: () => void;
}

const FEATURES = [
  { icon: Shield, label: "Auditoría Zero Trust", desc: "Escaneo de seguridad y fugas de capital en tiempo real" },
  { icon: BarChart3, label: "Métricas desbloqueadas", desc: "Datos exactos de todas tus campañas" },
  { icon: Bot, label: "IA de optimización", desc: "Asistente que ejecuta cambios por ti" },
  { icon: Zap, label: "Acciones directas", desc: "Pausa, crea y optimiza campañas al instante" },
];

export default function CelebrationModal({
  open,
  onClose,
  planName = "Starter",
  ctaHref,
  onCtaClick,
}: CelebrationModalProps) {
  const confettiFired = useRef(false);
  const [step, setStep] = useState(0); // 0 = celebration, 1 = features

  // Fire confetti on open
  useEffect(() => {
    if (!open || confettiFired.current) return;
    confettiFired.current = true;

    const end = Date.now() + 2000;
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      confettiFired.current = false;
      setStep(0);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0a0e27] shadow-2xl shadow-indigo-500/10"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>

            <AnimatePresence mode="wait">
              {step === 0 ? (
                /* ── Step 1: Celebration ─────────────────────── */
                <motion.div
                  key="celebration"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center px-8 pb-8 pt-12 text-center"
                >
                  {/* Animated icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2, damping: 10 }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/30"
                  >
                    <Sparkles className="h-10 w-10 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-2 text-2xl font-black sm:text-3xl"
                  >
                    Bienvenido al Centro de Comando
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-2 text-sm text-white/50"
                  >
                    Plan <span className="font-semibold text-indigo-400">{planName}</span> activado correctamente
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8 max-w-sm text-xs leading-relaxed text-white/35"
                  >
                    Tu Estratega IA está listo para analizar tus campañas, detectar fugas de presupuesto
                    y optimizar tu inversión publicitaria.
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => setStep(1)}
                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                  >
                    Ver qué puedo hacer
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </motion.div>
              ) : (
                /* ── Step 2: Features ────────────────────────── */
                <motion.div
                  key="features"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-8 pb-8 pt-10"
                >
                  <h3 className="mb-1 text-center text-lg font-bold">
                    Tu Centro de Comando incluye
                  </h3>
                  <p className="mb-6 text-center text-xs text-white/40">
                    Todo lo que necesitas para proteger y maximizar tu inversión
                  </p>

                  <div className="mb-6 space-y-3">
                    {FEATURES.map((f, i) => (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                          <f.icon size={18} className="text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{f.label}</p>
                          <p className="text-xs text-white/40">{f.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {ctaHref ? (
                    <a
                      href={ctaHref}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                      <Zap className="h-4 w-4" />
                      Iniciar mi primer análisis
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <button
                      onClick={onCtaClick || onClose}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                      <Zap className="h-4 w-4" />
                      Iniciar mi primer análisis
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
