import { api } from "./client";
import type { Level, Platform, Role } from "../context/AuthContext";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  platform: Platform | null;
  level: Level | null;
  managerId: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  platform?: Platform | "";
  level?: Level | "";
  managerId?: string | "";
}

export interface UpdateUserInput {
  role?: Role;
  platform?: Platform | null;
  level?: Level | null;
  managerId?: string | null;
}

export interface AdminQuiz {
  id: string;
  title: string;
  platform: Platform;
  level: Level;
  generatedBy: string;
  isActive: boolean;
  createdAt: string;
  _count: { questions: number; attempts: number };
}

export interface AdminAttempt {
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

export interface GenerateQuizInput {
  platform: Platform;
  level: Level;
  count?: number;
}

export interface AssessmentAssignmentInput {
  quizId: string;
  employeeIds: string[];
  durationMinutes: number;
  dueAt?: string | null;
  enabled?: boolean;
  requestId?: string;
}

export interface AssessmentRequest {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message: string | null;
  createdAt: string;
  manager: { name: string; email: string };
  quiz: { id: string; title: string };
  recipients: { employee: { id: string; name: string; email: string } }[];
}

// --- Users ---
export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await api.get("/admin/users");
  return data;
}

export async function createUser(input: CreateUserInput) {
  const { data } = await api.post("/auth/register", input);
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const { data } = await api.patch(`/admin/users/${id}`, input);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function resetPassword(id: string, password: string): Promise<void> {
  await api.post(`/admin/users/${id}/reset-password`, { password });
}

// --- Quizzes / question bank ---
export async function listAdminQuizzes(): Promise<AdminQuiz[]> {
  const { data } = await api.get("/admin/quizzes");
  return data;
}

export async function toggleQuizActive(id: string, isActive: boolean): Promise<AdminQuiz> {
  const { data } = await api.patch(`/admin/quizzes/${id}`, { isActive });
  return data;
}

export async function generateQuiz(input: GenerateQuizInput) {
  const { data } = await api.post("/quizzes/generate", input);
  return data;
}

export async function createAssignments(input: AssessmentAssignmentInput) {
  const { data } = await api.post("/admin/assignments", input);
  return data;
}

export async function listAssessmentRequests(): Promise<AssessmentRequest[]> {
  const { data } = await api.get("/admin/requests");
  return data;
}

export async function rejectAssessmentRequest(id: string) {
  const { data } = await api.post(`/admin/requests/${id}/reject`);
  return data;
}

// --- Reports ---
export async function listAllAttempts(): Promise<AdminAttempt[]> {
  const { data } = await api.get("/admin/attempts");
  return data;
}
