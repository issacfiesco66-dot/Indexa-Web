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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      // Set/clear auth cookie so Next.js middleware can detect session
      if (u) {
        const token = await u.getIdToken();
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60}; SameSite=Lax`;

        // Set role cookie for maintenance mode bypass
        if (db) {
          try {
            const snap = await getDoc(doc(db, "usuarios", u.uid));
            const role = snap.exists() ? snap.data().role : "cliente";
            document.cookie = `indexa_role=${role}; path=/; max-age=${60 * 60}; SameSite=Lax`;
          } catch {
            // Firestore may not be ready yet — role cookie will be set on next auth state change
          }
        }
      } else {
        document.cookie = "firebaseAuthToken=; path=/; max-age=0";
        document.cookie = "indexa_role=; path=/; max-age=0";
      }
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
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
