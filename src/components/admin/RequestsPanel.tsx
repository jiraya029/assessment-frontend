import { useEffect, useState } from "react";
import { createAssignments, listAssessmentRequests, rejectAssessmentRequest, type AssessmentRequest } from "../../api/admin";

export function RequestsPanel() {
  const [requests, setRequests] = useState<AssessmentRequest[]>([]); const [message, setMessage] = useState<string | null>(null);
  const load = () => listAssessmentRequests().then(setRequests).catch(() => setMessage("Couldn't load manager requests."));
  useEffect(() => { void load(); }, []);
  async function approve(request: AssessmentRequest) { try { await createAssignments({ quizId: request.quiz.id, employeeIds: request.recipients.map(r => r.employee.id), durationMinutes: 30, enabled: true, requestId: request.id }); setMessage("Request approved and assessment enabled."); load(); } catch { setMessage("Couldn't approve request."); } }
  async function reject(id: string) { await rejectAssessmentRequest(id); load(); }
  return <section><h2 className="font-display text-lg font-semibold text-text">Notifications</h2><p className="mt-1 font-body text-sm text-muted">Manager assessment requests awaiting your decision.</p>{message && <p className="mt-4 font-body text-sm text-accent">{message}</p>}<div className="mt-5 space-y-3">{requests.length === 0 ? <p className="font-body text-sm text-muted">No requests yet.</p> : requests.map(r => <div key={r.id} className="rounded-lg border border-panel-line bg-panel p-5"><p className="font-body text-sm font-medium text-text">{r.manager.name} requested {r.quiz.title}</p><p className="mt-1 font-body text-sm text-muted">For: {r.recipients.map(x => x.employee.name).join(", ")}</p>{r.message && <p className="mt-1 font-body text-sm text-muted">Note: {r.message}</p>}<p className="mt-2 font-mono text-xs text-muted">{r.status}</p>{r.status === "PENDING" && <div className="mt-3 flex gap-3"><button onClick={() => approve(r)} className="rounded bg-accent px-3 py-2 text-sm font-semibold text-ink">Approve & enable (30 min)</button><button onClick={() => reject(r.id)} className="rounded border border-panel-line px-3 py-2 text-sm text-text">Reject</button></div>}</div>)}</div></section>;
}
