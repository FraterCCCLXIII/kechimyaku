import { LineageGraph } from "@/components/lineage-graph";
import { getMasterTree } from "@/lib/lineage/tree";

type HomePageProps = {
  searchParams: Promise<{ focus?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { focus } = await searchParams;
  const focusMasterId = focus ? Number.parseInt(focus, 10) : null;
  const tree = await getMasterTree();

  if (!tree) {
    return (
      <div className="flex h-[calc(100vh-57px)] w-full items-center justify-center text-slate-600">
        No masters are available yet. Run the import script to populate data.
      </div>
    );
  }

  return <LineageGraph tree={tree} focusMasterId={Number.isInteger(focusMasterId) ? focusMasterId : null} />;
}
