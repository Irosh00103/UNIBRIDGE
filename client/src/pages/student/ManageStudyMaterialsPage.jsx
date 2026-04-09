import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ManageStudyMaterialsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('pending');
  const [pending, setPending] = useState([]);
  const [reviewed, setReviewed] = useState([]);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  const fetchPending = async () => {
    const response = await axios.get('http://localhost:5000/api/materials/pending', {
      params: { search }
    });
    setPending(response.data.data || []);
  };

  const fetchReviewed = async () => {
    const [approvedRes, rejectedRes] = await Promise.all([
      axios.get('http://localhost:5000/api/materials', { params: { status: 'approved', search, sort: 'newest' } }),
      axios.get('http://localhost:5000/api/materials', { params: { status: 'rejected', search, sort: 'newest' } })
    ]);

    const approved = (approvedRes.data.data || []).map((item) => ({ ...item, reviewStatus: 'approved' }));
    const rejected = (rejectedRes.data.data || []).map((item) => ({ ...item, reviewStatus: 'rejected' }));
    setReviewed([...approved, ...rejected].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      if (mode === 'pending') await fetchPending();
      else await fetchReviewed();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [mode]);

  const stats = useMemo(() => {
    const approvedCount = reviewed.filter((item) => item.reviewStatus === 'approved').length;
    const rejectedCount = reviewed.filter((item) => item.reviewStatus === 'rejected').length;
    return {
      pending: pending.length,
      approved: approvedCount,
      rejected: rejectedCount
    };
  }, [pending, reviewed]);

  const handleReviewAction = async (item, action) => {
    try {
      setError('');
      setMessage('');
      const reviewNotes = notes[item._id] || '';
      if (action === 'reject' && !reviewNotes.trim()) {
        setError('Review notes are required for rejection');
        return;
      }

      await axios.patch(`http://localhost:5000/api/materials/${item._id}/review`, {
        action,
        reviewNotes
      });

      setMessage(action === 'approve' ? 'Material approved successfully' : 'Material rejected successfully');
      setNotes((current) => ({ ...current, [item._id]: '' }));
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Review action failed');
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <div className="card-soft text-center py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Manage Study Materials</h1>
          <p className="mt-2 text-sm text-slate-600">Access restricted. Only admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card-soft flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Study Materials</h1>
          <p className="mt-1 text-sm text-slate-600">Approve or reject student submissions.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={`btn-secondary ${mode === 'reviewed' ? '' : 'active-tab'}`} onClick={() => setMode('pending')}>
            Pending Review
          </button>
          <button type="button" className={`btn-secondary ${mode === 'pending' ? '' : 'active-tab'}`} onClick={() => setMode('reviewed')}>
            Reviewed
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card-soft"><p className="text-sm text-slate-600">Pending</p><p className="mt-2 text-2xl font-semibold text-slate-900">{stats.pending}</p></div>
        <div className="card-soft"><p className="text-sm text-slate-600">Approved</p><p className="mt-2 text-2xl font-semibold text-slate-900">{stats.approved}</p></div>
        <div className="card-soft"><p className="text-sm text-slate-600">Rejected</p><p className="mt-2 text-2xl font-semibold text-slate-900">{stats.rejected}</p></div>
      </section>

      <div className="card-soft flex gap-2">
        <input className="input-base" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, module, or owner" />
        <button type="button" className="btn-primary" onClick={fetchData}>Search</button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card-soft loading">Loading study materials...</div>
      ) : mode === 'pending' ? (
        pending.length === 0 ? (
          <div className="card-soft text-center py-8">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-slate-900">No pending submissions</h3>
            <p className="mt-1 text-sm text-slate-600">All student submissions are already reviewed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((item) => (
              <div key={item._id} className="card-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{item.type} • pending</p>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.description || 'No description provided.'}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{item.module}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">Owner: {item.studentName || 'Student'}</span>
                    </div>
                    <a className="btn-secondary mt-3" href={item.link} target="_blank" rel="noopener noreferrer">Open Link</a>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <textarea
                    className="input-base"
                    rows={3}
                    placeholder="Review notes (required for rejection)"
                    value={notes[item._id] || ''}
                    onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))}
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn-danger" onClick={() => handleReviewAction(item, 'reject')}>Reject</button>
                    <button type="button" className="btn-primary" onClick={() => handleReviewAction(item, 'approve')}>Approve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : reviewed.length === 0 ? (
        <div className="card-soft text-center py-8">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold text-slate-900">No reviewed materials</h3>
          <p className="mt-1 text-sm text-slate-600">Approved and rejected materials will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviewed.map((item) => (
            <div key={item._id} className="card-soft">
              <p className="text-xs text-slate-500">{item.type} • {item.reviewStatus}</p>
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.description || 'No description provided.'}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-1">{item.module}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">Owner: {item.studentName || 'Student'}</span>
              </div>
              {item.reviewNotes ? <p className="mt-2 text-xs text-slate-600">Notes: {item.reviewNotes}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStudyMaterialsPage;
