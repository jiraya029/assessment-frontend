import { api } from "./client";
import type { Level, Platform } from "../context/AuthContext";

export interface QuizSummary {
  id: string;
  title: string;
  platform: Platform;
  level: Level;
  isActive: boolean;
  createdAt: string;
  _count: { questions: number };
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  difficulty: Level;
  order: number;
}

export interface QuizDetail {
  id: string;
  title: string;
  platform: Platform;
  level: Level;
  questions: QuizQuestion[];
}

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  answers: Record<string, string>;
  score: number | null;
  totalQuestions: number;
  correctCount: number | null;
  startedAt: string;
  completedAt: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "EXPIRED";
  expiresAt?: string | null;
  quiz?: { title: string; platform: Platform; level: Level };
}

export interface Assignment {
  id: string;
  enabled: boolean;
  dueAt: string | null;
  durationMinutes: number;
  quiz: { id: string; title: string; platform: Platform; level: Level; _count: { questions: number } };
  attempt: Attempt | null;
}

export async function startAssessment(assignmentId: string): Promise<Attempt & { quizId: string }> {
  const { data } = await api.post("/quizzes/start", { assignmentId });
  return data;
}

export async function myAssignments(): Promise<Assignment[]> {
  const { data } = await api.get("/quizzes/my-assignments");
  return data;
}

export async function getQuiz(id: string): Promise<QuizDetail> {
  const { data } = await api.get(`/quizzes/${id}`);
  return data;
}

export async function submitAttempt(
  attemptId: string,
  answers: Record<string, string>
): Promise<Attempt> {
  const { data } = await api.post(`/quizzes/attempts/${attemptId}/submit`, {
    answers,
  });
  return data;
}

export async function myAttempts(): Promise<Attempt[]> {
  const { data } = await api.get("/quizzes/my-attempts");
  return data;
}
