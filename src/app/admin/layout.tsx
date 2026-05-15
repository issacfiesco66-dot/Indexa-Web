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
  Building2,
  Video,
  TrendingUp,
  Megaphone,
  Shield,
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
  { href: "/admin/clientes", label: "Clientes", icon: Building2 },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/prospectos", label: "Prospección Fría", icon: UserSearch },
  { href: "/admin/seguimientos", label: "Seguimientos", icon: Clock },
  { href: "/admin/mensajeria", label: "Mensajería", icon: MessageSquare },
  { href: "/admin/radar", label: "Radar", icon: Radar },
  { href: "/admin/ventas", label: "Ventas", icon: TrendingUp },
  { href: "/admin/agencias", label: "Agencias", icon: Shield },
  { href: "/admin/campanas/tiktok", label: "TikTok Ads", icon: Video },
  { href: "/admin/campanas/facebook", label: "Facebook Ads", icon: Megaphone },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

// Items visibles para el rol "subadmin" (cold outreach only).
const SUBADMIN_HREFS = new Set([
  "/admin/prospectos",
  "/admin/seguimientos",
  "/admin/mensajeria",
]);

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, role, signOut } = useAuth();
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

  // Login page never gets the admin shell — render bare so it can handle
  // its own redirects (logged-in users get bounced to /admin/dashboard).
  if (isLoginPage) return <>{children}</>;

  if (loading || !authSettled) {
    return (
      <div className="flex h-screen items-center justify-center bg-indexa-gray-light">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-indexa-gray-light">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0a0e27] transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
              <span className="text-sm font-black text-white">IX</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">INDEXA</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.filter((item) =>
              role === "subadmin" ? SUBADMIN_HREFS.has(item.href) : true
            ).map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {item.href === "/admin/radar" && hotCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-indexa-orange to-orange-500 px-1.5 text-[10px] font-bold text-white">
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
        <div className="border-t border-white/10 p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
            className="rounded-lg p-2 text-indexa-gray-dark hover:bg-indexa-gray-light lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold text-indexa-gray-dark">
            {NAV_ITEMS.find((i) => pathname === i.href || pathname?.startsWith(i.href + "/"))?.label ?? "Admin"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs font-medium text-gray-400 sm:block">{user?.email}</span>
          </div>
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
