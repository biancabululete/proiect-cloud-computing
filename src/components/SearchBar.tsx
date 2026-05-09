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

export default function SearchBar({
  defaultQ,
  defaultCategory,
}: {
  defaultQ?: string;
  defaultCategory?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ ?? "");
  const [category, setCategory] = useState(defaultCategory ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cauta anunturi..."
        className="flex-1 border rounded px-3 py-2"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Toate categoriile</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-brand text-white px-4 py-2 rounded hover:opacity-90"
      >
        Cauta
      </button>
    </form>
  );
}
