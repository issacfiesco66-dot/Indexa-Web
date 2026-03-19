"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { normalizeRole } from "@/types/tenant";

function AgencyGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (!db) { setAllowed(true); return; }

    (async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
          const snap = await getDoc(doc(db, "usuarios", user.uid));
          if (snap.exists()) {
            const role = normalizeRole(snap.data().role);
            if (role === "superadmin") {
              // Superadmin can access agency panel too
              setAllowed(true);
              return;
            }
            if (role === "agency") {
              setAllowed(true);
              return;
            }
          }
          // Not agency — redirect
          router.replace("/admin/login");
          return;
        } catch {
          // Retry
        }
      }
      router.replace("/admin/login");
    })();
  }, [user, loading, router]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AgencyGuard>{children}</AgencyGuard>
    </AuthProvider>
  );
}
