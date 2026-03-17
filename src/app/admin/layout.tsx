"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserSearch,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Radar,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/prospectos", label: "Prospección Fría", icon: UserSearch },
  { href: "/admin/seguimientos", label: "Seguimientos", icon: Clock },
  { href: "/admin/mensajeria", label: "Mensajería", icon: MessageSquare },
  { href: "/admin/radar", label: "Radar", icon: Radar },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hotCount, setHotCount] = useState(0);
  const [authSettled, setAuthSettled] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Wait a tick after loading finishes so onAuthStateChanged can propagate
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setAuthSettled(true), 500);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    if (!authSettled || loading) return;
    if (!user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [user, authSettled, loading, router, isLoginPage]);

  // ── Hot prospect counter for Radar badge ─────────────────────────
  useEffect(() => {
    if (!db || !user) return;
    const q = query(
      collection(db, "sitios"),
      where("statusPago", "in", ["demo", "publicado"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const cutoff48h = now - 48 * 60 * 60 * 1000;
      let count = 0;
      for (const d of snapshot.docs) {
        const raw = d.data();
        const ts = raw.ultimaVistaAt as Timestamp | undefined;
        if (!ts) continue;
        const t = ts.toDate().getTime();
        if (t >= cutoff48h && (raw.vistas ?? 0) >= 5) count++;
      }
      setHotCount(count);
    }, (err) => {
      console.error("Hot prospect listener error:", err.message);
    });
    return unsubscribe;
  }, [user]);

  if (loading || (!authSettled && !isLoginPage)) {
    return (
      <div className="flex h-screen items-center justify-center bg-indexa-gray-light">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (isLoginPage) return <>{children}</>;
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-indexa-gray-light">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
          <Link href="/admin/dashboard" className="text-xl font-extrabold tracking-tight text-indexa-blue">
            INDEXA
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indexa-blue/10 text-indexa-blue"
                        : "text-indexa-gray-dark hover:bg-gray-50 hover:text-indexa-blue"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {item.href === "/admin/radar" && hotCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {hotCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-indexa-gray-dark">
            {NAV_ITEMS.find((i) => pathname === i.href || pathname?.startsWith(i.href + "/"))?.label ?? "Admin"}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
