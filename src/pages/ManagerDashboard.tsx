import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Tabs, type TabDef } from "../components/admin/Tabs";
import { TeamPanel } from "../components/manager/TeamPanel";
import { TeamReportsPanel } from "../components/manager/TeamReportsPanel";
import { RequestPanel } from "../components/manager/RequestPanel";

const TABS: TabDef[] = [
  { key: "team", label: "Team" },
  { key: "reports", label: "Reports" },
  { key: "request", label: "Request assessment" },
];

export function ManagerDashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("team");

  return (
    <div className="min-h-screen bg-ink px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
              Reporting Manager
            </p>
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
          {active === "team" && <TeamPanel />}
          {active === "reports" && <TeamReportsPanel />}
          {active === "request" && <RequestPanel />}
        </div>
      </div>
    </div>
  );
}
