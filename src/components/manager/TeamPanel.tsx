import { useEffect, useMemo, useState } from "react";
import { getTeam, getTeamAttempts, type TeamMember, type TeamAttempt } from "../../api/manager";

export function TeamPanel() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [attempts, setAttempts] = useState<TeamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [t, a] = await Promise.all([getTeam(), getTeamAttempts()]);
        if (!cancelled) {
          setTeam(t);
          setAttempts(a);
        }
      } catch {
        if (!cancelled) setError("Couldn't load your team. Try refreshing.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summaries = useMemo(() => {
    return team.map((member) => {
      const memberAttempts = attempts.filter((a) => a.userId === member.id);
      const completed = memberAttempts.filter((a) => a.status === "COMPLETED" && a.score !== null);
      const avg = completed.length
        ? Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length)
        : null;
      // team/attempts is already ordered by startedAt desc, so the first
      // match for this member is their most recent attempt.
      const last = memberAttempts[0];
      return { member, attemptCount: memberAttempts.length, avg, lastAt: last?.startedAt || null };
    });
  }, [team, attempts]);

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-text">Your team</h2>

      {error && (
        <p role="alert" className="mt-4 font-body text-sm text-red-300">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-4 font-body text-sm text-muted">Loading…</p>
      ) : team.length === 0 ? (
        <p className="mt-4 font-body text-sm text-muted">
          No one reports to you yet — ask your admin to assign employees to you.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-panel-line bg-panel">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-panel-line">
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Name</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Email</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Platform / Level</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Attempts</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Avg score</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-line">
              {summaries.map(({ member, attemptCount, avg, lastAt }) => (
                <tr key={member.id}>
                  <td className="px-5 py-3 font-body text-sm text-text">{member.name}</td>
                  <td className="px-5 py-3 font-body text-sm text-muted">{member.email}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">
                    {member.platform} · {member.level}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{attemptCount}</td>
                  <td className="px-5 py-3">
                    {avg !== null ? (
                      <span
                        className={`font-mono text-sm font-medium ${
                          avg >= 70 ? "text-accent" : "text-accent-amber"
                        }`}
                      >
                        {avg}%
                      </span>
                    ) : (
                      <span className="font-mono text-sm text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-muted">
                    {lastAt ? new Date(lastAt).toLocaleDateString() : "—"}
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
