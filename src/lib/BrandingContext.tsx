"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { AgencyBranding } from "@/types/tenant";

interface BrandingContextType {
  /** The visual branding to apply (agency's or INDEXA default) */
  branding: AgencyBranding;
  /** True while loading branding from Firestore */
  loading: boolean;
  /** Whether this client belongs to a white-label agency */
  isWhiteLabel: boolean;
}

const INDEXA_DEFAULT: AgencyBranding = {
  logoUrl: "",
  colorPrincipal: "#002366",
  agencyName: "INDEXA",
};

const BrandingContext = createContext<BrandingContextType>({
  branding: INDEXA_DEFAULT,
  loading: true,
  isWhiteLabel: false,
});

/**
 * Wraps client dashboard pages. Resolves the agency branding chain:
 *   usuario → sitio.agencyId → agency usuario.branding
 * If no agency is found, falls back to INDEXA defaults.
 */
export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [branding, setBranding] = useState<AgencyBranding>(INDEXA_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [isWhiteLabel, setIsWhiteLabel] = useState(false);

  useEffect(() => {
    if (authLoading || !user || !db) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // 1. Get user's sitioId
        const userSnap = await getDoc(doc(db, "usuarios", user.uid));
        const sitioId = userSnap.data()?.sitioId;
        if (!sitioId) { setLoading(false); return; }

        // 2. Get the site's agencyId
        const sitioSnap = await getDoc(doc(db, "sitios", sitioId));
        const agencyId = sitioSnap.data()?.agencyId;
        if (!agencyId) { setLoading(false); return; }

        // 3. Get the agency's branding
        const agencySnap = await getDoc(doc(db, "usuarios", agencyId));
        const agencyData = agencySnap.data();
        if (agencyData?.branding) {
          setBranding({
            logoUrl: agencyData.branding.logoUrl || "",
            colorPrincipal: agencyData.branding.colorPrincipal || "#002366",
            agencyName: agencyData.branding.agencyName || agencyData.displayName || "Agency",
          });
          setIsWhiteLabel(true);
        }
      } catch (err) {
        console.error("BrandingProvider: error resolving agency branding:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  return (
    <BrandingContext.Provider value={{ branding, loading, isWhiteLabel }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
