"use client";

import { AuthProvider } from "@/lib/AuthContext";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
