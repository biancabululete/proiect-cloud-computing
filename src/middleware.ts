import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Protejam doar /post (creare anunt). Editarea (/listings/[id]/edit) isi face propria
// verificare de auth in pagina (cu redirect catre /login). Vizualizarea (/listings/[id])
// este publica.
const PROTECTED = ["/post"];

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/post/:path*"],
};
