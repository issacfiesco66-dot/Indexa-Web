"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { normalizeRole, type UserRole, type AgencyBranding } from "@/types/tenant";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  agencyBranding: AgencyBranding | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "client",
  agencyBranding: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("client");
  const [agencyBranding, setAgencyBranding] = useState<AgencyBranding | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      // Set/clear auth cookie so Next.js middleware can detect session
      if (u) {
        const token = await u.getIdToken();
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60}; SameSite=Lax`;

        // Read role + branding from Firestore
        if (db) {
          try {
            const snap = await getDoc(doc(db, "usuarios", u.uid));
            if (snap.exists()) {
              const data = snap.data();
              const normalized = normalizeRole(data.role);
              setRole(normalized);
              document.cookie = `indexa_role=${normalized}; path=/; max-age=${60 * 60}; SameSite=Lax`;

              // If agency, store branding
              if (normalized === "agency" && data.branding) {
                setAgencyBranding(data.branding as AgencyBranding);
              } else {
                setAgencyBranding(null);
              }
            } else {
              setRole("client");
              document.cookie = `indexa_role=client; path=/; max-age=${60 * 60}; SameSite=Lax`;
            }
          } catch {
            // Firestore may not be ready yet — role will be set on next auth state change
          }
        }
      } else {
        setRole("client");
        setAgencyBranding(null);
        document.cookie = "firebaseAuthToken=; path=/; max-age=0";
        document.cookie = "indexa_role=; path=/; max-age=0";
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth no está configurado.");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, agencyBranding, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
