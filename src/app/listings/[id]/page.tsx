import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [session, listing] = await Promise.all([
    getSession(),
    prisma.listing.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, name: true, phone: true, email: true } } },
    }),
  ]);

  if (!listing) notFound();
  const isOwner = session?.userId === listing.userId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-contain bg-black/5"
              />
            ) : (
              <span className="text-gray-400">fara imagine</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-5 space-y-3">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="text-3xl font-bold text-brand">
            {listing.price.toLocaleString("ro-RO")} RON
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded">{listing.category}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">{listing.location}</span>
            <span className="bg-gray-100 px-2 py-1 rounded">
              Postat:{" "}
              {new Date(listing.createdAt).toLocaleDateString("ro-RO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div>
            <h2 className="font-semibold mt-4 mb-1">Descriere</h2>
            <p className="whitespace-pre-wrap text-gray-800">{listing.description}</p>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-semibold mb-3">Vanzator</h2>
          <div className="text-lg font-medium">{listing.user.name}</div>
          <div className="mt-3 space-y-1 text-sm">
            <div>
              <span className="text-gray-500">Telefon: </span>
              <a
                href={`tel:${listing.user.phone}`}
                className="text-brand font-semibold underline"
              >
                {listing.user.phone}
              </a>
            </div>
            <div>
              <span className="text-gray-500">Email: </span>
              <a
                href={`mailto:${listing.user.email}`}
                className="text-brand underline break-all"
              >
                {listing.user.email}
              </a>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="bg-white rounded-lg border p-5">
            <p className="text-sm text-gray-600 mb-2">Acesta este anuntul tau.</p>
            <Link
              href={`/listings/${listing.id}/edit`}
              className="block text-center bg-brand-accent text-brand font-semibold rounded py-2 hover:opacity-90"
            >
              Editeaza anuntul
            </Link>
          </div>
        )}

        <Link
          href="/"
          className="block text-center text-sm text-gray-600 hover:text-brand"
        >
          ← Inapoi la toate anunturile
        </Link>
      </aside>
    </div>
  );
}
