import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body invalid" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");

  if (!name || !email || !phone || !password) {
    return NextResponse.json(
      { error: "Toate campurile sunt obligatorii" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Parola trebuie sa aiba minim 8 caractere" },
      { status: 400 }
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Email invalid" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Exista deja un cont cu acest email" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
    select: { id: true, name: true, email: true, phone: true },
  });

  await setSessionCookie({ userId: user.id, email: user.email, name: user.name });

  return NextResponse.json({ user }, { status: 201 });
}
