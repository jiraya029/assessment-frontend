import { useAuth } from "../context/AuthContext";

export function PlaceholderDashboard({ label }: { label: string }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            {label}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-text">
            Welcome, {user?.name}
          </h1>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-panel-line px-3.5 py-2 font-body text-sm text-text transition-colors hover:border-accent"
        >
          Sign out
        </button>
      </div>
      <p className="mt-8 font-body text-sm text-muted">
        This interface is next up — {label.toLowerCase()} views are being
        built.
      </p>
    </div>
  );
}
