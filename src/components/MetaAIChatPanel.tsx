"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bot, Send, Loader2, X, Zap } from "lucide-react";
import type { User } from "firebase/auth";

// ── Types ─────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MetaAIChatPanelProps {
  user: User;
  /** Meta Ads token (legacy — prefer credentialPayload) */
  metaToken?: string;
  /** Meta Ad Account ID (legacy — prefer credentialPayload) */
  adAccountId?: string;
  /** API endpoint to call (default: /api/meta-ads/ai) */
  apiEndpoint?: string;
  /** Flexible credential payload sent in request body (for Meta or TikTok) */
  credentialPayload?: Record<string, string>;
  /** SitioId for savings logging */
  sitioId?: string | null;
  /** Optional extra context appended to the system prompt server-side */
  context?: string;
  /** If provided, auto-sends this message on first mount */
  autoMessage?: string;
  /** Dark theme (for analisis-express) vs light (default) */
  darkMode?: boolean;
  /** Example prompt chips shown when chat is empty */
  examplePrompts?: string[];
  /** Custom empty-state title */
  emptyStateTitle?: string;
  /** Custom empty-state description */
  emptyStateDesc?: string;
}

// ── Component ─────────────────────────────────────────────────────
export default function MetaAIChatPanel({
  user,
  metaToken,
  adAccountId,
  apiEndpoint = "/api/meta-ads/ai",
  credentialPayload,
  sitioId,
  context,
  autoMessage,
  darkMode = false,
  examplePrompts,
  emptyStateTitle,
  emptyStateDesc,
}: MetaAIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoTriggered = useRef(false);

  // ── Auto-scroll on new messages ─────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Send message ────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg = text.trim();
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
      setLoading(true);

      try {
        const authToken = await user.getIdToken();
        // Build credentials: prefer credentialPayload, fallback to legacy metaToken/adAccountId
        const creds = credentialPayload || { metaToken: metaToken || "", adAccountId: adAccountId || "" };
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            message: userMsg,
            history,
            ...creds,
            ...(sitioId ? { sitioId } : {}),
            ...(context ? { context } : {}),
          }),
        });
        const data = await res.json();

        if (data.error) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `❌ ${data.error}` },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
          setHistory(data.newHistory || []);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ Error de conexión. Intenta de nuevo." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [user, metaToken, adAccountId, apiEndpoint, credentialPayload, context, history, loading],
  );

  // ── Auto-trigger first message ──────────────────────────────
  useEffect(() => {
    if (autoMessage && !autoTriggered.current) {
      autoTriggered.current = true;
      sendMessage(autoMessage);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMessage]);

  // ── Clear chat ──────────────────────────────────────────────
  const clearChat = () => {
    setMessages([]);
    setHistory([]);
    autoTriggered.current = false;
  };

  // ── Theme classes ───────────────────────────────────────────
  const t = darkMode
    ? {
        wrapper: "border-white/10 bg-white/[0.03]",
        msgArea: "bg-transparent",
        userBubble: "bg-indigo-600 text-white rounded-tr-none",
        aiBubble: "bg-white/10 border border-white/10 text-white/90 rounded-tl-none",
        aiAvatar: "bg-indigo-500/20",
        aiAvatarIcon: "text-indigo-400",
        dots: "bg-indigo-400",
        inputBorder: "border-white/10",
        inputBg: "bg-white/5 text-white placeholder:text-white/30 focus:border-indigo-400 focus:ring-indigo-500/20",
        sendBtn: "bg-indigo-600 text-white hover:bg-indigo-500",
        emptyIcon: "text-white/10",
        emptyTitle: "text-white/40",
        emptyDesc: "text-white/25",
        chipBorder: "border-white/10 hover:border-indigo-400/50 hover:bg-indigo-500/10 text-white/50 hover:text-indigo-300",
        clearBtn: "border-white/10 text-white/40 hover:bg-white/5",
        footer: "text-white/20",
        headerTitle: "text-white",
        headerDesc: "text-white/40",
        examplesBg: "bg-white/5 border-white/10",
        examplesTitle: "text-white/60",
      }
    : {
        wrapper: "border-gray-200 bg-white",
        msgArea: "bg-gray-50",
        userBubble: "bg-indigo-600 text-white rounded-tr-none",
        aiBubble: "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm",
        aiAvatar: "bg-indigo-100",
        aiAvatarIcon: "text-indigo-600",
        dots: "bg-indigo-400",
        inputBorder: "border-gray-200",
        inputBg: "bg-white text-gray-900 placeholder:text-gray-300 focus:border-indigo-400 focus:ring-indigo-100",
        sendBtn: "bg-indigo-600 text-white hover:bg-indigo-700",
        emptyIcon: "text-gray-200",
        emptyTitle: "text-gray-400",
        emptyDesc: "text-gray-300",
        chipBorder: "border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600",
        clearBtn: "border-gray-200 text-gray-500 hover:bg-gray-50",
        footer: "text-gray-300",
        headerTitle: "text-indexa-gray-dark",
        headerDesc: "text-gray-400",
        examplesBg: "bg-white border-gray-200",
        examplesTitle: "text-gray-700",
      };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${t.headerTitle}`}>
            <Bot size={20} className={t.aiAvatarIcon} />
            {emptyStateTitle || "Asistente IA de Campañas"}
          </h2>
          <p className={`mt-0.5 text-xs ${t.headerDesc}`}>
            {emptyStateDesc || "Describe lo que quieres en lenguaje natural y el asistente lo ejecuta en tu cuenta de Meta Ads."}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${t.clearBtn}`}
          >
            <X size={12} /> Limpiar chat
          </button>
        )}
      </div>

      {/* ── Example prompts ─────────────────────────────────── */}
      {examplePrompts && examplePrompts.length > 0 && messages.length === 0 && !loading && (
        <div className={`rounded-xl border p-3 text-xs ${t.examplesBg}`}>
          <p className={`font-semibold mb-1 ${t.examplesTitle}`}>Ejemplos de lo que puedes hacer:</p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {examplePrompts.map((ex) => (
              <button
                key={ex}
                onClick={() => sendMessage(ex)}
                className={`rounded-lg border px-2 py-1.5 text-left text-[11px] transition-colors ${t.chipBorder}`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat area ───────────────────────────────────────── */}
      <div className={`flex min-h-[400px] flex-col rounded-xl border ${t.wrapper}`}>
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${t.msgArea}`}>
          {messages.length === 0 && !loading ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              {autoMessage ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                  <p className={`text-sm font-medium ${t.emptyTitle}`}>Iniciando análisis...</p>
                </div>
              ) : (
                <>
                  <Bot size={36} className={t.emptyIcon} />
                  <p className={`mt-3 text-sm font-medium ${t.emptyTitle}`}>
                    {emptyStateTitle || "Hola, soy tu asistente de Meta Ads."}
                  </p>
                  <p className={`mt-1 text-xs ${t.emptyDesc}`}>
                    Pregúntame sobre tus campañas o dime qué quieres hacer.
                  </p>
                </>
              )}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className={`mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${t.aiAvatar}`}>
                    <Bot size={14} className={t.aiAvatarIcon} />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === "user" ? t.userBubble : t.aiBubble}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {/* Loading dots */}
          {loading && (
            <div className="flex justify-start">
              <div className={`mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${t.aiAvatar}`}>
                <Bot size={14} className={t.aiAvatarIcon} />
              </div>
              <div className={`rounded-2xl rounded-tl-none border px-4 py-3 ${darkMode ? "bg-white/10 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                <div className="flex gap-1 items-center">
                  <span className={`h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0ms] ${t.dots}`} />
                  <span className={`h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:150ms] ${t.dots}`} />
                  <span className={`h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:300ms] ${t.dots}`} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ─────────────────────────────────────────── */}
        <div className={`border-t p-3 ${t.inputBorder}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Escribe tu mensaje... (Enter para enviar)"
              disabled={loading}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-50 ${t.inputBorder} ${t.inputBg}`}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors shrink-0 disabled:opacity-40 ${t.sendBtn}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
