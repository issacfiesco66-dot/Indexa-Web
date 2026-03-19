/**
 * Multi-Tenant White-Label types for INDEXA.
 *
 * Roles:
 *  - superadmin: Full platform access (/admin/*)
 *  - agency:     White-label reseller, manages their own clients (/agency/*)
 *  - client:     End-user with a single site (/dashboard/*)
 *
 * Backward compat: existing "admin" role is treated as "superadmin".
 */

export type UserRole = "superadmin" | "agency" | "client";

/** Stored on usuarios/{uid} when role === "agency" */
export interface AgencyBranding {
  logoUrl: string;
  colorPrincipal: string;       // hex color, e.g. "#FF6600"
  agencyName?: string;          // display name shown to clients
}

/** Firestore document: usuarios/{uid} */
export interface UsuarioDoc {
  role: UserRole;
  email: string;
  displayName: string;
  sitioId?: string;             // for "client" role — their linked site
  branding?: AgencyBranding;    // for "agency" role — white-label config
  createdAt?: string;
}

/** Firestore document: sitios/{id} — only the new field */
export interface SitioAgencyFields {
  agencyId?: string;            // uid of the agency that owns this client
}

/** Maps legacy role strings to the new enum */
export function normalizeRole(raw: string | undefined): UserRole {
  if (raw === "admin" || raw === "superadmin") return "superadmin";
  if (raw === "agency") return "agency";
  return "client";   // "cliente" | "client" | undefined → client
}
