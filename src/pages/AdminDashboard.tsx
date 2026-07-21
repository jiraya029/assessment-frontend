import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Tabs, type TabDef } from "../components/admin/Tabs";
import { UsersPanel } from "../components/admin/UsersPanel";
import { QuizzesPanel } from "../components/admin/QuizzesPanel";
import { ReportsPanel } from "../components/admin/ReportsPanel";
import { AssignmentsPanel } from "../components/admin/AssignmentsPanel";
import { RequestsPanel } from "../components/admin/RequestsPanel";

const TABS: TabDef[] = [
  { key: "users", label: "Users" },
  { key: "quizzes", label: "Assessments" },
  { key: "reports", label: "Reports" },
  { key: "assignments", label: "Assignments" },
  { key: "requests", label: "Notifications" },
];

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("users");

  return (
    <div className="min-h-screen bg-ink px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Admin</p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-text">
              Welcome, {user?.name}
            </h1>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-panel-line px-3.5 py-2 font-body text-sm text-text transition-colors hover:border-accent"
          >
            Sign out
          </button>
        </div>

        <div className="mt-8">
          <Tabs tabs={TABS} active={active} onChange={setActive} />
        </div>

        <div className="mt-8">
          {active === "users" && <UsersPanel />}
          {active === "quizzes" && <QuizzesPanel />}
          {active === "reports" && <ReportsPanel />}
          {active === "assignments" && <AssignmentsPanel />}
          {active === "requests" && <RequestsPanel />}
        </div>
      </div>
    </div>
  );
}
