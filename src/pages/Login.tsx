import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DiagnosticPanel } from "../components/DiagnosticPanel";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  EMPLOYEE: "/employee",
};

export function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        "Couldn't sign in. Check your email and password.";
      setError(message);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            Assessment Console
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text">
            Sign in
          </h1>
          <p className="mt-2 font-body text-sm text-muted">
            Use your organization account. Admins, managers, and employees
            all sign in here.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block font-body text-sm font-medium text-text"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@org.com"
                className="mt-1.5 w-full rounded-md border border-panel-line bg-panel px-3.5 py-2.5 font-body text-sm text-text placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-body text-sm font-medium text-text"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-md border border-panel-line bg-panel px-3.5 py-2.5 font-body text-sm text-text placeholder:text-muted/60 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-900/50 bg-red-950/40 px-3.5 py-2.5 font-body text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-accent px-4 py-2.5 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink disabled:opacity-50"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      {/* Right: diagnostic panel, hidden on small screens */}
      <div className="hidden bg-panel lg:block">
        <DiagnosticPanel />
      </div>
    </div>
  );
}
