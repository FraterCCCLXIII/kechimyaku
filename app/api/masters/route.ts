import { NextResponse } from "next/server";
import { getMasterTree } from "@/lib/lineage/tree";

export async function GET() {
  const tree = await getMasterTree();
  if (!tree) {
    return NextResponse.json({ error: "No masters found" }, { status: 404 });
  }

  return NextResponse.json(tree);
}
