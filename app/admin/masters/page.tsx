import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminMastersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/masters");
  }

  const masters = await db.master.findMany({
    include: {
      parentLinks: {
        include: {
          parentMaster: true,
        },
      },
      wikiEntry: true,
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Admin: Masters</h1>
        <Link
          href="/admin/masters/new"
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-active)]"
        >
          Add Master
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-[var(--hairline)] bg-[var(--canvas)]">
        <table className="min-w-full divide-y divide-[var(--hairline)] text-sm">
          <thead className="bg-[var(--surface-card)] text-[var(--body)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Parent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Wiki</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hairline)]">
            {masters.map((master) => (
              <tr key={master.id}>
                <td className="px-4 py-3">{master.name ?? "Unknown"}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {master.parentLinks[0]?.parentMaster?.name ?? "-"}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {master.wikiEntry?.content ? "Present" : "Empty"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/masters/${master.id}/edit`}
                    className="text-[var(--primary)] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
