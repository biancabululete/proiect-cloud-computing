import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// POST /api/upload - urca o imagine in Vercel Blob, returneaza URL public
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Lipseste fisierul" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Tip de fisier nepermis (jpeg/png/webp)" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Fisier prea mare (max 5 MB)" }, { status: 413 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const key = `listings/${session.userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const blob = await put(key, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
