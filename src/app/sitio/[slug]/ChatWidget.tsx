"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SitioInfo {
  nombre: string;
  categoria: string;
  ciudad: string;
  servicios: string[];
  descripcion: string;
  direccion: string;
  whatsapp: string;
  horarios: string;
}

interface ChatWidgetProps {
  sitio: SitioInfo;
  colorPrincipal: string;
  modo?: "demo" | "live";
}

export default function ChatWidget({ sitio, colorPrincipal, modo = "live" }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat-vendedor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sitio,
          modo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Lo siento, hubo un error. Intenta de nuevo." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, sitio, modo]);

  const greeting = modo === "demo"
    ? `Hola, soy el asistente IA de *${sitio.nombre}*. Estás viendo el modo demo — pregúntame lo que sea sobre el negocio o ponme a prueba con objeciones. Estoy listo.`
    : `Hola, bienvenido a *${sitio.nombre}*. ¿En qué puedo ayudarte hoy?`;

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting }]);
    }
  };

  // Format *bold* text to <strong>
  const formatText = (text: string) => {
    return text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  };

  return (
    <>
      {/* Chat bubble button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110 hover:shadow-3xl"
          style={{ backgroundColor: colorPrincipal }}
          aria-label="Abrir chat"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          {modo === "demo" && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
              IA
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:bottom-6 sm:right-6">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: colorPrincipal }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{sitio.nombre}</p>
                <p className="text-[11px] text-white/70">
                  {modo === "demo" ? "Modo Demo — Asistente IA" : "Asistente Virtual"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              aria-label="Cerrar chat"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-gray-800 text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm border border-gray-100"
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                />
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={modo === "demo" ? "Ponme a prueba..." : "Escribe tu mensaje..."}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-gray-300 focus:bg-white"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: colorPrincipal }}
                aria-label="Enviar mensaje"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            {modo === "demo" && (
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Demo de INDEXA-Bot — Así atendería a tus clientes 24/7
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
