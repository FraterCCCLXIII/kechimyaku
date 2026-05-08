"use client";

import {
  type ReactNode,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

type Align = "left" | "right";

type DropdownProps = {
  /** Renders the trigger button. Receives helpers for ARIA wiring. */
  trigger: (args: {
    open: boolean;
    toggle: () => void;
    triggerProps: ButtonHTMLAttributes<HTMLButtonElement>;
  }) => ReactNode;
  children: ReactNode;
  align?: Align;
  /** Optional className for the menu panel. */
  menuClassName?: string;
};

/**
 * A small, accessible dropdown menu primitive.
 * - Closes on Escape, click outside, and selection (consumers can opt out
 *   per-item via stopPropagation).
 * - Designed to compose with the `<DropdownItem>` and `<DropdownLink>`
 *   components below.
 */
export function Dropdown({
  trigger,
  children,
  align = "right",
  menuClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        close();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {trigger({
        open,
        toggle,
        triggerProps: {
          type: "button",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          "aria-controls": menuId,
          onClick: toggle,
        },
      })}
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={[
            "absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-[var(--hairline)] bg-white shadow-lg",
            align === "right" ? "right-0" : "left-0",
            menuClassName ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => close()}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

const itemBase =
  "block w-full px-3 py-2 text-left text-sm !text-[var(--body)] hover:bg-[var(--surface-card)] hover:!text-[var(--ink)] focus:bg-[var(--surface-card)] focus:outline-none";

type DropdownItemProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function DropdownItem({
  className,
  children,
  ...rest
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[itemBase, className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

type DropdownLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Anchor variant for navigation menu items. Use a Next.js <Link> wrapper
 * if client-side navigation is needed; this stays primitive on purpose.
 */
export function DropdownLink({
  className,
  children,
  ...rest
}: DropdownLinkProps) {
  return (
    <a
      role="menuitem"
      className={[itemBase, className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </a>
  );
}

export function DropdownDivider() {
  return <div className="h-px bg-[var(--hairline)]" role="separator" />;
}
