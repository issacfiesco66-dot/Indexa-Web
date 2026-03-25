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
  agencyId: string | null;
  agencyBranding: AgencyBranding | null;
  agencyName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "client",
  agencyId: null,
  agencyBranding: null,
  agencyName: "",
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("client");
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyBranding, setAgencyBranding] = useState<AgencyBranding | null>(null);
  const [agencyName, setAgencyName] = useState("");

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const token = await u.getIdToken();
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60}; SameSite=Strict; Secure`;

        if (db) {
          try {
            const snap = await getDoc(doc(db, "usuarios", u.uid));
            if (snap.exists()) {
              const data = snap.data();
              const normalized = normalizeRole(data.role);
              setRole(normalized);
              document.cookie = `indexa_role=${normalized}; path=/; max-age=${60 * 60}; SameSite=Strict; Secure`;

              // Resolve agency branding from agencias collection
              let resolvedAgencyId: string | null = null;

              if (normalized === "agency") {
                // Agency user: find their agencia doc by uid
                const { getDocs: gd, query: q, where: w, collection: col } = await import("firebase/firestore");
                const qs = q(col(db, "agencias"), w("uid", "==", u.uid));
                const agSnap = await gd(qs);
                if (!agSnap.empty) {
                  const agDoc = agSnap.docs[0];
                  resolvedAgencyId = agDoc.id;
                  const ag = agDoc.data();
                  if (ag.branding) {
                    setAgencyBranding(ag.branding as AgencyBranding);
                  }
                  setAgencyName(ag.nombreComercial || "");
                }
              } else if (normalized === "client" && data.agencyId) {
                // Client user: read their agency's branding
                resolvedAgencyId = data.agencyId;
                const agSnap = await getDoc(doc(db, "agencias", data.agencyId));
                if (agSnap.exists()) {
                  const ag = agSnap.data();
                  if (ag.branding) {
                    setAgencyBranding(ag.branding as AgencyBranding);
                  }
                  setAgencyName(ag.nombreComercial || "");
                }
              } else {
                setAgencyBranding(null);
                setAgencyName("");
              }

              setAgencyId(resolvedAgencyId);
            } else {
              setRole("client");
              document.cookie = `indexa_role=client; path=/; max-age=${60 * 60}; SameSite=Strict; Secure`;
            }
          } catch {
            // Firestore may not be ready yet
          }
        }
      } else {
        setRole("client");
        setAgencyId(null);
        setAgencyBranding(null);
        setAgencyName("");
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
    <AuthContext.Provider value={{ user, loading, role, agencyId, agencyBranding, agencyName, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
