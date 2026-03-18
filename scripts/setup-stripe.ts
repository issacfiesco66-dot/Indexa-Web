/**
 * One-time Stripe setup script.
 * Creates products, prices, webhook endpoint, and customer portal config.
 *
 * Usage:  npx tsx scripts/setup-stripe.ts
 */

import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";

// ── Read STRIPE_SECRET_KEY from .env.local ─────────────────────────
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

function getEnv(key: string): string {
  const match = envContent.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1].trim();
}

const STRIPE_SECRET_KEY = getEnv("STRIPE_SECRET_KEY");
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion });

const PRODUCTION_URL = "https://indexa-web-ten.vercel.app";

// ── Plan definitions (MXN) ─────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "INDEXA Starter",
    description: "Página web profesional, botón de WhatsApp, SEO básico, soporte por email.",
    priceAmount: 29900, // $299 MXN in centavos
    envKey: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
  },
  {
    id: "profesional",
    name: "INDEXA Profesional",
    description: "Todo lo de Starter + dominio personalizado, analíticas avanzadas, panel CMS completo, soporte prioritario.",
    priceAmount: 59900, // $599 MXN
    envKey: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
  },
  {
    id: "enterprise",
    name: "INDEXA Enterprise",
    description: "Todo lo de Profesional + múltiples páginas, integración redes sociales, email marketing, asesor dedicado, SLA garantizado.",
    priceAmount: 129900, // $1,299 MXN
    envKey: "NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE",
  },
];

async function main() {
  console.log("🚀 Configurando Stripe para INDEXA...\n");

  // ── 1. Create products + prices ───────────────────────────────
  const priceIds: Record<string, string> = {};

  for (const plan of PLANS) {
    console.log(`📦 Creando producto: ${plan.name}...`);

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { planId: plan.id },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.priceAmount,
      currency: "mxn",
      recurring: { interval: "month" },
      metadata: { planId: plan.id },
    });

    priceIds[plan.envKey] = price.id;
    console.log(`   ✅ ${plan.name} → ${price.id} ($${plan.priceAmount / 100} MXN/mes)\n`);
  }

  // ── 2. Create webhook endpoint ────────────────────────────────
  console.log("🔗 Creando webhook endpoint...");

  const webhook = await stripe.webhookEndpoints.create({
    url: `${PRODUCTION_URL}/api/webhooks/stripe`,
    enabled_events: [
      "checkout.session.completed",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
      "customer.subscription.deleted",
    ],
    description: "INDEXA production webhook",
  });

  console.log(`   ✅ Webhook creado: ${webhook.url}`);
  console.log(`   🔑 Webhook Secret: ${webhook.secret}\n`);

  // ── 3. Configure customer portal ──────────────────────────────
  console.log("🏪 Configurando Customer Portal...");

  try {
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Administra tu suscripción INDEXA",
      },
      features: {
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          proration_behavior: "create_prorations",
          products: [
            {
              product: (await stripe.products.list({ limit: 3, active: true })).data.map(p => ({
                product: p.id,
                prices: priceIds[PLANS.find(plan => plan.name === p.name)?.envKey || ""] ? [priceIds[PLANS.find(plan => plan.name === p.name)?.envKey || ""]] : [],
              })).filter(p => p.prices.length > 0).map(p => p.product)[0] || "",
              prices: Object.values(priceIds),
            },
          ],
        },
      },
    });
    console.log("   ✅ Portal configurado\n");
  } catch (err) {
    console.log(`   ⚠️  Portal config parcial (puedes configurarlo desde el dashboard): ${err instanceof Error ? err.message : err}\n`);
  }

  // ── 4. Output env vars ────────────────────────────────────────
  console.log("═".repeat(60));
  console.log("📋 VARIABLES DE ENTORNO - Copia esto a tu .env.local:\n");
  for (const [key, value] of Object.entries(priceIds)) {
    console.log(`${key}=${value}`);
  }
  console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
  console.log("\n" + "═".repeat(60));
  console.log("\n⚠️  IMPORTANTE: También agrega estas variables en Vercel:");
  console.log("   Vercel → Settings → Environment Variables\n");

  // ── 5. Update .env.local automatically ────────────────────────
  let updatedEnv = envContent;

  for (const [key, value] of Object.entries(priceIds)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(updatedEnv)) {
      updatedEnv = updatedEnv.replace(regex, `${key}=${value}`);
    } else {
      updatedEnv += `\n${key}=${value}`;
    }
  }

  // Update webhook secret
  const whRegex = /^STRIPE_WEBHOOK_SECRET=.*$/m;
  if (whRegex.test(updatedEnv)) {
    updatedEnv = updatedEnv.replace(whRegex, `STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
  } else {
    updatedEnv += `\nSTRIPE_WEBHOOK_SECRET=${webhook.secret}`;
  }

  fs.writeFileSync(envPath, updatedEnv, "utf-8");
  console.log("✅ .env.local actualizado automáticamente\n");
  console.log("🎉 ¡Stripe configurado! Recuerda agregar las variables a Vercel.");
}

main().catch((err) => {
  console.error("❌ Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
