"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Eroare la autentificare");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Autentificare</h1>
      <form onSubmit={submit} className="space-y-3">
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
          <label className="block text-sm font-medium mb-1">Parola</label>
          <input
            type="password"
            required
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
          {loading ? "Se autentifica..." : "Autentifica-te"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Nu ai cont?{" "}
        <Link href="/register" className="text-brand font-semibold underline">
          Creeaza unul
        </Link>
      </p>
    </div>
  );
}
