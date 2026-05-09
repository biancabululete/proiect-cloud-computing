import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: { id: string } };

// GET /api/listings/[id] - detalii un anunt
export async function GET(_req: NextRequest, { params }: Params) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, phone: true } } },
  });
  if (!listing) {
    return NextResponse.json({ error: "Anunt inexistent" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

// PUT /api/listings/[id] - editeaza anuntul (doar proprietarul)
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const existing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Anunt inexistent" }, { status: 404 });
  }
  if (existing.userId !== session.userId) {
    return NextResponse.json({ error: "Nu ai dreptul sa editezi" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body invalid" }, { status: 400 });

  const title = body.title !== undefined ? String(body.title).trim() : existing.title;
  const description =
    body.description !== undefined ? String(body.description).trim() : existing.description;
  const category =
    body.category !== undefined ? String(body.category).trim() : existing.category;
  const location =
    body.location !== undefined ? String(body.location).trim() : existing.location;
  const imageUrl =
    body.imageUrl !== undefined
      ? body.imageUrl
        ? String(body.imageUrl)
        : null
      : existing.imageUrl;

  let price = existing.price;
  if (body.price !== undefined) {
    const p = Number(body.price);
    if (!Number.isFinite(p) || p < 0) {
      return NextResponse.json({ error: "Pret invalid" }, { status: 400 });
    }
    price = Math.round(p);
  }

  if (!title || !description || !category || !location) {
    return NextResponse.json(
      { error: "Titlu, descriere, categorie si locatie sunt obligatorii" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: { title, description, price, category, location, imageUrl },
  });

  return NextResponse.json({ listing });
}

// DELETE /api/listings/[id] - sterge anuntul (doar proprietarul)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const existing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Anunt inexistent" }, { status: 404 });
  }
  if (existing.userId !== session.userId) {
    return NextResponse.json({ error: "Nu ai dreptul sa stergi" }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
