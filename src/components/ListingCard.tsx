import Link from "next/link";

export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  imageUrl: string | null;
  createdAt: string | Date;
  user: { id: string; name: string };
};

export default function ListingCard({
  listing,
  isOwner,
}: {
  listing: ListingCardData;
  isOwner: boolean;
}) {
  return (
    <article className="bg-white rounded-lg shadow-sm border hover:shadow-md transition flex flex-col overflow-hidden">
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">fara imagine</span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-2 mb-1">{listing.title}</h3>
        <div className="text-brand font-bold text-lg mb-1">
          {listing.price.toLocaleString("ro-RO")} RON
        </div>
        <div className="text-xs text-gray-500 mt-auto">
          {listing.location} • {listing.category}
        </div>
        <div className="text-xs text-gray-400 mt-1">de {listing.user.name}</div>
        {isOwner && (
          <Link
            href={`/listings/${listing.id}/edit`}
            className="mt-2 text-center text-sm bg-brand-accent text-brand font-semibold rounded py-1.5 hover:opacity-90"
          >
            Editeaza
          </Link>
        )}
      </div>
    </article>
  );
}
