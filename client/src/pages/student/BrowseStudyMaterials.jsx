import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const getTypeIcon = (type = '') => {
  const normalized = String(type).toLowerCase();
  if (normalized === 'pdf') return '📄';
  if (normalized === 'ppt') return '📊';
  if (normalized === 'docx') return '📝';
  if (normalized === 'video') return '🎬';
  return '📁';
};

const BrowseStudyMaterials = () => {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [error, setError] = useState('');

  const fetchMaterials = async (searchValue = search, sortValue = sort) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:5000/api/materials', {
        params: { search: searchValue, sort: sortValue }
      });
      setMaterials(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials('', 'newest');
  }, []);

  const groupedByModule = useMemo(() => {
    const groups = {};
    materials.forEach((item) => {
      const key = item.module || 'General';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [materials]);

  return (
    <div className="space-y-5">
      <div className="card-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Browse Study Materials</h1>
        <p className="mt-1 text-sm text-slate-600">Explore approved resources grouped by module.</p>
      </div>

      <div className="card-soft grid gap-3 md:grid-cols-3">
        <input
          className="input-base"
          placeholder="Search title, description, or module"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') fetchMaterials(search, sort);
          }}
        />
        <select
          className="input-base"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            fetchMaterials(search, event.target.value);
          }}
        >
          <option value="newest">Newest First</option>
          <option value="likes">Most Liked</option>
          <option value="module">By Module</option>
        </select>
        <button type="button" className="btn-primary" onClick={() => fetchMaterials(search, sort)}>
          Search
        </button>
      </div>

      {error && <div className="card-soft alert alert-error">{error}</div>}

      {loading ? (
        <div className="card-soft loading">Loading study materials...</div>
      ) : materials.length === 0 ? (
        <div className="card-soft text-center py-8">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold text-slate-900">No materials found</h3>
          <p className="mt-1 text-sm text-slate-600">Try another search or check back later.</p>
        </div>
      ) : (
        groupedByModule.map(([moduleName, moduleItems]) => (
          <section key={moduleName} className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">{moduleName}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {moduleItems.map((item) => (
                <div key={item._id} className="card-soft">
                  <p className="text-xs text-slate-500">{getTypeIcon(item.type)} {item.type}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.description || 'No description provided.'}</p>
                  <div className="mt-2 text-xs text-slate-500">Uploaded by {item.studentName || 'Student'}</div>
                  <a
                    className="btn-secondary mt-3"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Resource
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default BrowseStudyMaterials;
