import { NextRequest, NextResponse } from "next/server";

export const JSON_PAYLOAD_LIMIT_BYTES = 64 * 1024;

export async function readLimitedJson<T = unknown>(
  request: NextRequest,
  maxBytes = JSON_PAYLOAD_LIMIT_BYTES
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.parseInt(contentLength, 10) > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: "Payload demasiado grande." }, { status: 413 }),
    };
  }

  const rawText = await request.text();
  if (rawText.length > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: "Payload demasiado grande." }, { status: 413 }),
    };
  }

  try {
    return { ok: true, data: JSON.parse(rawText) as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: "JSON invalido." }, { status: 400 }),
    };
  }
}

export async function verifyRecaptchaToken(
  token: unknown,
  expectedAction?: string,
  minimumScore = 0.3
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!recaptchaSecret) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    return { ok: false, status: 500, message: "Error de configuracion del servidor." };
  }

  if (!token || typeof token !== "string") {
    return { ok: false, status: 400, message: "Verificacion de seguridad requerida." };
  }

  try {
    const params = new URLSearchParams({
      secret: recaptchaSecret,
      response: token,
    });
    const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const captchaData = await captchaRes.json();
    const score = typeof captchaData.score === "number" ? captchaData.score : 1;
    const action = typeof captchaData.action === "string" ? captchaData.action : "";

    if (!captchaData.success || score < minimumScore) {
      return { ok: false, status: 403, message: "Verificacion de seguridad fallida. Intenta de nuevo." };
    }
    if (expectedAction && action && action !== expectedAction) {
      return { ok: false, status: 403, message: "Verificacion de seguridad invalida." };
    }

    return { ok: true };
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    return { ok: false, status: 500, message: "Error al verificar seguridad. Intenta de nuevo." };
  }
}
