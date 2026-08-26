import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Trash2, KeyRound, X } from 'lucide-react';
import * as api from '../api';
import { useAdmin } from '../AdminContext';
import { inputCls, ErrorNote, Spinner, PageHeader } from '../ui';

const MIN_PASSWORD = 12;

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-heading font-800 text-[#1B3172]">{title}</h2>
          <div className="flex-1" />
          <button onClick={onClose} className="p-1 text-[#94a3b8] hover:text-[#1B3172] cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user: me } = useAdmin();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { users } = await api.users.list();
      setRows(users);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // `load` performs no synchronous setState — every update happens after an
  // await — so this cannot cause the cascading render the rule guards against.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const act = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
      setAdding(false);
      setResetting(null);
      setForm({ name: '', email: '', password: '', role: 'editor' });
      setPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!rows) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Team" subtitle="Who can sign in and what they are allowed to change.">
        <button onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold cursor-pointer">
          <UserPlus className="w-4 h-4" /> Add person
        </button>
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {rows.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-[#1B3172] truncate">
                {u.name}
                {u.id === me.id && <span className="text-xs font-normal text-[#94a3b8]"> (you)</span>}
              </p>
              <p className="text-xs text-[#94a3b8] truncate">
                {u.email}
                {u.last_login_at && ` · last signed in ${new Date(u.last_login_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}`}
              </p>
            </div>

            <select
              value={u.role}
              onChange={(e) => act(() => api.users.update({ id: u.id, role: e.target.value }))}
              className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 cursor-pointer"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={u.status}
              onChange={(e) => act(() => api.users.update({ id: u.id, status: e.target.value }))}
              className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer ${
                u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>

            <button onClick={() => setResetting(u)}
              className="p-2 text-[#94a3b8] hover:text-[#1B3172] cursor-pointer" aria-label="Set password">
              <KeyRound className="w-4 h-4" />
            </button>

            {u.id !== me.id && (
              <button
                onClick={() => window.confirm(`Remove ${u.name}? They lose access immediately.`) && act(() => api.users.remove(u.id))}
                className="p-2 text-[#94a3b8] hover:text-red-600 cursor-pointer" aria-label="Remove person"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-heading font-800 text-[#1B3172] mb-2">What the roles mean</h2>
        <ul className="text-sm text-[#475569] space-y-1.5">
          <li><strong>Editor</strong> — writes and publishes content, uploads images, sees leads.</li>
          <li><strong>Admin</strong> — everything an editor can do, plus pricing, this page, and the activity log.</li>
        </ul>
      </div>

      {adding && (
        <Modal title="Add person" onClose={() => setAdding(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => { e.preventDefault(); act(() => api.users.create(form)); }}
          >
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name" className={inputCls} />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email" className={inputCls} />
            <input required type="password" minLength={MIN_PASSWORD} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={`Password (at least ${MIN_PASSWORD} characters)`} className={inputCls} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-[11px] text-[#94a3b8]">
              Send them this password over something private, and ask them to change it once they are in.
            </p>
            <button type="submit" disabled={busy}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold disabled:opacity-60 cursor-pointer">
              Add person
            </button>
          </form>
        </Modal>
      )}

      {resetting && (
        <Modal title={`Set password for ${resetting.name}`} onClose={() => setResetting(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              // Changing your OWN password requires the current one; the server
              // enforces this too, the field is just shown when it applies.
              act(() => api.users.update({
                id: resetting.id,
                password,
                ...(resetting.id === me.id ? { current_password: e.target.current?.value } : {}),
              }));
            }}
          >
            {resetting.id === me.id && (
              <input required name="current" type="password" placeholder="Your current password" className={inputCls} />
            )}
            <input required type="password" minLength={MIN_PASSWORD} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`New password (at least ${MIN_PASSWORD} characters)`} className={inputCls} />
            <button type="submit" disabled={busy}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-sm font-semibold disabled:opacity-60 cursor-pointer">
              Save password
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
