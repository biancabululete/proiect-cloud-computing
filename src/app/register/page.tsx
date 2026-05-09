"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eroare la inregistrare");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Cont nou</h1>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nume</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Numar de telefon</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="07xx xxx xxx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Parola{" "}
            <span className="text-xs text-gray-500 font-normal">(min 8 caractere)</span>
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white rounded py-2 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Se creeaza..." : "Creeaza cont"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Ai deja cont?{" "}
        <Link href="/login" className="text-brand font-semibold underline">
          Autentifica-te
        </Link>
      </p>
    </div>
  );
}
