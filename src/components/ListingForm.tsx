"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "Electronice",
  "Auto",
  "Imobiliare",
  "Moda",
  "Casa & Gradina",
  "Sport",
  "Altele",
];

export type ListingFormInitial = {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  imageUrl?: string | null;
};

export default function ListingForm({
  initial,
  mode,
}: {
  initial?: ListingFormInitial;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<string>(
    initial?.price !== undefined ? String(initial.price) : ""
  );
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload esuat");
      return;
    }
    const data = await res.json();
    setImageUrl(data.url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      title,
      description,
      price: Number(price),
      category,
      location,
      imageUrl,
    };
    const url =
      mode === "create" ? "/api/listings" : `/api/listings/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eroare salvare");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm("Sterg anuntul?")) return;
    const res = await fetch(`/api/listings/${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div>
        <label className="block text-sm font-medium mb-1">Titlu</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="ex: iPhone 13 Pro 128GB"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descriere</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Pret (RON)</label>
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Locatie</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="ex: Bucuresti"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Imagine</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
          }}
          className="block text-sm"
        />
        {uploading && <p className="text-xs text-gray-500 mt-1">Se urca...</p>}
        {imageUrl && (
          <div className="mt-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="preview"
              className="w-32 h-32 object-cover rounded border"
            />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="text-sm text-red-600 underline"
            >
              Sterge imaginea
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="bg-brand text-white px-4 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {submitting
            ? "Se salveaza..."
            : mode === "create"
            ? "Publica anuntul"
            : "Salveaza modificarile"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="border border-red-300 text-red-600 px-4 py-2 rounded hover:bg-red-50"
          >
            Sterge anuntul
          </button>
        )}
      </div>
    </form>
  );
}
