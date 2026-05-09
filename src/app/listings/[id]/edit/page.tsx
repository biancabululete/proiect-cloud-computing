import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingForm from "@/components/ListingForm";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) notFound();
  if (listing.userId !== session.userId) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border">
        <h1 className="text-xl font-bold text-red-600">Acces interzis</h1>
        <p className="text-sm text-gray-600">Nu poti edita un anunt care nu este al tau.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editeaza anunt</h1>
      <ListingForm
        mode="edit"
        initial={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          location: listing.location,
          imageUrl: listing.imageUrl,
        }}
      />
    </div>
  );
}
