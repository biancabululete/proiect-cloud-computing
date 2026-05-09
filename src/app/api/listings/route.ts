import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/listings - lista toate anunturile
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();

  const listings = await prisma.listing.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, phone: true } },
    },
  });

  return NextResponse.json({ listings });
}

// POST /api/listings - creeaza un anunt nou (necesita autentificare)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body invalid" }, { status: 400 });

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const priceRaw = body.price;
  const category = String(body.category ?? "").trim();
  const location = String(body.location ?? "").trim();
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;

  const price = Number(priceRaw);
  if (!title || !description || !category || !location) {
    return NextResponse.json(
      { error: "Titlu, descriere, categorie si locatie sunt obligatorii" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Pret invalid" }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: Math.round(price),
      category,
      location,
      imageUrl,
      userId: session.userId,
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
