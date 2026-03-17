"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

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
          if (snap.exists() && snap.data().role === "admin") {
            router.replace("/admin/dashboard");
            return;
          }
          break; // Read succeeded, user is not admin — allow through
        } catch {
          // Retry
        }
      }
      setAllowed(true);
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </AuthProvider>
  );
}
