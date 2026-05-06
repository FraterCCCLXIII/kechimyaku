import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MasterForm } from "@/components/master-form";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewIndexArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/index/new");
  }

  const masters = await db.master.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-medium tracking-tight">Add Article</h1>
      <MasterForm mode="create" masters={masters} />
    </div>
  );
}
