import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const canManage = (role) => role === 'admin' || role === 'employer';

const defaultForm = { id: '', name: '', year: '', semester: '' };

const ManageModulesPage = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  const sortedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.name.localeCompare(b.name);
    });
  }, [modules]);

  const resetForm = () => {
    setForm(defaultForm);
    setError('');
  };

  const saveModule = () => {
    if (!form.name.trim() || !form.year || !form.semester) {
      setError('All fields are required');
      return;
    }

    if (form.id) {
      setModules((current) => current.map((item) => (
        item.id === form.id ? { ...item, name: form.name.trim(), year: Number(form.year), semester: Number(form.semester) } : item
      )));
      resetForm();
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setModules((current) => [
      ...current,
      { id, name: form.name.trim(), year: Number(form.year), semester: Number(form.semester) }
    ]);
    resetForm();
  };

  const editModule = (item) => {
    setForm({ id: item.id, name: item.name, year: String(item.year), semester: String(item.semester) });
    setError('');
  };

  const deleteModule = (id) => {
    setModules((current) => current.filter((item) => item.id !== id));
    if (form.id === id) resetForm();
  };

  if (!canManage(user?.role)) {
    return (
      <div className="space-y-5">
        <div className="card-soft text-center py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Manage Modules</h1>
          <p className="mt-2 text-sm text-slate-600">Access restricted. Only admins and employers can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Manage Modules</h1>
        <p className="mt-1 text-sm text-slate-600">Maintain year-semester modules.</p>
      </div>

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">{form.id ? 'Edit Module' : 'Create Module'}</h2>
        <input
          className="input-base"
          placeholder="Module Name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <select
            className="input-base"
            value={form.year}
            onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
          >
            <option value="">Select Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          <select
            className="input-base"
            value={form.semester}
            onChange={(event) => setForm((current) => ({ ...current, semester: event.target.value }))}
          >
            <option value="">Select Semester</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          {form.id && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel Edit</button>}
          <button type="button" className="btn-primary" onClick={saveModule}>{form.id ? 'Update Module' : 'Create Module'}</button>
        </div>
      </div>

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Current Modules</h2>
        {sortedModules.length === 0 ? (
          <div className="text-sm text-slate-600">No modules yet. Create your first module above.</div>
        ) : (
          sortedModules.map((item) => (
            <div key={item.id} className="rounded border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">Year {item.year} • Semester {item.semester}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary" onClick={() => editModule(item)}>Edit</button>
                  <button type="button" className="btn-danger" onClick={() => deleteModule(item.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageModulesPage;
