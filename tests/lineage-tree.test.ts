import { describe, expect, it } from "vitest";
import { buildMasterTreeFromRecords } from "../lib/lineage/tree";
import type { MasterPayload } from "../lib/types";

const master = (id: number, name: string, isRoot = false): MasterPayload => ({
  id,
  name,
  nameNative: null,
  overview: null,
  yearBorn: null,
  yearDied: null,
  gender: null,
  location: null,
  isRoot,
});

describe("buildMasterTreeFromRecords", () => {
  it("uses explicit root when present", () => {
    const masters = [master(1, "Root", true), master(2, "Child")];
    const relationships = [{ parentMasterId: 1, childMasterId: 2 }];

    const tree = buildMasterTreeFromRecords(masters, relationships);
    expect(tree?.master.id).toBe(1);
    expect(tree?.children[0]?.master.id).toBe(2);
  });

  it("infers root when no explicit root exists", () => {
    const masters = [master(1, "A"), master(2, "B"), master(3, "C")];
    const relationships = [
      { parentMasterId: 1, childMasterId: 2 },
      { parentMasterId: 2, childMasterId: 3 },
    ];

    const tree = buildMasterTreeFromRecords(masters, relationships);
    expect(tree?.master.id).toBe(1);
    expect(tree?.children[0]?.master.id).toBe(2);
    expect(tree?.children[0]?.children[0]?.master.id).toBe(3);
  });
});
