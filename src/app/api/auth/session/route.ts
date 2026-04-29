import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";
import { verifyIdToken } from "@/lib/verifyAuth";

/**
 * /api/auth/session sets/clears the firebaseAuthToken cookie with HttpOnly flag.
 *
 * POST: Set the cookie after verifying the Firebase ID token.
 * DELETE: Clear the cookie (sign-out).
 */

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token requerido." }, { status: 400 });
    }

    const verified = await verifyIdToken(token);
    if (!verified) {
      return NextResponse.json({ error: "Token invalido." }, { status: 401 });
    }

    const isSecure = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });

    response.cookies.set("firebaseAuthToken", token, {
      path: "/",
      maxAge: 60 * 60,
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error al establecer sesion." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("firebaseAuthToken", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return response;
}
