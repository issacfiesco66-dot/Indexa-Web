/**
 * One-time script: create a sitio for issacfiesco66 and link it.
 * Run: node scripts/create-issac-site.mjs
 */

// Load env
import { readFileSync } from "fs";
const envContent = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const [k, ...rest] = line.split("=");
  if (k && rest.length) env[k.trim()] = rest.join("=").trim();
}

const API_KEY = env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// 1. Sign in as admin
console.log("Signing in as admin...");
const authRes = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "djonny319@gmail.com",
      password: "Chicharito26@",
      returnSecureToken: true,
    }),
  }
);
const authData = await authRes.json();
if (!authData.idToken) {
  console.error("Auth failed:", authData);
  process.exit(1);
}
const TOKEN = authData.idToken;
console.log("Authenticated as admin ✓");

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

// 2. Find issacfiesco66 in usuarios
console.log("Finding issacfiesco66...");
const queryRes = await fetch(`${BASE}:runQuery`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: "usuarios" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "email" },
          op: "EQUAL",
          value: { stringValue: "issacfiesco66@gmail.com" },
        },
      },
      limit: 1,
    },
  }),
});
const queryData = await queryRes.json();

let issacUid = null;
let issacSitioId = null;
if (queryData[0]?.document) {
  const doc = queryData[0].document;
  issacUid = doc.name.split("/").pop();
  issacSitioId = doc.fields?.sitioId?.stringValue || "";
  console.log(`Found issac: uid=${issacUid}, sitioId="${issacSitioId}"`);
} else {
  console.log("issacfiesco66@gmail.com not found in usuarios. Listing all users...");
  const listRes = await fetch(`${BASE}/usuarios?pageSize=20`, { headers });
  const listData = await listRes.json();
  if (listData.documents) {
    for (const d of listData.documents) {
      const uid = d.name.split("/").pop();
      const email = d.fields?.email?.stringValue || "?";
      const role = d.fields?.role?.stringValue || "?";
      const sid = d.fields?.sitioId?.stringValue || "";
      console.log(`  - ${uid} | ${email} | role=${role} | sitioId=${sid}`);
    }
  }
  // Try to find any cliente without a site
  const clienteWithoutSite = listData.documents?.find(
    (d) => d.fields?.role?.stringValue === "cliente" && !d.fields?.sitioId?.stringValue
  );
  if (clienteWithoutSite) {
    issacUid = clienteWithoutSite.name.split("/").pop();
    console.log(`Using client without site: ${issacUid}`);
  } else {
    console.error("No client found to link.");
    process.exit(1);
  }
}

// 3. If already has a site, skip
if (issacSitioId) {
  console.log(`issac already has sitioId="${issacSitioId}" — checking if it exists...`);
  const siteRes = await fetch(`${BASE}/sitios/${issacSitioId}`, { headers });
  if (siteRes.ok) {
    console.log("Site exists! No action needed.");
    process.exit(0);
  }
  console.log("SitioId is set but document doesn't exist. Creating new site...");
}

// 4. Create the sitio
console.log("Creating site for issac...");
const sitioData = {
  fields: {
    nombre: { stringValue: "Issac Demo" },
    slug: { stringValue: "issac-demo" },
    descripcion: { stringValue: "Sitio de demostración para Issac" },
    eslogan: { stringValue: "Tu presencia digital empieza aquí" },
    whatsapp: { stringValue: "" },
    emailContacto: { stringValue: "issacfiesco66@gmail.com" },
    direccion: { stringValue: "" },
    colorPrincipal: { stringValue: "#002366" },
    logoUrl: { stringValue: "" },
    servicios: { arrayValue: { values: [
      { stringValue: "Diseño Web" },
      { stringValue: "Marketing Digital" },
      { stringValue: "SEO" },
    ] } },
    vistas: { integerValue: "0" },
    clicsWhatsApp: { integerValue: "0" },
    ownerId: { stringValue: issacUid },
    statusPago: { stringValue: "demo" },
    plan: { stringValue: "" },
    fechaVencimiento: { nullValue: null },
    stripeCustomerId: { stringValue: "" },
    templateId: { stringValue: "modern" },
    horarios: { stringValue: "" },
    googleMapsUrl: { stringValue: "" },
  },
};

const createRes = await fetch(`${BASE}/sitios`, {
  method: "POST",
  headers,
  body: JSON.stringify(sitioData),
});

if (!createRes.ok) {
  console.error("Failed to create site:", createRes.status, await createRes.text());
  process.exit(1);
}

const newSite = await createRes.json();
const newSitioId = newSite.name.split("/").pop();
console.log(`Site created: ${newSitioId} ✓`);

// 5. Link the site to issac's user document
console.log("Linking site to issac's account...");
const patchRes = await fetch(
  `${BASE}/usuarios/${issacUid}?updateMask.fieldPaths=sitioId`,
  {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      fields: { sitioId: { stringValue: newSitioId } },
    }),
  }
);

if (!patchRes.ok) {
  console.error("Failed to link site:", patchRes.status, await patchRes.text());
  process.exit(1);
}

console.log(`\n✅ Done! Site "${newSitioId}" linked to issac (${issacUid})`);
console.log(`   View at: /sitio/issac-demo`);
console.log(`   issac can now edit from /dashboard`);
