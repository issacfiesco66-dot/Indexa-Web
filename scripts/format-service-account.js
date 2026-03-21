#!/usr/bin/env node
/**
 * Formatea tu archivo JSON de Service Account de Firebase en una sola línea
 * segura para pegar en Vercel Environment Variables.
 *
 * Uso:
 *   node scripts/format-service-account.js ruta/a/tu-service-account.json
 *
 * El resultado se copia al clipboard (si pbcopy/clip está disponible)
 * y se imprime en consola.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const filePath = process.argv[2];

if (!filePath) {
  console.error("❌ Uso: node scripts/format-service-account.js <ruta-al-json>");
  console.error("   Ejemplo: node scripts/format-service-account.js ./firebase-sa.json");
  process.exit(1);
}

const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Archivo no encontrado: ${fullPath}`);
  process.exit(1);
}

try {
  const raw = fs.readFileSync(fullPath, "utf-8");
  const parsed = JSON.parse(raw);

  // Compact JSON — single line, no whitespace
  const oneLine = JSON.stringify(parsed);

  console.log("\n✅ JSON formateado en una sola línea (listo para Vercel):\n");
  console.log("─".repeat(60));
  console.log(oneLine);
  console.log("─".repeat(60));

  // Try to copy to clipboard
  try {
    const isWindows = process.platform === "win32";
    const isMac = process.platform === "darwin";

    if (isWindows) {
      execSync("clip", { input: oneLine });
      console.log("\n📋 Copiado al portapapeles (clip).");
    } else if (isMac) {
      execSync("pbcopy", { input: oneLine });
      console.log("\n📋 Copiado al portapapeles (pbcopy).");
    } else {
      console.log("\n💡 Copia manualmente el texto de arriba.");
    }
  } catch {
    console.log("\n💡 Copia manualmente el texto de arriba.");
  }

  console.log("\n📌 Instrucciones para Vercel:");
  console.log("   1. Ve a: Vercel → tu proyecto → Settings → Environment Variables");
  console.log("   2. Name: FIREBASE_SERVICE_ACCOUNT");
  console.log("   3. Value: pega el texto de arriba (una sola línea)");
  console.log("   4. Environments: ✅ Production ✅ Preview ✅ Development");
  console.log("   5. Click 'Save'");
  console.log("   6. Haz Redeploy desde: Deployments → ··· → Redeploy\n");

} catch (err) {
  console.error("❌ Error parseando JSON:", err.message);
  console.error("   Asegúrate de que el archivo es un JSON válido de Firebase Service Account.");
  process.exit(1);
}
