/**
 * Seed script: creates a test 'sitio' document in Firestore via REST API.
 * Authenticates via Firebase Auth first (email/password sign-in).
 *
 * Usage:
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/seed-sitio.ts <email> <password>
 *
 * If no user exists yet, it will create one automatically.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_API_KEY");
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("❌ Uso: npx dotenv-cli -e .env.local -- npx tsx scripts/seed-sitio.ts <email> <password>");
  console.error("   Ejemplo: ... seed-sitio.ts admin@indexa.com.mx MiPassword123");
  process.exit(1);
}

const AUTH_URL = `https://identitytoolkit.googleapis.com/v1`;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getIdToken(): Promise<string> {
  // Try sign in first
  let res = await fetch(`${AUTH_URL}/accounts:signInWithPassword?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`✅ Sesión iniciada como ${email}`);
    return data.idToken;
  }

  // If sign in fails, try creating the user
  console.log("ℹ️  Usuario no encontrado, creando cuenta...");
  res = await fetch(`${AUTH_URL}/accounts:signUp?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("❌ No se pudo crear el usuario:", err.error?.message);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`✅ Usuario creado: ${email}`);
  return data.idToken;
}

const sitioFields = {
  fields: {
    slug: { stringValue: "taller-garcia" },
    nombre: { stringValue: "Taller García" },
    eslogan: { stringValue: "Tu carro en las mejores manos" },
    descripcion: {
      stringValue:
        "Somos un taller mecánico con más de 20 años de experiencia. Nos especializamos en diagnóstico computarizado, frenos, suspensión, motor y servicio preventivo. Tu confianza es nuestro motor.",
    },
    whatsapp: { stringValue: "5512345678" },
    emailContacto: { stringValue: "contacto@tallergarcia.com" },
    direccion: { stringValue: "Av. Reforma 123, Col. Centro, CDMX" },
    colorPrincipal: { stringValue: "#002366" },
    logoUrl: { stringValue: "" },
    servicios: {
      arrayValue: {
        values: [
          { stringValue: "Diagnóstico Computarizado" },
          { stringValue: "Frenos y Suspensión" },
          { stringValue: "Reparación de Motor" },
          { stringValue: "Servicio Preventivo" },
        ],
      },
    },
    vistas: { integerValue: "0" },
    clicsWhatsApp: { integerValue: "0" },
    ownerId: { stringValue: "" },
  },
};

async function seed() {
  console.log("🌱 Seed: Sitio de prueba para INDEXA\n");

  const idToken = await getIdToken();

  console.log("\n📄 Creando documento en colección 'sitios'...");

  const res = await fetch(`${BASE_URL}/sitios?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(sitioFields),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Error ${res.status}:`, err);
    process.exit(1);
  }

  const doc = await res.json();
  const docId = doc.name.split("/").pop();

  console.log(`\n✅ ¡Sitio creado exitosamente!`);
  console.log(`   ID:   ${docId}`);
  console.log(`   Slug: taller-garcia`);
  console.log(`   URL:  http://localhost:3000/sitio/taller-garcia\n`);
}

seed();
