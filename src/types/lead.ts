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
export type LeadType = "standard" | "b2b";

export interface Lead {
  id: string;
  contactName: string;
  businessName: string;
  phone: string;
  email: string;
  mensaje: string;
  status: LeadStatus;
  leadType: LeadType;
  createdAt: Date | null;
}

export type PlanType = "starter" | "profesional" | "enterprise";
export type StatusPago = "inactivo" | "activo" | "cancelado" | "vencido" | "demo" | "publicado";
export type TemplateId = "modern" | "elegant" | "minimalist";

export type BioLinkTipo = "whatsapp" | "oferta" | "cupon" | "reserva" | "menu" | "link";
export type BioSource = "fb" | "ig" | "tt" | "wa" | "direct";

export interface BioLink {
  id: string;
  tipo: BioLinkTipo;
  titulo: string;
  descripcion: string;
  url: string;
  emoji: string;
  activo: boolean;
}

export interface BioStats {
  visitas: Record<BioSource, number>;
  clicks: Record<string, Record<BioSource, number>>;
}

export interface Oferta {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  fechaFin: string;
  activa: boolean;
}

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
  heroImageUrl: string;
  galeria: string[];
  servicios: string[];
  vistas: number;
  clicsWhatsApp: number;
  ownerId: string;
  statusPago: StatusPago;
  plan: PlanType | "";
  fechaVencimiento: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  ultimoPagoAt: string | null;
  templateId: TemplateId;
  ciudad: string;
  categoria: string;
  latitud: string;
  longitud: string;
  horarios: string;
  googleMapsUrl: string;
  ofertasActivas: Oferta[];
  bioLinks: BioLink[];
  bioStats: BioStats;
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

export type TipoProspecto = "negocio" | "agencia";

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
  whatsappCount: number;
  ultimoWhatsAppAt: Date | null;
  tieneWeb: boolean;
  tipoProspecto: TipoProspecto;
}
