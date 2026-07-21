import { useEffect, useMemo, useState } from "react";
import type { Level, Platform } from "../../context/AuthContext";
import { getTeamAttempts, type TeamAttempt } from "../../api/manager";
import { selectClass } from "../admin/Modal";

const PLATFORMS: Platform[] = ["AWS", "AZURE", "DATABASE", "AUTOMATION", "FRONTEND", "BACKEND"];
const LEVELS: Level[] = ["L1", "L2", "L3"];

export function TeamReportsPanel() {
  const [attempts, setAttempts] = useState<TeamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [platformFilter, setPlatformFilter] = useState<Platform | "">("");
  const [levelFilter, setLevelFilter] = useState<Level | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "IN_PROGRESS" | "COMPLETED">("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTeamAttempts();
        if (!cancelled) setAttempts(data);
      } catch {
        if (!cancelled) setError("Couldn't load reports. Try refreshing.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return attempts.filter((a) => {
      if (platformFilter && a.user.platform !== platformFilter) return false;
      if (levelFilter && a.user.level !== levelFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!a.user.name.toLowerCase().includes(q) && !a.user.email.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [attempts, platformFilter, levelFilter, statusFilter, search]);

  const completed = filtered.filter((a) => a.status === "COMPLETED" && a.score !== null);
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length)
    : null;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-text">Team reports</h2>
        <div className="flex flex-wrap gap-3">
          <input
            className={`${selectClass} w-48`}
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={selectClass}
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | "")}
          >
            <option value="">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            className={selectClass}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as Level | "")}
          >
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | "IN_PROGRESS" | "COMPLETED")}
          >
            <option value="">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In progress</option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total attempts" value={String(filtered.length)} />
        <StatCard label="Completed" value={String(completed.length)} />
        <StatCard label="Average score" value={avgScore !== null ? `${avgScore}%` : "—"} />
        <StatCard
          label="Pass rate (≥70%)"
          value={
            completed.length
              ? `${Math.round((completed.filter((a) => (a.score || 0) >= 70).length / completed.length) * 100)}%`
              : "—"
          }
        />
      </div>

      {error && (
        <p role="alert" className="mt-6 font-body text-sm text-red-300">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-6 font-body text-sm text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 font-body text-sm text-muted">No attempts match these filters.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-panel-line bg-panel">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-panel-line">
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Employee</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Assessment</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Platform / Level</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Status</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Score</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-line">
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3">
                    <p className="font-body text-sm text-text">{a.user.name}</p>
                    <p className="font-mono text-[11px] text-muted">{a.user.email}</p>
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">{a.quiz.title}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">
                    {a.user.platform} · {a.user.level}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">
                    {a.status === "COMPLETED" ? "completed" : "in progress"}
                  </td>
                  <td className="px-5 py-3">
                    {a.score !== null ? (
                      <span
                        className={`font-mono text-sm font-medium ${
                          a.score >= 70 ? "text-accent" : "text-accent-amber"
                        }`}
                      >
                        {Math.round(a.score)}%
                      </span>
                    ) : (
                      <span className="font-mono text-sm text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-muted">
                    {new Date(a.startedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-panel-line bg-panel px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-text">{value}</p>
    </div>
  );
}
