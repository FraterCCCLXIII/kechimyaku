import Link from "next/link";

export default function ContributePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-medium tracking-tight">Contribute</h1>

      <p className="leading-7 text-[var(--body)]">
        Kechimyaku is an open project for exploring and sharing Zen and related
        Buddhist teacher lineages—as maps, articles, and structured data. The
        project began in <strong>April 2018</strong>. The site is improved
        periodically: features, data quality, and presentation all continue to
        evolve.
      </p>

      <p className="leading-7 text-[var(--body)]">
        For background on the term <em>kechimyaku</em> and what this project aims
        to do, see the{" "}
        <Link href="/about" className="text-[var(--primary)] underline-offset-2 hover:underline">
          About
        </Link>{" "}
        page.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-[var(--ink)]">Ways to help</h2>
        <ul className="list-disc space-y-2 pl-5 leading-7 text-[var(--body)]">
          <li>
            <strong>Articles and data.</strong> Expand or correct biographical
            notes, dates, and relationships in the directory. Use{" "}
            <Link
              href="/index/new"
              className="text-[var(--primary)] underline-offset-2 hover:underline"
            >
              Add Article
            </Link>{" "}
            (sign in where required) or edit existing entries so the public record
            stays accurate and well sourced.
          </li>
          <li>
            <strong>Code and tooling.</strong> Improvements to the graph, search,
            accessibility, performance, and data workflows are welcome. If you work
            from a Git checkout, use issues and pull requests the way you would for
            any open codebase; the app is built with Next.js, React, Prisma, and
            SQLite.
          </li>
          <li>
            <strong>Donations.</strong> Financial support helps cover hosting,
            domains, and time for maintenance and new work. If you’d like to
            contribute money, watch this page and project channels for a formal
            option, or reach out to whoever maintains your deployment with the word{" "}
            <em>Kechimyaku</em> in the subject so routing stays clear.
          </li>
        </ul>
      </section>

      <p className="text-sm leading-6 text-[var(--muted)]">
        Thank you for helping keep lineage information careful, legible, and
        available to students, scholars, and the curious.
      </p>
    </div>
  );
}
