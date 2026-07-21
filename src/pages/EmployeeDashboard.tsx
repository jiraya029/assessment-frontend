import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { myAssignments, startAssessment, type Assignment } from "../api/quizzes";

export function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { myAssignments().then(setAssignments).catch(() => setError(null)); }, []);

  async function openAssessment(assignment: Assignment) {
    try {
      const attempt = await startAssessment(assignment.id);
      navigate(`/employee/attempt/${attempt.id}`, { state: { quizId: attempt.quizId, expiresAt: attempt.expiresAt } });
    } catch (err: any) { setError(err?.response?.data?.error || "Couldn't open this assessment."); }
  }

  return <div className="min-h-screen bg-ink px-6 py-10 sm:px-10 lg:px-14"><div className="mx-auto max-w-4xl">
    <div className="flex items-start justify-between"><div><p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">{user?.platform} · {user?.level}</p><h1 className="mt-2 font-display text-2xl font-semibold text-text">Welcome, {user?.name}</h1></div><button onClick={logout} className="rounded-md border border-panel-line px-3.5 py-2 font-body text-sm text-text hover:border-accent">Sign out</button></div>
    <section className="mt-10"><h2 className="font-display text-lg font-semibold text-text">Assigned assessments</h2><p className="mt-1 font-body text-sm text-muted">Only assessments enabled by an administrator can be started. Your time begins when you open one.</p>{error && <p role="alert" className="mt-4 font-body text-sm text-red-300">{error}</p>}
    {assignments.length === 0 ? <div className="mt-5 rounded-lg border border-panel-line bg-panel px-5 py-8"><p className="font-display text-base text-text">Your next challenge is on its way.</p><p className="mt-2 font-body text-sm text-muted">There are no assessments for you right now. Use this time to learn, recharge, and come back ready.</p></div> : <div className="mt-5 divide-y divide-panel-line rounded-lg border border-panel-line bg-panel">{assignments.map((assignment) => {
      const unavailable = !assignment.enabled || (assignment.dueAt && new Date(assignment.dueAt) < new Date());
      const completed = assignment.attempt?.status === "COMPLETED" || assignment.attempt?.status === "EXPIRED";
      return <div key={assignment.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-body text-sm font-medium text-text">{assignment.quiz.title}</p><p className="mt-1 font-mono text-[11px] text-muted">{assignment.quiz._count.questions} questions · {assignment.durationMinutes} minutes{assignment.dueAt ? ` · due ${new Date(assignment.dueAt).toLocaleString()}` : ""}</p></div><button onClick={() => openAssessment(assignment)} disabled={Boolean(unavailable || completed)} className="shrink-0 rounded-md bg-accent px-4 py-2 font-body text-sm font-semibold text-ink disabled:opacity-40">{completed ? assignment.attempt?.status === "EXPIRED" ? "Expired" : "Completed" : assignment.attempt?.status === "IN_PROGRESS" ? "Resume" : unavailable ? "Not available" : "Start"}</button></div>;
    })}</div>}</section>
  </div></div>;
}
