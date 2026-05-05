"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TeacherOption = {
  id: number;
  name: string | null;
  nameNative: string | null;
};

export function NavSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadTeachers = async () => {
      try {
        const response = await fetch("/api/teachers");
        if (!response.ok) return;
        const payload = (await response.json()) as TeacherOption[];
        if (mounted) setTeachers(payload);
      } catch {
        // Ignore typeahead fetch failures and keep form-only fallback.
      }
    };

    void loadTeachers();
    return () => {
      mounted = false;
    };
  }, []);

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return teachers
      .filter((teacher) => {
        const latin = teacher.name?.toLowerCase() ?? "";
        const native = teacher.nameNative?.toLowerCase() ?? "";
        return latin.includes(trimmed) || native.includes(trimmed);
      })
      .slice(0, 8);
  }, [query, teachers]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/teachers");
      return;
    }

    router.push(`/teachers?search=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  const onSelectSuggestion = (teacher: TeacherOption) => {
    router.push(`/masters/${teacher.id}`);
    setOpen(false);
    setQuery(teacher.name ?? "");
  };

  return (
    <form onSubmit={onSubmit} className="relative w-80">
      <input
        type="text"
        aria-label="Search Zen Teachers"
        placeholder="Search Zen Teachers..."
        value={query}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!open) setOpen(true);
        }}
        className="w-full rounded border border-[var(--hairline)] bg-white px-9 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      {open ? (
        <div className="absolute z-40 mt-1 w-full rounded border border-[var(--hairline)] bg-white shadow-sm">
          <div className="border-b border-[var(--hairline)] p-2">
            <div className="relative">
              <input
                type="text"
                aria-label="Search in dropdown"
                placeholder="Type to filter teachers..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded border border-[var(--hairline)] bg-[var(--canvas)] px-8 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none"
              />
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
            </div>
          </div>

          <div className="max-h-56 overflow-auto">
            {suggestions.length > 0 ? (
              suggestions.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--body)] hover:bg-[var(--surface-card)]"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelectSuggestion(teacher);
                  }}
                >
                  <span className="font-medium text-[var(--ink)]">{teacher.name ?? "Unknown"}</span>
                  {teacher.nameNative ? (
                    <span className="ml-1 text-[var(--muted)]">{teacher.nameNative}</span>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-[var(--muted)]">No matching teachers found.</div>
            )}
          </div>
        </div>
      ) : null}
    </form>
  );
}
