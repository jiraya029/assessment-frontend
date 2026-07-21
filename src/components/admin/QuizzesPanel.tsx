import { useEffect, useState } from "react";
import type { Level, Platform } from "../../context/AuthContext";
import {
  generateQuiz,
  listAdminQuizzes,
  toggleQuizActive,
  type AdminQuiz,
} from "../../api/admin";
import { FormField, inputClass, selectClass } from "./Modal";

const PLATFORMS: Platform[] = ["AWS", "AZURE", "DATABASE", "AUTOMATION", "FRONTEND", "BACKEND"];
const LEVELS: Level[] = ["L1", "L2", "L3"];

export function QuizzesPanel() {
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [platform, setPlatform] = useState<Platform>("AWS");
  const [level, setLevel] = useState<Level>("L1");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAdminQuizzes();
      setQuizzes(data);
    } catch {
      setError("Couldn't load the question bank. Try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    setGenSuccess(null);
    try {
      const quiz = await generateQuiz({ platform, level, count });
      setGenSuccess(`Generated "${quiz.title}" with ${quiz.questions?.length ?? count} questions.`);
      await load();
    } catch (err: any) {
      setGenError(err?.response?.data?.error || "Generation failed. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggle(quiz: AdminQuiz) {
    try {
      const updated = await toggleQuizActive(quiz.id, !quiz.isActive);
      setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? { ...q, isActive: updated.isActive } : q)));
    } catch {
      setError("Couldn't update that quiz's status.");
    }
  }

  return (
    <section>
      {/* Generation form */}
      <div className="rounded-lg border border-panel-line bg-panel p-5">
        <h2 className="font-display text-lg font-semibold text-text">Preview a generation</h2>
        <p className="mt-1 font-body text-sm text-muted">
          Employees no longer pick from a shared quiz — every attempt generates its own
          fresh questions automatically, with nothing repeated from before. Use this to
          preview question quality for a platform/level; anything generated here also
          counts as "already used" so it won't be repeated for real employees either.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Platform">
            <select
              className={selectClass}
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Level">
            <select
              className={selectClass}
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Question count">
            <input
              className={inputClass}
              type="number"
              min={1}
              max={30}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </FormField>
        </div>

        {genError && (
          <p role="alert" className="mt-4 font-body text-sm text-red-300">{genError}</p>
        )}
        {genSuccess && (
          <p className="mt-4 font-body text-sm text-accent">{genSuccess}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-4 rounded-md bg-accent px-4 py-2.5 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {generating ? "Generating with AI…" : "Generate quiz"}
        </button>
      </div>

      {/* Question bank */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-text">Generation history</h2>
        <p className="mt-1 font-body text-sm text-muted">
          Every quiz ever generated — by you here, or automatically when an employee starts an
          assessment. This is the pool of questions the generator avoids repeating.
        </p>

        {error && (
          <p role="alert" className="mt-4 font-body text-sm text-red-300">{error}</p>
        )}

        {isLoading ? (
          <p className="mt-4 font-body text-sm text-muted">Loading…</p>
        ) : quizzes.length === 0 ? (
          <p className="mt-4 font-body text-sm text-muted">No quizzes generated yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-panel-line rounded-lg border border-panel-line bg-panel">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-body text-sm font-medium text-text">{quiz.title}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted">
                    {quiz._count.questions} questions · {quiz._count.attempts} attempts ·{" "}
                    {quiz.generatedBy}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(quiz)}
                  className={`shrink-0 rounded-md border px-3.5 py-2 font-body text-sm transition-colors ${
                    quiz.isActive
                      ? "border-panel-line text-text hover:border-red-400 hover:text-red-300"
                      : "border-accent text-accent hover:opacity-80"
                  }`}
                >
                  {quiz.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
