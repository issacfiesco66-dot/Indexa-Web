"use client";

import { useEffect, useCallback } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export function useTrackView(sitioId: string) {
  useEffect(() => {
    if (!db || !sitioId) return;
    updateDoc(doc(db, "sitios", sitioId), {
      vistas: increment(1),
    }).catch(() => {});
  }, [sitioId]);
}

export function useTrackWhatsAppClick(sitioId: string) {
  return useCallback(() => {
    if (!db || !sitioId) return;
    updateDoc(doc(db, "sitios", sitioId), {
      clicsWhatsApp: increment(1),
    }).catch(() => {});
  }, [sitioId]);
}

export default function SitioTracker({ sitioId }: { sitioId: string }) {
  useTrackView(sitioId);
  return null;
}
