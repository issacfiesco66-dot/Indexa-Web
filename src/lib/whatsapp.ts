/**
 * WhatsApp Cloud API client (Meta Graph API).
 *
 * Required env vars:
 *   WHATSAPP_PHONE_NUMBER_ID     — ID del número (no el número), del WhatsApp Manager
 *   WHATSAPP_ACCESS_TOKEN        — System User token (long-lived)
 *   WHATSAPP_GRAPH_VERSION       — opcional, default v21.0
 *   WHATSAPP_VERIFY_TOKEN        — string que tú eliges para verificar el webhook
 *   WHATSAPP_APP_SECRET          — opcional, para validar firma X-Hub-Signature-256
 */

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";

function getEnv() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "WhatsApp env vars faltantes: WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ACCESS_TOKEN son requeridas."
    );
  }
  return { phoneNumberId, accessToken };
}

/**
 * Normaliza un número telefónico a formato E.164 sin '+' (formato que pide Meta).
 * - Elimina espacios, guiones, paréntesis, '+'.
 * - Si tiene 10 dígitos, asume MX y antepone 52.
 * - Si tiene 11 dígitos y empieza con 1 (mobile MX viejo "1XXXXXXXXXX"), lo trata como MX.
 * - Si ya empieza con código de país (12-15 dígitos), lo deja.
 * Retorna null si no es válido.
 *
 * NOTA: para mercado USA-Hispano usar `normalizePhone(raw, "US")` o el
 * helper `normalizePhoneByCountry`. Esta función deja el comportamiento legacy
 * para no romper imports existentes en el resto del proyecto.
 */
export function normalizePhoneMx(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D+/g, "");
  if (!digits) return null;

  if (digits.length === 10) return `52${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `52${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("52")) return digits;
  if (digits.length === 13 && digits.startsWith("521")) return `52${digits.slice(3)}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

export type PhoneCountry = "MX" | "US";

/**
 * Normaliza para USA. 10 dígitos → 1XXXXXXXXXX (formato E.164 sin '+').
 * Acepta números USA con o sin código de país, y rechaza si hay ambigüedad.
 */
function normalizePhoneUs(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D+/g, "");
  if (!digits) return null;

  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  if (digits.length >= 11 && digits.length <= 15 && digits.startsWith("1")) return digits;
  return null;
}

/**
 * Normaliza un teléfono según el país objetivo.
 * Útil para outbound multi-país (MX + USA-Hispano).
 *
 * @example
 *   normalizePhone("(713) 555-0100", "US") // "17135550100"
 *   normalizePhone("55 1234 5678", "MX")   // "525512345678"
 */
export function normalizePhone(
  raw: string | undefined | null,
  country: PhoneCountry
): string | null {
  if (country === "US") return normalizePhoneUs(raw);
  return normalizePhoneMx(raw);
}

/**
 * Detecta país por la ciudad del prospecto. Las ciudades en `usaCityHints`
 * son las del playbook USA-Hispano. Caso default: México (legacy).
 */
const USA_CITY_HINTS = [
  "houston",
  "dallas",
  "austin",
  "san antonio",
  "miami",
  "orlando",
  "tampa",
  "jacksonville",
  "los angeles",
  "los ángeles",
  "san diego",
  "phoenix",
  "tucson",
  "las vegas",
  "denver",
  "chicago",
  "atlanta",
  "charlotte",
  "raleigh",
  "nashville",
  "new york",
  "newark",
  "new jersey",
  "washington",
  "boston",
  "philadelphia",
  "seattle",
  "portland",
];

export function inferPhoneCountry(opts: {
  ciudad?: string | null;
  pais?: string | null;
}): PhoneCountry {
  const explicit = opts.pais?.toLowerCase().trim();
  if (explicit === "us" || explicit === "usa" || explicit === "estados unidos") return "US";
  if (explicit === "mx" || explicit === "mexico" || explicit === "méxico") return "MX";

  const city = opts.ciudad?.toLowerCase().trim() || "";
  if (city && USA_CITY_HINTS.some((c) => city.includes(c))) return "US";
  return "MX";
}

export function normalizePhoneByCountry(
  raw: string | undefined | null,
  ctx: { ciudad?: string | null; pais?: string | null }
): { phone: string | null; country: PhoneCountry } {
  const country = inferPhoneCountry(ctx);
  return { phone: normalizePhone(raw, country), country };
}

export interface TemplateParam {
  type: "text" | "currency" | "date_time";
  text?: string;
}

export interface SendTemplateOptions {
  to: string; // raw or normalized
  templateName: string;
  languageCode?: string; // default es_MX
  headerParams?: TemplateParam[];
  bodyParams?: TemplateParam[];
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: number;
  raw?: unknown;
}

/**
 * Envía una plantilla aprobada de WhatsApp Cloud API.
 */
export async function sendTemplateMessage(opts: SendTemplateOptions): Promise<SendResult> {
  const { phoneNumberId, accessToken } = getEnv();

  const to = normalizePhoneMx(opts.to);
  if (!to) {
    return { success: false, error: `Número inválido: ${opts.to}` };
  }

  const components: Array<Record<string, unknown>> = [];
  if (opts.headerParams?.length) {
    components.push({ type: "header", parameters: opts.headerParams });
  }
  if (opts.bodyParams?.length) {
    components.push({ type: "body", parameters: opts.bodyParams });
  }

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: opts.templateName,
      language: { code: opts.languageCode || "es_MX" },
      ...(components.length ? { components } : {}),
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const json = (await res.json()) as {
      messages?: Array<{ id: string }>;
      error?: { message: string; code: number };
    };

    if (!res.ok || json.error) {
      return {
        success: false,
        error: json.error?.message || `HTTP ${res.status}`,
        errorCode: json.error?.code,
        raw: json,
      };
    }

    return {
      success: true,
      messageId: json.messages?.[0]?.id,
      raw: json,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error de red",
    };
  }
}

/**
 * Envía texto libre (sólo válido si el destinatario te escribió en las últimas 24h).
 * Fuera de esa ventana Meta rechaza el mensaje.
 */
export async function sendTextMessage(toRaw: string, text: string): Promise<SendResult> {
  const { phoneNumberId, accessToken } = getEnv();
  const to = normalizePhoneMx(toRaw);
  if (!to) return { success: false, error: `Número inválido: ${toRaw}` };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { preview_url: false, body: text },
        }),
      }
    );
    const json = (await res.json()) as {
      messages?: Array<{ id: string }>;
      error?: { message: string; code: number };
    };
    if (!res.ok || json.error) {
      return {
        success: false,
        error: json.error?.message || `HTTP ${res.status}`,
        errorCode: json.error?.code,
        raw: json,
      };
    }
    return { success: true, messageId: json.messages?.[0]?.id, raw: json };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error de red",
    };
  }
}

/**
 * Helper para construir parámetros de body desde un objeto plano.
 *   buildBodyParams({ "1": "Juan", "2": "30% off", "3": "30 mayo" })
 *   → [{type:"text",text:"Juan"}, {type:"text",text:"30% off"}, {type:"text",text:"30 mayo"}]
 */
export function buildBodyParams(values: Array<string | number>): TemplateParam[] {
  return values.map((v) => ({ type: "text", text: String(v) }));
}
