/**
 * Presets de outreach para mercado USA-Hispano.
 *
 * Estos son los textos que el equipo usa al hacer outreach manual o masivo
 * a prospectos extraídos del scraper de Google Maps.
 *
 * Convención de variables:
 *   {{nombre}}    — nombre del contacto o del negocio
 *   {{negocio}}   — nombre del negocio (si distinto)
 *   {{ciudad}}    — ciudad / metro
 *   {{vertical}}  — "taller", "landscaping", "cleaning service", etc.
 *   {{landing}}   — URL de la landing vertical correspondiente
 *
 * Para WhatsApp Cloud API templates aprobadas por Meta, el orden de
 * sustitución corresponde a {{1}}, {{2}}, ... — usa `renderPreset()` o
 * `presetToBodyVars()`.
 */

import { INDEXA_SITE_URL } from "./seoSchemas";

export type OutreachVertical =
  | "mecanicos"
  | "landscaping"
  | "limpieza"
  | "construccion"
  | "plomeros"
  | "restaurantes"
  | "generico";

export type OutreachStage =
  | "cold_opener_text"
  | "cold_opener_audio_script"
  | "post_audit_followup"
  | "no_reply_followup_2d"
  | "no_reply_followup_5d"
  | "no_reply_followup_10d"
  | "objection_price"
  | "objection_busy"
  | "close_call_invite";

export interface OutreachPreset {
  id: string;
  stage: OutreachStage;
  vertical: OutreachVertical;
  /**
   * Tipo de delivery sugerido. "audio" implica que el texto es el GUION para
   * grabar — no se manda como texto, se manda como nota de voz.
   */
  delivery: "text" | "audio";
  body: string;
  /**
   * Variables que el texto requiere. Si faltan en runtime, `renderPreset` las
   * deja como `{{nombre}}` literal y se debe completar manualmente antes de enviar.
   */
  vars: string[];
}

const verticalLandingMap: Record<OutreachVertical, string> = {
  mecanicos: "/mecanicos-usa",
  landscaping: "/landscaping-usa",
  limpieza: "/limpieza-usa",
  construccion: "/construccion-usa",
  plomeros: "/plomeros-usa",
  restaurantes: "/usa",
  generico: "/usa",
};

const verticalLabel: Record<OutreachVertical, string> = {
  mecanicos: "taller",
  landscaping: "negocio de landscaping",
  limpieza: "cleaning service",
  construccion: "negocio de construcción",
  plomeros: "negocio de plomería",
  restaurantes: "restaurante",
  generico: "negocio",
};

export const OUTREACH_PRESETS_USA: OutreachPreset[] = [
  // -------------------- COLD OPENER (audio) --------------------
  {
    id: "cold_audio_v1",
    stage: "cold_opener_audio_script",
    vertical: "generico",
    delivery: "audio",
    vars: ["nombre", "negocio", "ciudad"],
    body: `Buenas {{nombre}}, te habla [tu nombre] de INDEXA. Vi que tienes el {{negocio}} ahí en {{ciudad}} — vimos tu perfil de Google y la verdad se ve que mueves bien, pero te están faltando un par de cosas en línea que te están haciendo perder clientes que te están buscando ahora mismo. Hacemos publicidad en español y en inglés para negocios como el tuyo. Si tienes 5 minutos te puedo mandar una auditoría gratis donde te muestro qué te falta y cuántos clientes estás perdiendo cada mes. ¿Te la mando?`,
  },
  {
    id: "cold_audio_mecanicos",
    stage: "cold_opener_audio_script",
    vertical: "mecanicos",
    delivery: "audio",
    vars: ["nombre", "negocio", "ciudad"],
    body: `Buenas {{nombre}}, te habla [tu nombre] de INDEXA. Vi tu taller {{negocio}} ahí en {{ciudad}} — se ve que mueves buen volumen pero noté que en Google estás apareciendo abajo de competidores que tienen menos reseñas que tú. Eso te está costando 20 a 40 clientes al mes. Trabajo con talleres hispanos en USA llenándoles la agenda con anuncios en español. Si tienes 5 minutos te mando una auditoría gratis con números reales. ¿Te la mando?`,
  },
  {
    id: "cold_audio_landscaping",
    stage: "cold_opener_audio_script",
    vertical: "landscaping",
    delivery: "audio",
    vars: ["nombre", "negocio", "ciudad"],
    body: `Buenas {{nombre}}, te habla [tu nombre] de INDEXA. Vi tu negocio de landscaping {{negocio}} ahí en {{ciudad}}. Mira, llevamos casi un año trabajando con landscapers hispanos en Houston y Miami llenándoles la agenda con contratos mensuales y proyectos de mulch, sod y diseño. Tu negocio se ve sólido pero noté que no estás capturando ni la mitad de los clientes que te están buscando en Google. Te puedo mandar una auditoría gratis donde te muestro la fuga, sin compromiso. ¿Te la mando?`,
  },

  // -------------------- COLD OPENER (texto, si no hay audio) --------------------
  {
    id: "cold_text_v1",
    stage: "cold_opener_text",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre", "negocio"],
    body: `Hola {{nombre}}, soy [tu nombre] de INDEXA. Vi que tienes {{negocio}} y trabajamos llenando agendas de negocios hispanos en USA con anuncios en español. ¿Te puedo mandar una auditoría gratis (sin compromiso) donde te muestro cuántos clientes estás perdiendo cada mes? Te la armo en 5 min.`,
  },

  // -------------------- POST AUDITORÍA --------------------
  {
    id: "post_audit_v1",
    stage: "post_audit_followup",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre"],
    body: `Perfecto {{nombre}}. Antes de mandarte la auditoría necesito 3 cositas para que sea útil:\n\n1. ¿En qué zona/ZIP estás trabajando ahora?\n2. ¿Cuál es el servicio que más te gustaría llenar?\n3. ¿Cuánto inviertes hoy en publicidad o flyers al mes?\n\nCon eso te mando un video corto de 3-5 min diciéndote qué te está faltando y qué resultado puedes esperar. Sin compromiso.`,
  },

  // -------------------- NO REPLY FOLLOWUPS --------------------
  {
    id: "noreply_d2",
    stage: "no_reply_followup_2d",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre"],
    body: `Hola {{nombre}}, ¿alcanzaste a ver el video de la auditoría? Si tienes preguntas dímelas, sin compromiso.`,
  },
  {
    id: "noreply_d5",
    stage: "no_reply_followup_5d",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre", "ciudad"],
    body: `{{nombre}}, no quiero molestarte. Cierro mi disponibilidad para {{ciudad}} este mes hoy. Si quieres entrar al cupo te lo guardo. Si no, sin problema, te dejo ir.`,
  },
  {
    id: "noreply_d10",
    stage: "no_reply_followup_10d",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre"],
    body: `{{nombre}}, última. Vi que un competidor cerca de tu zona acaba de prender una campaña fuerte en Facebook. Ese cliente que ahora va con él era para vos. Si quieres recuperar terreno, dímelo y te paso la captura.`,
  },

  // -------------------- OBJECIONES --------------------
  {
    id: "objection_price",
    stage: "objection_price",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre"],
    body: `Te entiendo {{nombre}}. Mira, los $497/mes incluyen setup, página web, anuncios y soporte — y la garantía es que si en 30 días no ves leads no pagas el siguiente mes. Cualquier flyer o magnet que mandes a imprimir te cuesta más y no sabes si te trajo clientes. Esto sí lo medimos. ¿Te animas a probar 1 mes?`,
  },
  {
    id: "objection_busy",
    stage: "objection_busy",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre"],
    body: `Perfecto {{nombre}}, justo por eso INDEXA está hecho para ti. El setup lo hacemos nosotros — tú solo respondes los WhatsApps que lleguen. Te toma 2-3 min cerrar cada cliente. ¿Mañana o el miércoles puedes 15 min para arrancar?`,
  },

  // -------------------- INVITE A CIERRE --------------------
  {
    id: "close_call_invite",
    stage: "close_call_invite",
    vertical: "generico",
    delivery: "text",
    vars: ["nombre"],
    body: `{{nombre}}, ¿podemos hacer una llamada corta de 15 min por WhatsApp? Te muestro el plan exacto, los números y la garantía. Si no te late, no pasa nada — pero quiero que veas exactamente qué te toca a ti y qué a nosotros. ¿Hoy o mañana te queda mejor?`,
  },
];

/**
 * Sustituye variables tipo {{nombre}} en el preset.
 * Las variables que no se proveen se dejan literales — el operador las
 * completa manualmente antes de enviar.
 */
export function renderPreset(
  preset: OutreachPreset,
  vars: Partial<Record<string, string>>
): string {
  let out = preset.body;
  for (const [key, value] of Object.entries(vars)) {
    if (typeof value !== "string" || !value) continue;
    out = out.replaceAll(`{{${key}}}`, value);
  }
  return out;
}

/**
 * Construye URL completa de la landing del vertical para enriquecer mensajes
 * que mencionen un link.
 */
export function getVerticalLanding(vertical: OutreachVertical): string {
  return `${INDEXA_SITE_URL}${verticalLandingMap[vertical]}`;
}

/**
 * Para WhatsApp Cloud API templates aprobadas, Meta sustituye {{1}}, {{2}}...
 * en orden. Convertir un preset a array de variables en el orden esperado.
 *
 * @example
 *   const p = OUTREACH_PRESETS_USA.find(p => p.id === "cold_text_v1")!;
 *   const vars = presetToBodyVars(p, { nombre: "Carlos", negocio: "Taller Méndez" });
 *   // vars = ["Carlos", "Taller Méndez"]
 */
export function presetToBodyVars(
  preset: OutreachPreset,
  vars: Partial<Record<string, string>>
): string[] {
  return preset.vars.map((v) => vars[v] || `{{${v}}}`);
}

/**
 * Filtra presets aplicables a un vertical específico, cayendo a "generico"
 * si no hay preset dedicado para ese vertical y stage.
 */
export function getPresetsForVertical(
  vertical: OutreachVertical
): OutreachPreset[] {
  const dedicated = OUTREACH_PRESETS_USA.filter((p) => p.vertical === vertical);
  const generic = OUTREACH_PRESETS_USA.filter(
    (p) =>
      p.vertical === "generico" &&
      !dedicated.some((d) => d.stage === p.stage)
  );
  return [...dedicated, ...generic];
}

/**
 * Sugiere el próximo preset según el último stage usado con un prospecto.
 * Útil para automatizar follow-ups.
 */
export function suggestNextStage(lastStage: OutreachStage | null): OutreachStage {
  switch (lastStage) {
    case null:
      return "cold_opener_audio_script";
    case "cold_opener_audio_script":
    case "cold_opener_text":
      return "post_audit_followup";
    case "post_audit_followup":
      return "no_reply_followup_2d";
    case "no_reply_followup_2d":
      return "no_reply_followup_5d";
    case "no_reply_followup_5d":
      return "no_reply_followup_10d";
    default:
      return "close_call_invite";
  }
}

export const VERTICAL_LABELS = verticalLabel;
