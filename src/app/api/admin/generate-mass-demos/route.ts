import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAuth";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface ProspectoPayload {
  id: string;
  nombre: string;
  slug: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: string;
  ciudad: string;
}

interface RequestBody {
  prospectos: ProspectoPayload[];
  authToken: string;
}

function toFirestoreFields(obj: Record<string, string | number | boolean>) {
  const fields: Record<string, object> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = { integerValue: String(v) };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
  }
  return fields;
}

async function firestoreQuery(
  collection: string,
  field: string,
  value: string,
  token: string
): Promise<boolean> {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: {
            fieldFilter: {
              field: { fieldPath: field },
              op: "EQUAL",
              value: { stringValue: value },
            },
          },
          limit: 1,
        },
      }),
    }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return data.length > 0 && !!data[0].document;
}

async function createSitioDoc(
  slug: string,
  fields: Record<string, object>,
  token: string
): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/sitios?documentId=${slug}&key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fields }),
  });
  return res.ok;
}

async function updateProspectoStatus(
  docId: string,
  status: string,
  slug: string,
  token: string
): Promise<boolean> {
  const res = await fetch(
    `${BASE_URL}/prospectos_frios/${docId}?updateMask.fieldPaths=status&updateMask.fieldPaths=demoSlug&key=${API_KEY}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fields: {
          status: { stringValue: status },
          demoSlug: { stringValue: slug },
        },
      }),
    }
  );
  return res.ok;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { prospectos, authToken } = body;

    if (!authToken) {
      return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
    }

    const user = await verifyAdmin(authToken);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado. Se requiere rol admin." }, { status: 403 });
    }

    if (!prospectos || prospectos.length === 0) {
      return NextResponse.json({ success: false, message: "No se proporcionaron prospectos." }, { status: 400 });
    }

    if (prospectos.length > 50) {
      return NextResponse.json({ success: false, message: "Máximo 50 prospectos por lote." }, { status: 400 });
    }

    // Stream results back as JSON for progress tracking
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (let i = 0; i < prospectos.length; i++) {
          const p = prospectos[i];
          const slug = p.slug || p.nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

          // Send progress
          const progress = {
            event: "progress",
            current: i + 1,
            total: prospectos.length,
            nombre: p.nombre,
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`));

          try {
            // Check if sitio already exists for this slug
            const exists = await firestoreQuery("sitios", "slug", slug, authToken);
            if (exists) {
              skipped++;
              continue;
            }

            // Create sitio document
            const sitioFields = toFirestoreFields({
              nombre: p.nombre,
              slug,
              descripcion: "",
              eslogan: `Bienvenido a ${p.nombre}`,
              whatsapp: p.telefono || "",
              emailContacto: p.email || "",
              direccion: p.direccion || "",
              colorPrincipal: "#002366",
              logoUrl: "",
              templateId: "modern",
              ownerId: "",
              statusPago: "demo",
              plan: "",
              stripeCustomerId: "",
              vistas: 0,
              clicsWhatsApp: 0,
            });

            // Add servicios array and categoria
            (sitioFields as Record<string, unknown>).servicios = {
              arrayValue: { values: [] },
            };
            if (p.categoria) {
              (sitioFields as Record<string, unknown>).categoria = {
                stringValue: p.categoria,
              };
            }

            const ok = await createSitioDoc(slug, sitioFields, authToken);
            if (ok) {
              // Update prospecto status
              await updateProspectoStatus(p.id, "demo_generada", slug, authToken);
              created++;
            } else {
              errors++;
            }
          } catch {
            errors++;
          }
        }

        // Final summary
        const summary = {
          event: "done",
          created,
          skipped,
          errors,
          message: `${created} sitios demo creados, ${skipped} duplicados omitidos${errors > 0 ? `, ${errors} errores` : ""}.`,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(summary)}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `Error del servidor: ${err}` },
      { status: 500 }
    );
  }
}
