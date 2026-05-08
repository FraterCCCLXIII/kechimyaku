"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";

const STORAGE_KEY = "kechimyaku.welcome.dismissed.v1";

/**
 * First-visit welcome dialog. Renders client-side only, after mount, so it
 * never causes hydration mismatches. Dismissal is persisted via localStorage
 * when the user opts into "Don't show again".
 */
export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY) === "true";
      if (!dismissed) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }
    }
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Welcome to Kechimyaku"
      size="lg"
      showCloseButton={false}
      media={
        <div className="bg-[var(--surface-card)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/welcome-kechimyaku.jpg"
            alt="Excerpt of a kechimyaku — a Zen lineage scroll recording teacher-to-student transmission."
            className="block h-auto w-full select-none"
            draggable={false}
          />
        </div>
      }
      footer={
        <>
          <label className="flex items-center gap-2 text-sm text-[var(--body)]">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
              className="h-4 w-4 rounded border-[var(--hairline)] accent-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            />
            Don&rsquo;t show this again
          </label>
          <button
            type="button"
            onClick={handleClose}
            data-autofocus
            className="rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-active)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Get started
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p>
          Kechimyaku (血脈) is a Japanese term for a lineage chart — a record of
          teacher-to-student transmission used in Zen and related Buddhist
          traditions to remember how practice has been passed down across
          generations.
        </p>
        <p>
          This project is a tool for documenting those relationships, preserving
          sources, and exploring how transmission has been described across
          places, periods, and schools. Use the graph to trace lineages, the
          index to browse masters, and contribute corrections or additions where
          you see them.
        </p>
        <p className="text-[var(--muted)]">
          Read more on the{" "}
          <Link
            href="/about"
            onClick={handleClose}
            className="underline decoration-[var(--hairline)] underline-offset-2 hover:decoration-[var(--primary)]"
          >
            About page
          </Link>
          .
        </p>
      </div>
    </Modal>
  );
}
