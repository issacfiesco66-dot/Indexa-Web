"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { Users, UserPlus, TrendingUp } from "lucide-react";
import type { LeadStatus } from "@/types/lead";

export default function DashboardPage() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [nuevosHoy, setNuevosHoy] = useState(0);
  const [vendidos, setVendidos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const leadsRef = collection(db, "leads");
    const unsubscribe = onSnapshot(query(leadsRef), (snapshot) => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let total = 0;
      let hoy = 0;
      let sold = 0;

      snapshot.docs.forEach((d) => {
        total++;
        const raw = d.data();
        const status = (raw.status as LeadStatus) ?? "nuevo";
        const createdAt = raw.createdAt ? (raw.createdAt as Timestamp).toDate() : null;

        if (status === "vendido") sold++;
        if (createdAt && createdAt >= startOfDay) hoy++;
      });

      setTotalLeads(total);
      setNuevosHoy(hoy);
      setVendidos(sold);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const conversionRate = totalLeads > 0 ? Math.round((vendidos / totalLeads) * 100) : 0;

  const cards = [
    {
      label: "Total de Leads",
      value: totalLeads,
      icon: Users,
      color: "text-indexa-blue",
      bg: "bg-indexa-blue/10",
      border: "border-indexa-blue/20",
    },
    {
      label: "Nuevos Hoy",
      value: nuevosHoy,
      icon: UserPlus,
      color: "text-indexa-orange",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      label: "Tasa de Conversión",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Panel de Control</h2>
        <p className="mt-1 text-sm text-gray-500">Vista general de tu plataforma INDEXA.</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`flex items-center gap-5 rounded-2xl border bg-white p-6 shadow-sm ${card.border}`}
            >
              <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon size={26} className={card.color} />
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight text-indexa-gray-dark">{card.value}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!db && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          <strong>Firebase no configurado.</strong> Agrega tus credenciales en{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
          para ver datos reales.
        </div>
      )}
    </div>
  );
}
