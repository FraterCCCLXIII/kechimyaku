"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MasterOption = {
  id: number;
  name: string | null;
};

type ExistingMaster = {
  id: number;
  name: string | null;
  nameNative: string | null;
  overview: string | null;
  yearBorn: number | null;
  yearDied: number | null;
  gender: string | null;
  location: string | null;
  isRoot: boolean | null;
  wikiEntry?: {
    content: string;
  } | null;
  parentLinks?: { parentMasterId: number; relationshipTypeId: number | null }[];
};

type MasterFormProps = {
  mode: "create" | "edit";
  masters: MasterOption[];
  master?: ExistingMaster;
};

export function MasterForm({ mode, masters, master }: MasterFormProps) {
  const router = useRouter();
  const [name, setName] = useState(master?.name ?? "");
  const [nameNative, setNameNative] = useState(master?.nameNative ?? "");
  const [overview, setOverview] = useState(master?.overview ?? "");
  const [yearBorn, setYearBorn] = useState(master?.yearBorn?.toString() ?? "");
  const [yearDied, setYearDied] = useState(master?.yearDied?.toString() ?? "");
  const [gender, setGender] = useState(master?.gender ?? "");
  const [location, setLocation] = useState(master?.location ?? "");
  const [isRoot, setIsRoot] = useState(Boolean(master?.isRoot));
  const [parentMasterId, setParentMasterId] = useState(
    master?.parentLinks?.[0]?.parentMasterId?.toString() ?? "",
  );
  const [wikiContent, setWikiContent] = useState(master?.wikiEntry?.content ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const payload = {
    name,
    nameNative: nameNative || null,
    overview: overview || null,
    yearBorn: yearBorn ? Number.parseInt(yearBorn, 10) : null,
    yearDied: yearDied ? Number.parseInt(yearDied, 10) : null,
    gender: gender || null,
    location: location || null,
    isRoot,
    parentMasterId: parentMasterId ? Number.parseInt(parentMasterId, 10) : null,
    relationshipTypeId: null,
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const endpoint =
      mode === "create" ? "/api/admin/masters" : `/api/admin/masters/${master?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setSaving(false);
      setError("Failed to save master");
      return;
    }

    const savedMaster = (await response.json()) as { id: number };
    if (wikiContent) {
      await fetch(`/api/admin/wiki/${savedMaster.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: wikiContent }),
      });
    }

    setSaving(false);
    router.push("/index");
    router.refresh();
  };

  const remove = async () => {
    if (!master) return;
    const shouldDelete = window.confirm("Delete this master?");
    if (!shouldDelete) return;

    const response = await fetch(`/api/admin/masters/${master.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Failed to delete master");
      return;
    }

    router.push("/index");
    router.refresh();
  };

  return (
    <form
      onSubmit={save}
      className="space-y-5 rounded border border-[var(--hairline)] bg-[var(--canvas)] p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Name</span>
          <input
            className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Native Name</span>
          <input
            className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
            value={nameNative}
            onChange={(event) => setNameNative(event.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Year Born</span>
          <input
            className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
            value={yearBorn}
            onChange={(event) => setYearBorn(event.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Year Died</span>
          <input
            className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
            value={yearDied}
            onChange={(event) => setYearDied(event.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Gender</span>
          <input
            className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
            value={gender}
            onChange={(event) => setGender(event.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Location</span>
          <input
            className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium">Overview</span>
        <textarea
          className="h-24 w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
          value={overview}
          onChange={(event) => setOverview(event.target.value)}
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Parent Master</span>
        <select
          className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2"
          value={parentMasterId}
          onChange={(event) => setParentMasterId(event.target.value)}
        >
          <option value="">No parent</option>
          {masters
            .filter((option) => option.id !== master?.id)
            .map((option) => (
              <option key={option.id} value={option.id}>
                {option.name ?? `Master #${option.id}`}
              </option>
            ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isRoot} onChange={(event) => setIsRoot(event.target.checked)} />
        <span className="text-sm">Mark as root master</span>
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Wiki Content</span>
        <textarea
          className="h-48 w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-3 py-2 font-mono text-sm"
          value={wikiContent}
          onChange={(event) => setWikiContent(event.target.value)}
        />
      </label>

      {error ? <p className="text-sm text-[var(--primary)]">{error}</p> : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-[var(--primary)] px-4 py-2 font-medium text-white hover:bg-[var(--primary-active)] disabled:opacity-60"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Master" : "Save Changes"}
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            onClick={remove}
            className="rounded border border-[var(--primary-disabled)] px-4 py-2 text-[var(--primary)] hover:bg-[var(--surface-card)]"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
