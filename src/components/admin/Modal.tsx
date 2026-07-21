import type { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg border border-panel-line bg-panel p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 font-body text-sm text-muted transition-colors hover:text-text"
          >
            ✕
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-body text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-panel-line bg-ink px-3 py-2 font-body text-sm text-text outline-none transition-colors focus:border-accent";

export const selectClass = inputClass;
