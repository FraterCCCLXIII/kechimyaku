import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TeachersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/teachers");
  }

  const masters = await db.master.findMany({
    include: {
      parentLinks: {
        include: {
          parentMaster: true,
        },
      },
      childLinks: {
        include: {
          childMaster: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Teachers</h1>
        <Link
          href="/teachers/new"
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm font-medium !text-white hover:bg-[var(--primary-active)] hover:!text-white"
        >
          Add Teacher
        </Link>
      </div>
      <div className="overflow-x-auto rounded border border-[var(--hairline)] bg-[var(--canvas)]">
        <table className="min-w-full divide-y divide-[var(--hairline)] text-sm">
          <thead className="bg-[var(--surface-card)] text-[var(--body)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Native Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Years</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Parents</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Students</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hairline)]">
            {masters.map((master) => (
              <tr key={master.id}>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/masters/${master.id}`} className="text-[var(--primary)] hover:underline">
                    {master.name ?? "Unknown"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{master.nameNative ?? "-"}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {master.yearBorn ?? "?"} - {master.yearDied ?? "?"}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{master.parentLinks.length}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{master.childLinks.length}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/teachers/${master.id}/edit`}
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
