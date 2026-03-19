"use client";

import { useEffect, useCallback } from "react";
import { doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

function getDeviceType(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

function getVisitCount(sitioId: string): number {
  if (typeof window === "undefined") return 1;
  const key = `indexa_visits_${sitioId}`;
  const current = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, String(current));
  return current;
}

export function useTrackView(sitioId: string, slug?: string) {
  useEffect(() => {
    if (!db || !sitioId) return;

    const dispositivo = getDeviceType();
    const visitCount = getVisitCount(sitioId);

    const updates: Record<string, unknown> = {
      vistas: increment(1),
      ultimaVistaAt: serverTimestamp(),
      dispositivo,
    };

    // Heat-Score: if same visitor comes 3+ times, bump interesNivel
    if (visitCount >= 3) {
      updates.interesNivel = increment(1);
    }

    updateDoc(doc(db, "sitios", sitioId), updates).catch(() => {});

    // Also track demo view for the linked prospecto (fire-and-forget)
    const trackSlug = slug || sitioId;
    fetch("/api/prospectos/track-demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: trackSlug }),
    }).catch(() => {});
  }, [sitioId, slug]);
}

export function useTrackWhatsAppClick(sitioId: string) {
  return useCallback(() => {
    if (!db || !sitioId) return;
    updateDoc(doc(db, "sitios", sitioId), {
      clicsWhatsApp: increment(1),
    }).catch(() => {});
  }, [sitioId]);
}

export default function SitioTracker({ sitioId, slug }: { sitioId: string; slug?: string }) {
  useTrackView(sitioId, slug);
  return null;
}
