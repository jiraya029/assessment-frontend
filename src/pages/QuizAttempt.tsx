import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getQuiz, submitAttempt, type QuizDetail } from "../api/quizzes";

export function QuizAttempt() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const quizId = (location.state as { quizId?: string } | null)?.quizId;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setError("Missing quiz reference — please start again from the dashboard.");
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    getQuiz(quizId)
      .then((data) => {
        if (!cancelled) setQuiz(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the assessment questions.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <p className="font-body text-sm text-muted">Loading assessment…</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
        <p className="font-body text-sm text-red-300">
          {error || "Something went wrong."}
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

  const question = quiz.questions[current];
  const isLast = current === quiz.questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  function selectAnswer(optionKey: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionKey }));
  }

  async function handleSubmit() {
    if (!attemptId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitAttempt(attemptId, answers);
      navigate(`/employee/result/${attemptId}`, { state: { result } });
    } catch {
      setError("Couldn't submit your answers. Try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            {quiz.platform} · {quiz.level}
          </p>
          <p className="font-mono text-xs text-muted">
            {current + 1} / {quiz.questions.length}
          </p>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{
              width: `${((current + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <h1 className="mt-8 font-display text-xl font-semibold leading-snug text-text">
          {question.questionText}
        </h1>

        <div className="mt-6 space-y-3">
          {(Object.entries(question.options) as [string, string][]).map(
            ([key, text]) => {
              const selected = answers[question.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => selectAnswer(key)}
                  className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left font-body text-sm transition-colors ${
                    selected
                      ? "border-accent bg-accent/10 text-text"
                      : "border-panel-line bg-panel text-text hover:border-panel-line/80 hover:bg-panel/70"
                  }`}
                >
                  <span
                    className={`mt-0.5 font-mono text-xs ${
                      selected ? "text-accent" : "text-muted"
                    }`}
                  >
                    {key}
                  </span>
                  <span>{text}</span>
                </button>
              );
            }
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 font-body text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="rounded-md border border-panel-line px-4 py-2 font-body text-sm text-text transition-colors hover:border-accent disabled:opacity-40"
          >
            Previous
          </button>

          <p className="font-mono text-[11px] text-muted">
            {answeredCount} of {quiz.questions.length} answered
          </p>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-md bg-accent px-4 py-2 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </button>
          ) : (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="rounded-md bg-accent px-4 py-2 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
