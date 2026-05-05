import { db } from "@/lib/db";
import type { MasterPayload, MasterTreeNode } from "@/lib/types";

const masterToPayload = (master: {
  id: number;
  name: string | null;
  nameNative: string | null;
  overview: string | null;
  yearBorn: number | null;
  yearDied: number | null;
  gender: string | null;
  location: string | null;
  isRoot: boolean | null;
}): MasterPayload => ({
  id: master.id,
  name: master.name,
  nameNative: master.nameNative,
  overview: master.overview,
  yearBorn: master.yearBorn,
  yearDied: master.yearDied,
  gender: master.gender,
  location: master.location,
  isRoot: master.isRoot,
});

const buildNode = (
  rootId: number,
  mastersById: Map<number, MasterPayload>,
  childrenByParentId: Map<number, number[]>,
  visited: Set<number>,
): MasterTreeNode => {
  const master = mastersById.get(rootId);
  if (!master) {
    throw new Error(`Master ${rootId} not found while building tree`);
  }

  if (visited.has(rootId)) {
    return { master, children: [] };
  }
  visited.add(rootId);

  const children = (childrenByParentId.get(rootId) ?? [])
    .filter((childId) => mastersById.has(childId))
    .map((childId) => buildNode(childId, mastersById, childrenByParentId, visited));

  return { master, children };
};

export const buildMasterTreeFromRecords = (
  masters: MasterPayload[],
  relationships: { parentMasterId: number; childMasterId: number }[],
): MasterTreeNode | null => {
  if (!masters.length) {
    return null;
  }

  const mastersById = new Map<number, MasterPayload>(
    masters.map((master) => [master.id, master]),
  );

  const childrenByParentId = new Map<number, number[]>();
  for (const relationship of relationships) {
    const existing = childrenByParentId.get(relationship.parentMasterId) ?? [];
    existing.push(relationship.childMasterId);
    childrenByParentId.set(relationship.parentMasterId, existing);
  }

  const childIds = new Set(relationships.map((relationship) => relationship.childMasterId));
  const explicitRoot = masters.find((master) => master.isRoot);
  const inferredRoot = masters.find((master) => !childIds.has(master.id));
  const rootMaster = explicitRoot ?? inferredRoot ?? masters[0];

  return buildNode(rootMaster.id, mastersById, childrenByParentId, new Set<number>());
};

export const getMasterTree = async (): Promise<MasterTreeNode | null> => {
  const [masters, relationships] = await Promise.all([
    db.master.findMany({
      orderBy: [{ name: "asc" }],
    }),
    db.relationship.findMany({
      select: {
        parentMasterId: true,
        childMasterId: true,
      },
    }),
  ]);

  return buildMasterTreeFromRecords(
    masters.map((master) => masterToPayload(master)),
    relationships,
  );
};
