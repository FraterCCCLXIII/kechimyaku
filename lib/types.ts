export type MasterPayload = {
  id: number;
  name: string | null;
  nameNative: string | null;
  overview: string | null;
  yearBorn: number | null;
  yearDied: number | null;
  gender: string | null;
  location: string | null;
  isRoot: boolean | null;
};

export type MasterTreeNode = {
  master: MasterPayload;
  children: MasterTreeNode[];
};
