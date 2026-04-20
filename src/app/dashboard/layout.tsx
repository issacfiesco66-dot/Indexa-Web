"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { BrandingProvider } from "@/lib/BrandingContext";
import { normalizeRole } from "@/types/tenant";
import TrialBanner from "@/components/TrialBanner";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, trial } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [sitioId, setSitioId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!db) { setAllowed(true); return; }

    (async () => {
      // Retry up to 3 times — Firestore can reject reads right after login
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
          const snap = await getDoc(doc(db, "usuarios", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            const role = normalizeRole(data.role);
            if (role === "superadmin") {
              router.replace("/admin/dashboard");
              return;
            }
            if (role === "agency") {
              router.replace("/agency/dashboard");
              return;
            }
            if (typeof data.sitioId === "string" && data.sitioId) {
              setSitioId(data.sitioId);
            }
          }
          break; // Read succeeded, user is client — allow through
        } catch {
          // Retry
        }
      }
      setAllowed(true);
    })();
  }, [user, loading, router]);

  // Route expired trials to the dedicated conversion page (once per navigation).
  // Skip if already on it or if still in active trial / converted user.
  useEffect(() => {
    if (!allowed) return;
    if (!trial.expired) return;
    if (pathname === "/dashboard/trial-expirado") return;
    router.replace("/dashboard/trial-expirado");
  }, [allowed, trial.expired, pathname, router]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <TrialBanner sitioId={sitioId} />
      {children}
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardGuard>
        <BrandingProvider>{children}</BrandingProvider>
      </DashboardGuard>
    </AuthProvider>
  );
}
