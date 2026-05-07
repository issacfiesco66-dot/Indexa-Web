"use client";

/**
 * One-click Meta OAuth connector.
 *
 *   1. POST /api/auth/meta/state → signed state + appId
 *   2. Open popup at facebook.com/dialog/oauth with redirect to our callback
 *   3. Callback saves the long-lived token to Firestore and postMessages back
 *   4. Component fetches /api/meta-ads/resources → shows ad accounts + pages
 *   5. User picks one of each → component POSTs to /api/tokens (action:save)
 *   6. Parent is notified via onConnected so it can reload its state
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Check,
  AlertCircle,
  X,
  Briefcase,
  Building2,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface AdAccount {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  status: number;
  business?: string;
}

interface Page {
  id: string;
  name: string;
  category?: string;
  picture?: string;
}

interface Resources {
  adAccounts: AdAccount[];
  pages: Page[];
}

interface Props {
  onConnected: () => void;
  /** If true, the user already has a saved token — show "Volver a conectar" copy */
  alreadyConnected?: boolean;
}

const SCOPES = [
  "ads_management",
  "ads_read",
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
  "read_insights",
].join(",");

export default function MetaConnect({ onConnected, alreadyConnected = false }: Props) {
  const { user } = useAuth();

  const [phase, setPhase] = useState<
    "idle" | "popup" | "fetching" | "selecting" | "saving" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [resources, setResources] = useState<Resources | null>(null);
  const [pickedAdAccount, setPickedAdAccount] = useState("");
  const [pickedPage, setPickedPage] = useState("");

  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup popup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const fetchResources = useCallback(async () => {
    if (!user) return;
    setPhase("fetching");
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/meta-ads/resources", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar tus cuentas.");
      setResources(data);
      // Auto-pick if only one of each
      if (data.adAccounts?.length === 1) setPickedAdAccount(data.adAccounts[0].accountId);
      if (data.pages?.length === 1) setPickedPage(data.pages[0].id);
      setPhase("selecting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setPhase("error");
    }
  }, [user]);

  // Listen for postMessage from popup
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; error?: string } | null;
      if (!data?.type) return;
      if (data.type === "meta-oauth-success") {
        if (pollRef.current) clearInterval(pollRef.current);
        fetchResources();
      } else if (data.type === "meta-oauth-error") {
        if (pollRef.current) clearInterval(pollRef.current);
        setError(data.error || "Conexión cancelada.");
        setPhase("error");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [fetchResources]);

  const startOAuth = useCallback(async () => {
    if (!user) return;
    setError("");
    setPhase("popup");

    let stateData: { state: string; appId: string };
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/meta/state", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      stateData = await res.json();
      if (!res.ok) throw new Error((stateData as unknown as { error?: string }).error || "No se pudo iniciar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar OAuth.");
      setPhase("error");
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/meta/callback`;
    const oauthUrl =
      `https://www.facebook.com/v21.0/dialog/oauth?` +
      new URLSearchParams({
        client_id: stateData.appId,
        redirect_uri: redirectUri,
        state: stateData.state,
        scope: SCOPES,
        response_type: "code",
        auth_type: "rerequest",
      });

    const w = 600;
    const h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    popupRef.current = window.open(
      oauthUrl,
      "meta-oauth",
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`,
    );

    if (!popupRef.current) {
      setError("Tu navegador bloqueó la ventana. Permite popups e intenta de nuevo.");
      setPhase("error");
      return;
    }

    // Detect popup closed without postMessage (user dismissed it)
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase((p) => {
          if (p === "popup") {
            setError("Cancelaste la conexión.");
            return "error";
          }
          return p;
        });
      }
    }, 700);
  }, [user]);

  const saveSelection = useCallback(async () => {
    if (!user || !pickedAdAccount) return;
    setPhase("saving");
    setError("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          action: "save",
          tokens: {
            metaAdAccountId: pickedAdAccount,
            ...(pickedPage ? { metaPageId: pickedPage } : {}),
          },
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "No se pudo guardar la selección.");
      }
      onConnected();
      setPhase("idle");
      setResources(null);
      setPickedAdAccount("");
      setPickedPage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
      setPhase("error");
    }
  }, [user, pickedAdAccount, pickedPage, onConnected]);

  const closeSelector = () => {
    setPhase("idle");
    setResources(null);
    setPickedAdAccount("");
    setPickedPage("");
  };

  return (
    <>
      <button
        onClick={startOAuth}
        disabled={phase === "popup" || phase === "fetching" || phase === "saving"}
        className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#0d65d9] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
      >
        {phase === "popup" || phase === "fetching" ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        {phase === "popup"
          ? "Esperando autorización…"
          : phase === "fetching"
            ? "Cargando tus cuentas…"
            : alreadyConnected
              ? "Volver a conectar con Facebook"
              : "Conectar con Facebook"}
      </button>

      {error && phase === "error" && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setPhase("idle")} className="text-red-400 hover:text-red-200">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Resource selector modal ─────────────────────────── */}
      {(phase === "selecting" || phase === "saving") && resources && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f17] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2]/15 text-[#1877F2]">
                  <Check size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">¡Conectado a Meta!</h3>
                  <p className="text-xs text-white/50">Elige cuenta publicitaria y página de Facebook.</p>
                </div>
              </div>
              <button
                onClick={closeSelector}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              {/* Ad accounts */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Briefcase size={14} className="text-indexa-orange" />
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    Cuenta publicitaria
                  </h4>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50">
                    {resources.adAccounts.length}
                  </span>
                </div>
                {resources.adAccounts.length === 0 ? (
                  <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">
                    No encontramos cuentas publicitarias en tu Meta Business. Crea una en
                    {" "}
                    <a
                      href="https://business.facebook.com/settings/ad-accounts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      Business Settings
                    </a>
                    {" "}y vuelve a conectar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {resources.adAccounts.map((acc) => {
                      const picked = pickedAdAccount === acc.accountId;
                      const disabled = acc.status !== 1; // 1 = ACTIVE
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => !disabled && setPickedAdAccount(acc.accountId)}
                          disabled={disabled}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                            picked
                              ? "border-[#1877F2] bg-[#1877F2]/10 ring-2 ring-[#1877F2]/30"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                              <Building2 size={16} className="text-white/60" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{acc.name}</p>
                              <p className="truncate text-[11px] text-white/40">
                                act_{acc.accountId} · {acc.currency}
                                {acc.business ? ` · ${acc.business}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {disabled && (
                              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                Inactiva
                              </span>
                            )}
                            {picked && <Check size={16} className="text-[#1877F2]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pages */}
              <div className="mt-6">
                <div className="mb-2 flex items-center gap-2">
                  <ImageIcon size={14} className="text-indexa-orange" />
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    Página de Facebook
                  </h4>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50">
                    {resources.pages.length}
                  </span>
                  <span className="text-[10px] text-white/40">(opcional, requerido para crear anuncios)</span>
                </div>
                {resources.pages.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-white/50">
                    No tienes páginas. Puedes crearla más tarde y volver aquí.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {resources.pages.map((p) => {
                      const picked = pickedPage === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPickedPage(picked ? "" : p.id)}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            picked
                              ? "border-[#1877F2] bg-[#1877F2]/10 ring-2 ring-[#1877F2]/30"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                          }`}
                        >
                          {p.picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.picture} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                              <ImageIcon size={16} className="text-white/40" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                            <p className="truncate text-[11px] text-white/40">{p.category || "Página"}</p>
                          </div>
                          {picked && <Check size={16} className="shrink-0 text-[#1877F2]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <p className="text-[11px] text-white/40">
                Tu token se guardó encriptado. Lo puedes desconectar cuando quieras.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeSelector}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveSelection}
                  disabled={!pickedAdAccount || phase === "saving"}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1466d1] hover:shadow-md disabled:opacity-50"
                >
                  {phase === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Guardar y conectar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
