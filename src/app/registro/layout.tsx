"use client";

import { AuthProvider } from "@/lib/AuthContext";

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
