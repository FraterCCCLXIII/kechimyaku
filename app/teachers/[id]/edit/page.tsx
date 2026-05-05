import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { MasterForm } from "@/components/master-form";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTeacherPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const masterId = Number.parseInt(id, 10);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/teachers/${id}/edit`);
  }

  if (!Number.isInteger(masterId)) {
    notFound();
  }

  const [master, masters] = await Promise.all([
    db.master.findUnique({
      where: { id: masterId },
      include: {
        wikiEntry: true,
        parentLinks: {
          select: {
            parentMasterId: true,
            relationshipTypeId: true,
          },
        },
      },
    }),
    db.master.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  if (!master) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-medium tracking-tight">Edit Teacher</h1>
      <MasterForm mode="edit" masters={masters} master={master} />
    </div>
  );
}
