import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Anunturi Cloud",
  description: "Platforma simpla de anunturi - proiect Cloud Computing",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="ro">
      <body className="min-h-screen flex flex-col">
        <Navbar session={session} />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
        <footer className="border-t bg-white py-4 text-center text-xs text-gray-500">
          Proiect Cloud Computing - Bululete Bianca-Maria
        </footer>
      </body>
    </html>
  );
}
