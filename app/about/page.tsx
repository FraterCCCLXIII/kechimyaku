export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-medium tracking-tight">About Kechimyaku</h1>
      <p className="leading-7 text-[var(--body)]">
        Kechimyaku means bloodline or lineage. This project maps the Zen teacher
        lineage as an explorable graph and provides tools for maintaining teacher
        records and relationships.
      </p>
      <div className="rounded border border-[var(--hairline)] bg-[var(--canvas)] p-5">
        <h2 className="mb-2 text-lg font-semibold">Migration Goals</h2>
        <ul className="list-disc space-y-2 pl-6 text-[var(--body)]">
          <li>Modern React and Next.js architecture.</li>
          <li>Typed Prisma data layer with SQLite-first workflow.</li>
          <li>Secure admin authentication and editable wiki entries.</li>
        </ul>
      </div>
    </div>
  );
}
