import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ListingForm from "@/components/ListingForm";

export default async function PostPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Adauga anunt nou</h1>
      <ListingForm mode="create" />
    </div>
  );
}
