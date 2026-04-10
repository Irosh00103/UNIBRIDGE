import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { moduleService } from '../../services/moduleService';

const canManage = (role) => role === 'admin' || role === 'employer';

const defaultForm = { _id: '', name: '', year: '', semester: '' };

const ManageModulesPage = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch modules on component mount
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await moduleService.getAll();
      setModules(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

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
    setSuccess('');
  };

  const saveModule = async () => {
    if (!form.name.trim() || !form.year || !form.semester) {
      setError('All fields are required');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      if (form._id) {
        // Update existing module
        await moduleService.update(form._id, {
          name: form.name.trim(),
          year: Number(form.year),
          semester: Number(form.semester)
        });
        setSuccess('Module updated successfully');
      } else {
        // Create new module
        await moduleService.create({
          name: form.name.trim(),
          year: Number(form.year),
          semester: Number(form.semester)
        });
        setSuccess('Module created successfully');
      }

      // Refresh modules list
      await fetchModules();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save module');
    } finally {
      setIsSaving(false);
    }
  };

  const editModule = (item) => {
    setForm({ _id: item._id, name: item.name, year: String(item.year), semester: String(item.semester) });
    setError('');
    setSuccess('');
  };

  const deleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    
    try {
      await moduleService.delete(id);
      setSuccess('Module deleted successfully');
      if (form._id === id) resetForm();
      await fetchModules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete module');
    }
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

      {error && <div className="p-3 rounded text-red-600 bg-red-50" style={{ border: '1px solid #fca5a5' }}>{error}</div>}
      {success && <div className="p-3 rounded text-green-600 bg-green-50" style={{ border: '1px solid #86efac' }}>{success}</div>}

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">{form._id ? 'Edit Module' : 'Create Module'}</h2>
        <input
          className="input-base"
          placeholder="Module Name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          disabled={isSaving}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <select
            className="input-base"
            value={form.year}
            onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
            disabled={isSaving}
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
            disabled={isSaving}
          >
            <option value="">Select Semester</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          {form._id && <button type="button" className="btn-secondary" onClick={resetForm} disabled={isSaving}>Cancel Edit</button>}
          <button type="button" className="btn-primary" onClick={saveModule} disabled={isSaving}>
            {isSaving ? 'Saving...' : form._id ? 'Update Module' : 'Create Module'}
          </button>
        </div>
      </div>

      <div className="card-soft space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Current Modules</h2>
        {loading ? (
          <div className="text-sm text-slate-600">Loading modules...</div>
        ) : sortedModules.length === 0 ? (
          <div className="text-sm text-slate-600">No modules yet. Create your first module above.</div>
        ) : (
          sortedModules.map((item) => (
            <div key={item._id} className="rounded border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-xs text-slate-500">Year {item.year} • Semester {item.semester}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary" onClick={() => editModule(item)} disabled={isSaving}>Edit</button>
                  <button type="button" className="btn-danger" onClick={() => deleteModule(item._id)} disabled={isSaving}>Delete</button>
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
