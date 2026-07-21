import { api } from "./client";
import type { Level, Platform } from "../context/AuthContext";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  platform: Platform | null;
  level: Level | null;
}

export interface TeamAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number | null;
  totalQuestions: number;
  correctCount: number | null;
  startedAt: string;
  completedAt: string | null;
  status: "IN_PROGRESS" | "COMPLETED";
  user: { name: string; email: string; platform: Platform | null; level: Level | null };
  quiz: { title: string; platform: Platform; level: Level };
}

// GET /api/manager/team — scoped server-side to req.user.id, so this only
// ever returns people who report to the logged-in manager.
export async function getTeam(): Promise<TeamMember[]> {
  const { data } = await api.get("/manager/team");
  return data;
}

// GET /api/manager/team/attempts — same server-side scoping: a manager can
// never see another manager's reportees' results.
export async function getTeamAttempts(): Promise<TeamAttempt[]> {
  const { data } = await api.get("/manager/team/attempts");
  return data;
}

export interface ManagerQuiz { id: string; title: string; platform: Platform; level: Level; }
export interface ManagerRequest { id: string; status: string; createdAt: string; quiz: { title: string }; recipients: { employee: { name: string } }[]; }

export async function listAvailableQuizzes(): Promise<ManagerQuiz[]> {
  const { data } = await api.get("/quizzes");
  return data;
}

export async function requestAssessment(input: { quizId: string; employeeIds: string[]; message?: string }) {
  const { data } = await api.post("/manager/assessment-requests", input);
  return data;
}

export async function listMyRequests(): Promise<ManagerRequest[]> {
  const { data } = await api.get("/manager/assessment-requests");
  return data;
}
