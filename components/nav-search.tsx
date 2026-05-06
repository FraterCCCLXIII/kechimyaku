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
      router.push("/index");
      return;
    }

    router.push(`/index?search=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  const onSelectSuggestion = (teacher: TeacherOption) => {
    router.push(`/index/${teacher.id}`);
    setOpen(false);
    setQuery(teacher.name ?? "");
  };

  const onGraphSuggestion = (teacher: TeacherOption) => {
    router.push(`/?focus=${teacher.id}`);
    setOpen(false);
    setQuery(teacher.name ?? "");
  };

  return (
    <form onSubmit={onSubmit} className="relative w-80">
      <input
        type="text"
        aria-label="Search Directory"
        placeholder="Search directory..."
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
          <div className="max-h-56 overflow-auto">
            {suggestions.length > 0 ? (
              suggestions.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--body)] hover:bg-[var(--surface-card)]"
                >
                  <button
                    type="button"
                    className="flex-1 truncate rounded px-1 py-1 text-left"
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
                  <button
                    type="button"
                    aria-label={`Open ${teacher.name ?? "entry"} on graph`}
                    title="Open on graph"
                    className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--body)]"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onGraphSuggestion(teacher);
                    }}
                  >
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
                      <circle cx="5" cy="5" r="2" />
                      <circle cx="19" cy="5" r="2" />
                      <circle cx="12" cy="19" r="2" />
                      <line x1="7" y1="5" x2="17" y2="5" />
                      <line x1="6.5" y1="6.5" x2="10.5" y2="17" />
                      <line x1="17.5" y1="6.5" x2="13.5" y2="17" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={`Open ${teacher.name ?? "entry"} article`}
                    title="Open article"
                    className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--body)]"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onSelectSuggestion(teacher);
                    }}
                  >
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                      <line x1="8" y1="17" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-[var(--muted)]">No matching entries found.</div>
            )}
          </div>
        </div>
      ) : null}
    </form>
  );
}
