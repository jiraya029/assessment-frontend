import { useEffect, useState } from "react";
import type { Level, Platform, Role } from "../../context/AuthContext";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  resetPassword,
  type AdminUser,
} from "../../api/admin";
import { Modal, FormField, inputClass, selectClass } from "./Modal";

const PLATFORMS: Platform[] = ["AWS", "AZURE", "DATABASE", "AUTOMATION", "FRONTEND", "BACKEND"];
const LEVELS: Level[] = ["L1", "L2", "L3"];
const ROLES: Role[] = ["ADMIN", "MANAGER", "EMPLOYEE"];

interface FormState {
  name: string;
  email: string;
  password: string;
  role: Role;
  platform: Platform | "";
  level: Level | "";
  managerId: string;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
  platform: "",
  level: "",
  managerId: "",
};

export function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const managers = users.filter((u) => u.role === "MANAGER");

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch {
      setError("Couldn't load users. Try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate(role: Role = "EMPLOYEE") {
    setForm({ ...emptyForm, role });
    setFormError(null);
    setShowCreate(true);
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      platform: user.platform || "",
      level: user.level || "",
      managerId: user.managerId || "",
    });
    setFormError(null);
  }

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) {
      setFormError("Name, email, and password are required.");
      return;
    }
    if (form.role === "EMPLOYEE" && !form.managerId) {
      setFormError("Every employee must be assigned a reporting manager.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        platform: form.role === "EMPLOYEE" ? form.platform : "",
        level: form.role === "EMPLOYEE" ? form.level : "",
        managerId: form.managerId || "",
      });
      setShowCreate(false);
      await load();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || "Couldn't create user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave() {
    if (!editing) return;
    if (form.role === "EMPLOYEE" && !form.managerId) {
      setFormError("Every employee must be assigned a reporting manager.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await updateUser(editing.id, {
        role: form.role,
        platform: form.role === "EMPLOYEE" ? (form.platform || null) : null,
        level: form.role === "EMPLOYEE" ? (form.level || null) : null,
        managerId: form.managerId || null,
      });
      setEditing(null);
      await load();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || "Couldn't update user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Delete ${user.name}? This can't be undone.`)) return;
    try {
      await deleteUser(user.id);
      await load();
    } catch {
      setError("Couldn't delete that user.");
    }
  }

  async function handleResetPassword() {
    if (!resetting || newPassword.length < 8) { setFormError("Password must be at least 8 characters."); return; }
    try { await resetPassword(resetting.id, newPassword); setResetting(null); setNewPassword(""); setFormError(null); }
    catch (err: any) { setFormError(err?.response?.data?.error || "Couldn't reset password."); }
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-text">Users</h2>
        <div className="flex gap-2">
          <button
            onClick={() => openCreate("MANAGER")}
            className="rounded-md border border-panel-line px-4 py-2 font-body text-sm font-semibold text-text transition-colors hover:border-accent"
          >
            + Add manager
          </button>
          <button
            onClick={() => openCreate("EMPLOYEE")}
            className="rounded-md bg-accent px-4 py-2 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            + Add user
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-900/50 bg-red-950/40 px-3.5 py-2.5 font-body text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-4 font-body text-sm text-muted">Loading…</p>
      ) : users.length === 0 ? (
        <p className="mt-4 font-body text-sm text-muted">No users yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-panel-line bg-panel">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-panel-line">
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Name</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Email</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Role</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Platform / Level</th>
                <th className="px-5 py-3 font-mono text-[11px] uppercase tracking-wide text-muted">Manager</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-body text-sm text-text">{u.name}</td>
                  <td className="px-5 py-3 font-body text-sm text-muted">{u.email}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">{u.role}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted">
                    {u.platform ? `${u.platform} · ${u.level}` : "—"}
                  </td>
                  <td className="px-5 py-3 font-body text-sm text-muted">
                    {managers.find((m) => m.id === u.managerId)?.name || "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => openEdit(u)}
                      className="mr-3 font-body text-sm text-accent hover:opacity-80"
                    >
                      Edit
                    </button>
                    <button onClick={() => { setResetting(u); setNewPassword(""); setFormError(null); }} className="mr-3 font-body text-sm text-accent hover:opacity-80">Reset password</button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="font-body text-sm text-red-400 hover:opacity-80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title={form.role === "MANAGER" ? "Add manager" : "Add user"} onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <FormField label="Name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </FormField>
            <FormField label="Email">
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Password">
              <input
                className={inputClass}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </FormField>
            <FormField label="Role">
              <select
                className={selectClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>
            {form.role === "EMPLOYEE" && (
              <>
                <FormField label="Platform">
                  <select
                    className={selectClass}
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                  >
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Level">
                  <select
                    className={selectClass}
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value as Level })}
                  >
                    <option value="">Select level</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Reporting manager (required)">
                  <select
                    className={selectClass}
                    value={form.managerId}
                    onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                  >
                    <option value="">Select a manager…</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {managers.length === 0 && (
                    <p className="mt-1.5 font-body text-xs text-accent-amber">
                      No managers exist yet — create a MANAGER user first.
                    </p>
                  )}
                </FormField>
              </>
            )}

            {formError && (
              <p role="alert" className="font-body text-sm text-red-300">{formError}</p>
            )}

            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full rounded-md bg-accent px-4 py-2.5 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create user"}
            </button>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <FormField label="Role">
              <select
                className={selectClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>
            {form.role === "EMPLOYEE" && (
              <>
                <FormField label="Platform">
                  <select
                    className={selectClass}
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}
                  >
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Level">
                  <select
                    className={selectClass}
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value as Level })}
                  >
                    <option value="">Select level</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Reporting manager (required)">
                  <select
                    className={selectClass}
                    value={form.managerId}
                    onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                  >
                    <option value="">Select a manager…</option>
                    {managers
                      .filter((m) => m.id !== editing.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                </FormField>
              </>
            )}

            {formError && (
              <p role="alert" className="font-body text-sm text-red-300">{formError}</p>
            )}

            <button
              onClick={handleEditSave}
              disabled={saving}
              className="w-full rounded-md bg-accent px-4 py-2.5 font-body text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </Modal>
      )}
      {resetting && (
        <Modal title={`Reset password: ${resetting.name}`} onClose={() => setResetting(null)}>
          <div className="space-y-4"><FormField label="New temporary password"><input className={inputClass} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></FormField>{formError && <p role="alert" className="font-body text-sm text-red-300">{formError}</p>}<button onClick={handleResetPassword} className="w-full rounded-md bg-accent px-4 py-2.5 font-body text-sm font-semibold text-ink">Reset password</button></div>
        </Modal>
      )}
    </section>
  );
}
