"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { Lead, LeadStatus } from "@/types/lead";
import { Phone, Mail, ChevronDown } from "lucide-react";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "vendido", label: "Vendido" },
];

const STATUS_STYLES: Record<LeadStatus, { badge: string; dot: string }> = {
  nuevo: { badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  contactado: { badge: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  vendido: { badge: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

function StatusDropdown({
  status,
  leadId,
  onUpdate,
}: {
  status: LeadStatus;
  leadId: string;
  onUpdate: (id: string, newStatus: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.nuevo;
  const label = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${style.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        {label}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1.5 w-40 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
            {STATUS_OPTIONS.map((opt) => {
              const s = STATUS_STYLES[opt.value];
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onUpdate(leadId, opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-gray-50 ${
                    opt.value === status ? "font-bold text-indexa-blue" : "text-indexa-gray-dark"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Lead[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          contactName: raw.contactName ?? "",
          businessName: raw.businessName ?? "",
          phone: raw.phone ?? "",
          email: raw.email ?? "",
          mensaje: raw.mensaje ?? "",
          status: (raw.status as LeadStatus) ?? "nuevo",
          createdAt: raw.createdAt ? (raw.createdAt as Timestamp).toDate() : null,
        };
      });
      setLeads(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleStatusUpdate = useCallback(async (id: string, newStatus: LeadStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "leads", id), { status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!db) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <strong>Firebase no configurado.</strong> Agrega tus credenciales en{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">.env.local</code>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Gestión de Leads</h2>
        <p className="mt-1 text-sm text-gray-500">{leads.length} lead{leads.length !== 1 && "s"} en total.</p>
      </div>

      {/* Responsive table wrapper — horizontal scroll on mobile */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-indexa-gray-light">
                <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Fecha</th>
                <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Negocio</th>
                <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Contacto</th>
                <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Teléfono</th>
                <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    Aún no hay leads. Llegarán cuando alguien llene el formulario de la landing page.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {lead.createdAt
                        ? lead.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-indexa-gray-dark">{lead.businessName}</td>
                    <td className="px-6 py-4">
                      <div className="text-indexa-gray-dark">{lead.contactName}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <Mail size={11} />
                        {lead.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-indexa-blue hover:underline">
                        <Phone size={13} />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <StatusDropdown status={lead.status} leadId={lead.id} onUpdate={handleStatusUpdate} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
