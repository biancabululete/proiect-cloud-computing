"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/auth";

export default function Navbar({ session }: { session: SessionPayload | null }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <nav className="bg-brand text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-brand-accent">
          Anunturi<span className="text-white">.cloud</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <Link
                href="/post"
                className="bg-brand-accent text-brand font-semibold px-3 py-1.5 rounded hover:opacity-90"
              >
                + Adauga anunt
              </Link>
              <span className="hidden sm:inline opacity-80">Salut, {session.name}</span>
              <button
                onClick={handleLogout}
                className="border border-white/40 px-3 py-1.5 rounded hover:bg-white/10"
              >
                Iesire
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Autentificare
              </Link>
              <Link
                href="/register"
                className="bg-brand-accent text-brand font-semibold px-3 py-1.5 rounded hover:opacity-90"
              >
                Cont nou
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
