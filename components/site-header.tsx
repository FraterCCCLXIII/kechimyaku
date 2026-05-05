import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButtons } from "@/components/auth-buttons";
import { NavSearch } from "@/components/nav-search";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-[var(--hairline)] bg-[var(--canvas)]">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-normal text-[var(--ink)]">
            <span className="h-4 w-4 rounded-full border-2 border-[var(--primary)] bg-white" />
            <span className="[font-family:Georgia,_'Times_New_Roman',_serif]">Kechimyaku</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="!text-[var(--muted)] hover:!text-[var(--body)]">
              Graph
            </Link>
            <Link href="/teachers" className="!text-[var(--muted)] hover:!text-[var(--body)]">
              Teachers
            </Link>
            <Link href="/about" className="!text-[var(--muted)] hover:!text-[var(--body)]">
              About
            </Link>
          </nav>
        </div>
        <div className="flex justify-center">
          <NavSearch />
        </div>
        <div className="flex justify-end">
          <AuthButtons isAuthenticated={Boolean(session?.user?.id)} />
        </div>
      </div>
    </header>
  );
}
