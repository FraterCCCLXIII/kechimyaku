"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Visible (or screen-reader-only) title used for ARIA labelling. */
  title: ReactNode;
  /** When true, the title is rendered for accessibility but visually hidden. */
  hideTitle?: boolean;
  /** Optional media region rendered at the very top of the panel. */
  media?: ReactNode;
  /** Footer region — typically holds dismiss / confirm controls. */
  footer?: ReactNode;
  children: ReactNode;
  size?: ModalSize;
  /** Close when the backdrop is clicked. Defaults to true. */
  closeOnBackdrop?: boolean;
  /** Close when Escape is pressed. Defaults to true. */
  closeOnEscape?: boolean;
  /** Render the top-right close button. Defaults to true. */
  showCloseButton?: boolean;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

/**
 * Accessible modal dialog primitive.
 *
 * - Renders into a portal on `document.body` so the panel escapes ancestor
 *   stacking contexts.
 * - Traps initial focus inside the panel and restores focus to the previously
 *   focused element on close.
 * - Locks body scroll while open.
 * - Closes on Escape and (optionally) backdrop click.
 */
export function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  media,
  footer,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelector<HTMLElement>(
      "[data-autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.stopPropagation();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open, closeOnEscape, handleClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      aria-hidden={false}
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={closeOnBackdrop ? handleClose : undefined}
        className="absolute inset-0 cursor-default bg-[rgba(20,20,19,0.55)] backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "relative z-10 flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--card)] shadow-xl",
          sizeClass[size],
        ].join(" ")}
      >
        {media ? <div className="shrink-0">{media}</div> : null}
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <h2
            id={titleId}
            className={[
              "text-lg font-medium tracking-tight text-[var(--ink)] [font-family:Georgia,_'Times_New_Roman',_serif]",
              hideTitle ? "sr-only" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {title}
          </h2>
          {showCloseButton ? (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="-mr-2 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
        <div className="overflow-y-auto px-6 pb-5 pt-3 text-sm leading-6 text-[var(--body)]">
          {children}
        </div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] bg-[var(--canvas)] px-6 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
