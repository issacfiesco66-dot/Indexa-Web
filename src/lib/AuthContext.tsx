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

export interface TrialStatus {
  inTrial: boolean;
  expired: boolean;
  daysLeft: number;
  endsAt: Date | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  agencyId: string | null;
  agencyBranding: AgencyBranding | null;
  agencyName: string;
  trial: TrialStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const DEFAULT_TRIAL: TrialStatus = {
  inTrial: false,
  expired: false,
  daysLeft: 0,
  endsAt: null,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "client",
  agencyId: null,
  agencyBranding: null,
  agencyName: "",
  trial: DEFAULT_TRIAL,
  signIn: async () => {},
  signOut: async () => {},
});

function computeTrialStatus(
  trialEndsAtRaw: unknown,
  trialStatusRaw: unknown
): TrialStatus {
  if (typeof trialEndsAtRaw !== "string" || !trialEndsAtRaw) return DEFAULT_TRIAL;
  const endsAt = new Date(trialEndsAtRaw);
  if (isNaN(endsAt.getTime())) return DEFAULT_TRIAL;
  const msLeft = endsAt.getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
  const notCancelled = trialStatusRaw !== "converted" && trialStatusRaw !== "cancelled";
  return {
    inTrial: msLeft > 0 && notCancelled,
    expired: msLeft <= 0 && notCancelled,
    daysLeft,
    endsAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("client");
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyBranding, setAgencyBranding] = useState<AgencyBranding | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [trial, setTrial] = useState<TrialStatus>(DEFAULT_TRIAL);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        // Await the HttpOnly auth cookie set — must complete before loading
        // flips to false, otherwise the login page redirects to /admin/dashboard
        // before middleware can see the cookie and bounces back to login.
        try {
          const token = await u.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        } catch (err) {
          console.error("Session cookie set failed:", err);
        }

        if (db) {
          // Retry up to 3 times — Firestore can reject reads right after login
          // because the auth token hasn't propagated yet.
          let snap: Awaited<ReturnType<typeof getDoc>> | null = null;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              if (attempt > 0) await new Promise((r) => setTimeout(r, 500));
              snap = await getDoc(doc(db, "usuarios", u.uid));
              break;
            } catch (err) {
              console.error(`Auth role read attempt ${attempt + 1} failed:`, err);
            }
          }

          if (snap && snap.exists()) {
            const data = snap.data();
            const normalized = normalizeRole(data.role);
            setRole(normalized);
            setTrial(computeTrialStatus(data.trialEndsAt, data.trialStatus));
            document.cookie = `indexa_role=${normalized}; path=/; max-age=${60 * 60}; SameSite=Strict; Secure`;

            // Resolve agency branding from agencias collection
            let resolvedAgencyId: string | null = null;

            try {
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
            } catch (err) {
              console.error("Agency branding fetch failed:", err);
            }

            setAgencyId(resolvedAgencyId);
          } else if (snap) {
            setRole("client");
            setTrial(DEFAULT_TRIAL);
            document.cookie = `indexa_role=client; path=/; max-age=${60 * 60}; SameSite=Strict; Secure`;
          }
          // If snap is null (all 3 attempts failed), leave role cookie unset;
          // the consumer page can decide whether to retry or surface an error.
        }
      } else {
        setRole("client");
        setAgencyId(null);
        setAgencyBranding(null);
        setAgencyName("");
        setTrial(DEFAULT_TRIAL);
        // Clear auth cookie via server endpoint (HttpOnly)
        fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
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
    <AuthContext.Provider value={{ user, loading, role, agencyId, agencyBranding, agencyName, trial, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useTrialStatus = (): TrialStatus => useContext(AuthContext).trial;
