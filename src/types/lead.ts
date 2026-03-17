export interface LeadFormData {
  contactName: string;
  businessName: string;
  phone: string;
  email: string;
  mensaje: string;
}

export interface LeadFormErrors {
  contactName?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  mensaje?: string;
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
}

export type LeadStatus = "nuevo" | "contactado" | "vendido";

export interface Lead {
  id: string;
  contactName: string;
  businessName: string;
  phone: string;
  email: string;
  mensaje: string;
  status: LeadStatus;
  createdAt: Date | null;
}

export type PlanType = "starter" | "profesional" | "enterprise";
export type StatusPago = "inactivo" | "activo" | "cancelado" | "vencido" | "demo" | "publicado";
export type TemplateId = "modern" | "elegant" | "minimalist";

export interface SitioData {
  nombre: string;
  slug: string;
  descripcion: string;
  eslogan: string;
  whatsapp: string;
  emailContacto: string;
  direccion: string;
  colorPrincipal: string;
  logoUrl: string;
  servicios: string[];
  vistas: number;
  clicsWhatsApp: number;
  ownerId: string;
  statusPago: StatusPago;
  plan: PlanType | "";
  fechaVencimiento: string | null;
  stripeCustomerId: string;
  templateId: TemplateId;
  horarios: string;
  googleMapsUrl: string;
}

export interface UserProfile {
  role: "admin" | "cliente";
  sitioId: string;
  displayName: string;
}

export type ProspectoStatus =
  | "nuevo"
  | "contactado"
  | "contactado_wa"
  | "correo_enviado"
  | "demo_generada"
  | "vendido"
  | "rechazado";

export interface ProspectoFrio {
  id: string;
  nombre: string;
  slug: string;
  email: string;
  direccion: string;
  telefono: string;
  categoria: string;
  ciudad: string;
  status: ProspectoStatus;
  importedAt: Date | null;
  fechaUltimoContacto: Date | null;
  vistasDemo: number;
  nivelSeguimiento: number;
  demoSlug: string;
}
