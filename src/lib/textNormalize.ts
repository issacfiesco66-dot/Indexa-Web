/**
 * Normaliza categorias y ciudades raw que vienen del scraper de Google Maps,
 * antes de pasarlas a templates de WhatsApp. Sin esto, los mensajes contienen
 * typos que matan credibilidad ("reparacion de lavadoras en mexicalli").
 *
 * Reglas:
 * - Categorias: corregir acentos comunes en español (reparacion → reparación,
 *   mecanico → mecánico). Detectar ALL CAPS y convertir a minúsculas.
 * - Ciudades: diccionario explícito de ciudades mexicanas (incluye typos
 *   comunes y variaciones). Si no hay match, Title Case.
 *
 * Cuando agregues nuevas categorías/ciudades al scraper, sumarlas aquí.
 */

// Acentos comunes en categorías de Google Maps México.
// Key: forma sin acento (lowercase). Value: forma correcta.
const ACENTOS_FIX: Record<string, string> = {
  // Servicios de reparación / mantenimiento
  reparacion: "reparación",
  reparaciones: "reparaciones",
  instalacion: "instalación",
  instalaciones: "instalaciones",
  mantenimiento: "mantenimiento",
  mecanico: "mecánico",
  mecanica: "mecánica",
  mecanicos: "mecánicos",
  electrico: "eléctrico",
  electrica: "eléctrica",
  electricos: "eléctricos",
  electricas: "eléctricas",
  electronica: "electrónica",
  electronico: "electrónico",
  hidraulico: "hidráulico",
  hidraulica: "hidráulica",
  // Comida
  panaderia: "panadería",
  panaderias: "panaderías",
  pasteleria: "pastelería",
  pastelerias: "pastelerías",
  reposteria: "repostería",
  reposterias: "reposterías",
  cafeteria: "cafetería",
  cafeterias: "cafeterías",
  taqueria: "taquería",
  taquerias: "taquerías",
  carniceria: "carnicería",
  carnicerias: "carnicerías",
  pizzeria: "pizzería",
  pizzerias: "pizzerías",
  pollerias: "pollerías",
  polleria: "pollería",
  rosticeria: "rosticería",
  cremeria: "cremería",
  // Salud / belleza
  estetica: "estética",
  esteticas: "estéticas",
  optica: "óptica",
  opticas: "ópticas",
  clinica: "clínica",
  clinicas: "clínicas",
  medico: "médico",
  medica: "médica",
  medicos: "médicos",
  medicas: "médicas",
  ortopedico: "ortopédico",
  ortopedica: "ortopédica",
  peluqueria: "peluquería",
  peluquerias: "peluquerías",
  barberia: "barbería",
  barberias: "barberías",
  spa: "spa",
  // Comercio / servicios
  ferreteria: "ferretería",
  ferreterias: "ferreterías",
  papeleria: "papelería",
  papelerias: "papelerías",
  joyeria: "joyería",
  joyerias: "joyerías",
  herreria: "herrería",
  herrerias: "herrerías",
  cerrajeria: "cerrajería",
  cerrajerias: "cerrajerías",
  marroquineria: "marroquinería",
  carpinteria: "carpintería",
  carpinterias: "carpinterías",
  zapateria: "zapatería",
  zapaterias: "zapaterías",
  miscelanea: "miscelánea",
  miscelaneas: "misceláneas",
  ortodoncia: "ortodoncia",
  // Profesionales / oficinas
  abogado: "abogado",
  contador: "contador",
  notaria: "notaría",
  notarias: "notarías",
  arquitecto: "arquitecto",
  ingenieria: "ingeniería",
  asesoria: "asesoría",
  asesorias: "asesorías",
  consultoria: "consultoría",
  consultorias: "consultorías",
  // Otros frecuentes
  fotografia: "fotografía",
  decoracion: "decoración",
  refrigeracion: "refrigeración",
  climatizacion: "climatización",
  jardineria: "jardinería",
  diseno: "diseño",
  educacion: "educación",
  capacitacion: "capacitación",
  importacion: "importación",
  distribucion: "distribución",
  produccion: "producción",
  construccion: "construcción",
  renta: "renta",
  hospedaje: "hospedaje",
  // Conectores comunes (sin cambio, evitan que se "title case")
  de: "de",
  del: "del",
  la: "la",
  las: "las",
  el: "el",
  los: "los",
  y: "y",
  e: "e",
  o: "o",
  u: "u",
  en: "en",
  con: "con",
  para: "para",
  por: "por",
};

// Ciudades mexicanas frecuentes en Google Maps con sus typos más comunes.
// Key: forma normalizada lowercase sin acentos. Value: forma correcta a mostrar.
const CIUDADES_FIX: Record<string, string> = {
  // CDMX y variantes
  cdmx: "CDMX",
  "ciudad de mexico": "Ciudad de México",
  "ciudad de méxico": "Ciudad de México",
  df: "CDMX",
  "distrito federal": "CDMX",
  mexico: "Ciudad de México",
  // Norte
  monterrey: "Monterrey",
  monterey: "Monterrey",
  mty: "Monterrey",
  "san pedro garza garcia": "San Pedro Garza García",
  saltillo: "Saltillo",
  torreon: "Torreón",
  chihuahua: "Chihuahua",
  "ciudad juarez": "Ciudad Juárez",
  "cd juarez": "Ciudad Juárez",
  juarez: "Ciudad Juárez",
  hermosillo: "Hermosillo",
  culiacan: "Culiacán",
  mazatlan: "Mazatlán",
  "los mochis": "Los Mochis",
  "la paz": "La Paz",
  // Frontera norte
  tijuana: "Tijuana",
  tj: "Tijuana",
  mexicali: "Mexicali",
  mexicalli: "Mexicali",
  ensenada: "Ensenada",
  rosarito: "Rosarito",
  tecate: "Tecate",
  "nuevo laredo": "Nuevo Laredo",
  reynosa: "Reynosa",
  matamoros: "Matamoros",
  // Bajío
  guadalajara: "Guadalajara",
  gdl: "Guadalajara",
  zapopan: "Zapopan",
  tlaquepaque: "Tlaquepaque",
  tonala: "Tonalá",
  leon: "León",
  irapuato: "Irapuato",
  celaya: "Celaya",
  guanajuato: "Guanajuato",
  queretaro: "Querétaro",
  qro: "Querétaro",
  "santiago de queretaro": "Querétaro",
  "san juan del rio": "San Juan del Río",
  aguascalientes: "Aguascalientes",
  ags: "Aguascalientes",
  "san luis potosi": "San Luis Potosí",
  slp: "San Luis Potosí",
  // Centro
  toluca: "Toluca",
  metepec: "Metepec",
  puebla: "Puebla",
  cholula: "Cholula",
  cuernavaca: "Cuernavaca",
  pachuca: "Pachuca",
  morelia: "Morelia",
  uruapan: "Uruapan",
  // Estado de México (zona conurbada CDMX)
  ecatepec: "Ecatepec",
  nezahualcoyotl: "Nezahualcóyotl",
  neza: "Nezahualcóyotl",
  naucalpan: "Naucalpan",
  tlalnepantla: "Tlalnepantla",
  chalco: "Chalco",
  texcoco: "Texcoco",
  ixtapaluca: "Ixtapaluca",
  chimalhuacan: "Chimalhuacán",
  chicoloapan: "Chicoloapan",
  "los reyes la paz": "Los Reyes La Paz",
  // Sur / sureste
  oaxaca: "Oaxaca",
  "puerto escondido": "Puerto Escondido",
  villahermosa: "Villahermosa",
  tuxtla: "Tuxtla Gutiérrez",
  "tuxtla gutierrez": "Tuxtla Gutiérrez",
  "san cristobal": "San Cristóbal de las Casas",
  merida: "Mérida",
  cancun: "Cancún",
  "playa del carmen": "Playa del Carmen",
  tulum: "Tulum",
  campeche: "Campeche",
  veracruz: "Veracruz",
  xalapa: "Xalapa",
  jalapa: "Xalapa",
  // Pacífico
  acapulco: "Acapulco",
  "puerto vallarta": "Puerto Vallarta",
  "playas de tijuana": "Playas de Tijuana",
  manzanillo: "Manzanillo",
  colima: "Colima",
  // Otros
  durango: "Durango",
  zacatecas: "Zacatecas",
  tepic: "Tepic",
  "ciudad obregon": "Ciudad Obregón",
};

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function titleCaseEs(s: string): string {
  // Title case respetando conectores cortos en minúscula
  const conectores = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "o", "u", "en", "a"]);
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => {
      if (i > 0 && conectores.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/**
 * Title Case "puro" para nombres propios — capitaliza TODAS las palabras,
 * incluyendo conectores cortos. Para nombres de negocios donde "El", "La",
 * "Don" son parte del nombre comercial (Lavadoras El Rey, Taquería Don Jose).
 */
function titleCaseProper(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Normaliza una categoría raw del scraper.
 *  "REPARACION DE LAVADORAS" → "reparación de lavadoras"
 *  "Estetica Unisex"         → "estética unisex"
 *  "Taqueria El Pastor"      → "taquería el pastor"
 *  "" o null                 → ""
 *
 * Devuelve en minúsculas para que se lea natural dentro de una oración
 * ("busqué 'reparación de lavadoras' en Google"). Si quieres Title Case
 * usa `titleCaseEs(normalizeCategoria(x))`.
 */
export function normalizeCategoria(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  // Detectar ALL CAPS y convertir a minúsculas para procesar
  const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  const base = isAllCaps ? trimmed.toLowerCase() : trimmed.toLowerCase();
  // Aplicar fix de acentos palabra por palabra
  return base
    .split(/\s+/)
    .map((w) => {
      // Quitar puntuación final para lookup
      const stripped = w.replace(/[.,;:!?]$/g, "");
      const punct = w.slice(stripped.length);
      const fix = ACENTOS_FIX[stripped];
      return (fix ?? stripped) + punct;
    })
    .join(" ")
    .trim();
}

/**
 * Normaliza una ciudad raw del scraper.
 *  "mexicalli"        → "Mexicali"
 *  "MONTERREY"        → "Monterrey"
 *  "ciudad de mexico" → "Ciudad de México"
 *  "el llanito"       → "El Llanito"  (Title Case fallback)
 *  "" o null          → ""
 */
export function normalizeCiudad(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  const lookupKey = stripAccents(trimmed.toLowerCase());
  const fix = CIUDADES_FIX[lookupKey];
  if (fix) return fix;
  // Fallback: title case respetando conectores
  return titleCaseEs(trimmed);
}

/**
 * Normaliza un nombre de negocio (Title Case respetando conectores).
 *  "LAVADORAS EL REY"     → "Lavadoras El Rey"
 *  "taqueria don jose"    → "Taquería Don Jose"  (también aplica acentos)
 */
export function normalizeNombreNegocio(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  // Si trae ALL CAPS o ALL LOWER, aplicar Title Case PROPER (capitaliza todo,
  // incluyendo conectores como "El", "La", "Don" — son parte del nombre).
  const allCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  const allLower = trimmed === trimmed.toLowerCase() && /[a-z]/.test(trimmed);
  let s = trimmed;
  if (allCaps || allLower) {
    s = titleCaseProper(trimmed);
  }
  // Aplicar acentos para palabras conocidas
  s = s
    .split(/\s+/)
    .map((w) => {
      const lower = w.toLowerCase();
      const stripped = lower.replace(/[.,;:!?]$/g, "");
      const punct = lower.slice(stripped.length);
      const fix = ACENTOS_FIX[stripped];
      if (fix) {
        // Mantener capitalización original si la palabra estaba capitalizada
        const wasCapitalized = w[0] === w[0].toUpperCase();
        return (wasCapitalized ? fix.charAt(0).toUpperCase() + fix.slice(1) : fix) + punct;
      }
      return w;
    })
    .join(" ")
    .trim();
  return s;
}
