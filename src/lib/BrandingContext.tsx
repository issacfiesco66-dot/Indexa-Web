"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { AgencyBranding } from "@/types/tenant";

interface BrandingContextType {
  /** The visual branding to apply (agency's or INDEXA default) */
  branding: AgencyBranding;
  /** Agency commercial name */
  brandName: string;
  /** True while loading branding from Firestore */
  loading: boolean;
  /** Whether this client belongs to a white-label agency — hides all INDEXA refs */
  isWhiteLabel: boolean;
}

const INDEXA_DEFAULT: AgencyBranding = {
  logoUrl: "",
  colorPrincipal: "#002366",
};

const BrandingContext = createContext<BrandingContextType>({
  branding: INDEXA_DEFAULT,
  brandName: "INDEXA",
  loading: true,
  isWhiteLabel: false,
});

/**
 * Wraps client dashboard pages. Resolves the agency branding chain:
 *   usuario.agencyId → agencias/{agencyId}.branding
 * If the user belongs to an agency, injects CSS variables and hides INDEXA branding.
 * Falls back to INDEXA defaults for direct clients.
 */
export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user, role, agencyId: authAgencyId, agencyBranding, agencyName, loading: authLoading } = useAuth();
  const [branding, setBranding] = useState<AgencyBranding>(INDEXA_DEFAULT);
  const [brandName, setBrandName] = useState("INDEXA");
  const [loading, setLoading] = useState(true);
  const [isWhiteLabel, setIsWhiteLabel] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // If AuthContext already resolved agency branding (for agency or client users)
    if (agencyBranding && authAgencyId) {
      setBranding(agencyBranding);
      setBrandName(agencyName || "Agency");
      setIsWhiteLabel(true);
    } else if (role === "client" && user && db) {
      // Fallback: read agencyId from user doc → agencias collection
      (async () => {
        try {
          const userSnap = await getDoc(doc(db, "usuarios", user.uid));
          const userAgencyId = userSnap.data()?.agencyId;
          if (!userAgencyId) { setLoading(false); return; }

          const agSnap = await getDoc(doc(db, "agencias", userAgencyId));
          if (agSnap.exists()) {
            const ag = agSnap.data();
            if (ag.branding) {
              setBranding(ag.branding as AgencyBranding);
              setBrandName(ag.nombreComercial || "Agency");
              setIsWhiteLabel(true);
            }
          }
        } catch (err) {
          console.error("BrandingProvider: error resolving branding:", err);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    setLoading(false);
  }, [user, role, authAgencyId, agencyBranding, agencyName, authLoading]);

  // Inject CSS custom properties for white-label theming
  useEffect(() => {
    if (!isWhiteLabel) return;
    document.documentElement.style.setProperty("--color-primary", branding.colorPrincipal);
    return () => {
      document.documentElement.style.removeProperty("--color-primary");
    };
  }, [isWhiteLabel, branding.colorPrincipal]);

  return (
    <BrandingContext.Provider value={{ branding, brandName, loading, isWhiteLabel }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
