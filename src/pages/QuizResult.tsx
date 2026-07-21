import { useLocation, useNavigate } from "react-router-dom";
import type { Attempt } from "../api/quizzes";

export function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result?: Attempt } | null)?.result;

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
        <p className="font-body text-sm text-muted">
          No result to show — this page only works right after submitting.
        </p>
        <button
          onClick={() => navigate("/employee")}
          className="rounded-md border border-panel-line px-4 py-2 font-body text-sm text-text hover:border-accent"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const score = Math.round(result.score ?? 0);
  const passed = score >= 70;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Assessment complete
        </p>

        <p
          className={`mt-6 font-display text-6xl font-semibold ${
            passed ? "text-accent" : "text-accent-amber"
          }`}
        >
          {score}%
        </p>

        <p className="mt-3 font-body text-sm text-muted">
          {result.correctCount} of {result.totalQuestions} correct
        </p>

        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-panel">
          <div
            className={`h-full rounded-full ${
              passed ? "bg-accent" : "bg-accent-amber"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="mt-6 font-body text-sm text-muted">
          {passed
            ? "Nice work — that clears the bar for this level."
            : "Below the mark this time. Review the topic and try again when ready."}
        </p>

        <button
          onClick={() => navigate("/employee")}
          className="mt-8 w-full rounded-md bg-accent px-4 py-2.5 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
