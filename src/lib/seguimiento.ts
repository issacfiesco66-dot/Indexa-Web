/**
 * Utilidad de seguimiento para prospectos de INDEXA.
 * Detecta prospectos inactivos que necesitan follow-up.
 */

import {
  collection,
  query,
  where,
  getDocs,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { ProspectoFrio, ProspectoStatus } from "@/types/lead";

const DIAS_INACTIVIDAD = 3;
const MAX_NIVEL_SEGUIMIENTO = 2;
const STATUSES_EXCLUIDOS: ProspectoStatus[] = ["vendido", "rechazado", "nuevo"];

/**
 * Consulta Firestore y devuelve los prospectos que cumplen estas condiciones:
 * 1. `fechaUltimoContacto` fue hace más de 3 días.
 * 2. `nivelSeguimiento` es menor a 2.
 * 3. Su status no es 'vendido', 'rechazado' ni 'nuevo'.
 */
export async function obtenerProspectosParaSeguimiento(): Promise<ProspectoFrio[]> {
  if (!db) return [];

  const ahora = new Date();
  const limiteInactividad = new Date(ahora.getTime() - DIAS_INACTIVIDAD * 24 * 60 * 60 * 1000);

  // Query: nivelSeguimiento < MAX_NIVEL_SEGUIMIENTO
  // Firestore only allows one inequality filter per query,
  // so we filter fechaUltimoContacto and status client-side.
  const q = query(
    collection(db, "prospectos_frios"),
    where("nivelSeguimiento", "<", MAX_NIVEL_SEGUIMIENTO)
  );

  const snapshot = await getDocs(q);

  const resultados: ProspectoFrio[] = [];

  for (const d of snapshot.docs) {
    const raw = d.data();
    const status = (raw.status as ProspectoStatus) ?? "nuevo";

    // Excluir statuses que no necesitan seguimiento
    if (STATUSES_EXCLUIDOS.includes(status)) continue;

    // Debe tener fechaUltimoContacto
    const fechaRaw = raw.fechaUltimoContacto as Timestamp | null;
    if (!fechaRaw) continue;

    const fechaUltimoContacto = fechaRaw.toDate();

    // Debe haber pasado más de 3 días desde el último contacto
    if (fechaUltimoContacto >= limiteInactividad) continue;

    resultados.push({
      id: d.id,
      nombre: raw.nombre ?? "",
      slug: raw.slug ?? "",
      email: raw.email ?? "",
      direccion: raw.direccion ?? "",
      telefono: raw.telefono ?? "",
      categoria: raw.categoria ?? "",
      ciudad: raw.ciudad ?? "",
      status,
      importedAt: raw.importedAt ? (raw.importedAt as Timestamp).toDate() : null,
      fechaUltimoContacto,
      vistasDemo: raw.vistasDemo ?? 0,
      nivelSeguimiento: raw.nivelSeguimiento ?? 0,
      demoSlug: raw.demoSlug ?? "",
      whatsappCount: raw.whatsappCount ?? 0,
      ultimoWhatsAppAt: raw.ultimoWhatsAppAt ? (raw.ultimoWhatsAppAt as Timestamp).toDate() : null,
      tieneWeb: raw.tieneWeb ?? false,
    });
  }

  // Ordenar por fecha de último contacto (más antiguo primero)
  resultados.sort((a, b) => {
    const fa = a.fechaUltimoContacto?.getTime() ?? 0;
    const fb = b.fechaUltimoContacto?.getTime() ?? 0;
    return fa - fb;
  });

  return resultados;
}
