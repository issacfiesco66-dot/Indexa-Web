import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";

/**
 * /api/auth/session — Sets/clears the firebaseAuthToken cookie with HttpOnly flag.
 *
 * POST: Set the cookie (receives token in JSON body)
 * DELETE: Clear the cookie (sign-out)
 *
 * The HttpOnly flag prevents JavaScript from reading the cookie,
 * protecting it from XSS attacks. The cookie is only accessible
 * to the server (middleware, API routes).
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

    // Basic token format validation (Firebase ID tokens are JWTs)
    if (token.split(".").length !== 3) {
      return NextResponse.json({ error: "Formato de token inválido." }, { status: 400 });
    }

    const isSecure = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });

    response.cookies.set("firebaseAuthToken", token, {
      path: "/",
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error al establecer sesión." }, { status: 500 });
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
