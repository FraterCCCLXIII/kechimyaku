import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

type MasterPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MasterPage({ params }: MasterPageProps) {
  const { id } = await params;
  const masterId = Number.parseInt(id, 10);

  if (!Number.isInteger(masterId)) {
    notFound();
  }

  const master = await db.master.findUnique({
    where: { id: masterId },
    include: {
      wikiEntry: true,
      parentLinks: {
        include: {
          parentMaster: true,
          relationshipType: true,
        },
      },
      childLinks: {
        include: {
          childMaster: true,
          relationshipType: true,
        },
      },
    },
  });

  if (!master) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight [font-family:Georgia,_'Times_New_Roman',_serif]">
          {master.name ?? "Unknown"}{" "}
          {master.nameNative ? <span className="text-[var(--muted)]">{master.nameNative}</span> : null}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {master.yearBorn ?? "?"} - {master.yearDied ?? "?"} · {master.location ?? "Unknown location"}
        </p>
      </div>

      <section className="grid gap-10 md:grid-cols-[1fr_280px]">
        <article className="space-y-8">
          {master.overview ? (
            <p className="whitespace-pre-wrap text-[var(--body)]">{master.overview}</p>
          ) : (
            <p className="text-[var(--muted)]">
              A short overview has not been added for this teacher yet.
            </p>
          )}

          <div className="border-t border-[var(--hairline)] pt-6">
            {master.wikiEntry?.content ? (
              <p className="whitespace-pre-wrap text-[var(--body)]">{master.wikiEntry.content}</p>
            ) : (
              <p className="text-[var(--muted)]">
                No article has been written yet. This page will show the full article once
                content is added.
              </p>
            )}
          </div>
        </article>

        <aside className="space-y-8 border-l border-[var(--hairline)] pl-6">
          <div>
            <h3 className="mb-2 text-base font-semibold">Teachers</h3>
            <ul className="space-y-1 text-sm text-[var(--body)]">
              {master.parentLinks.length ? (
                master.parentLinks.map((relationship) => (
                  <li key={`${relationship.parentMasterId}-${relationship.childMasterId}`}>
                    <Link
                      href={`/masters/${relationship.parentMasterId}`}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {relationship.parentMaster.name ?? `Master #${relationship.parentMasterId}`}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No parent masters listed.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold">Students</h3>
            <ul className="space-y-1 text-sm text-[var(--body)]">
              {master.childLinks.length ? (
                master.childLinks.map((relationship) => (
                  <li key={`${relationship.parentMasterId}-${relationship.childMasterId}`}>
                    <Link
                      href={`/masters/${relationship.childMasterId}`}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {relationship.childMaster.name ?? `Master #${relationship.childMasterId}`}
                    </Link>
                  </li>
                ))
              ) : (
                <li>No students listed.</li>
              )}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
