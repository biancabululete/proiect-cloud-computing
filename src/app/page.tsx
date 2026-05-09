import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import ListingCard from "@/components/ListingCard";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; category?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [session, listings] = await Promise.all([
    getSession(),
    prisma.listing.findMany({
      where: {
        ...(searchParams.q
          ? {
              OR: [
                { title: { contains: searchParams.q, mode: "insensitive" } },
                { description: { contains: searchParams.q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(searchParams.category ? { category: searchParams.category } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-2">Toate anunturile</h1>
        <p className="text-sm text-gray-600 mb-4">
          {listings.length}{" "}
          {listings.length === 1 ? "anunt disponibil" : "anunturi disponibile"}
        </p>
        <SearchBar defaultQ={searchParams.q} defaultCategory={searchParams.category} />
      </div>

      {listings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center text-gray-500">
          Niciun anunt momentan. Fii primul care posteaza!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={{
                id: l.id,
                title: l.title,
                price: l.price,
                location: l.location,
                category: l.category,
                imageUrl: l.imageUrl,
                createdAt: l.createdAt,
                user: l.user,
              }}
              isOwner={session?.userId === l.userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
