import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/materials.css';

const StatCard = ({ label, value, icon }) => (
  <div className="card-soft">
    <div className="text-3xl">{icon}</div>
    <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    <div className="text-sm text-slate-600">{label}</div>
  </div>
);

const QuickActionCard = ({ to, title, description, icon }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="card-soft text-left hover:shadow-lg hover:border-blue-300 transition-all duration-200"
    >
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </button>
  );
};

const EmptyState = ({ title, description, icon = '📚' }) => (
  <div className="card-soft text-center py-8">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{description}</p>
  </div>
);

const isAdminRole = (role) => role === 'admin';

const Materials = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [sessions, setSessions] = useState([]);

  const fetchStudentData = async () => {
    try {
      const [materialsRes, sessionsRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/materials/my-submissions'),
        axios.get('http://localhost:5000/api/kuppi/posts')
      ]);

      if (materialsRes.status === 'fulfilled') {
        setMySubmissions(materialsRes.value.data.data || []);
      }

      if (sessionsRes.status === 'fulfilled') {
        setSessions(sessionsRes.value.data.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (isAdminRole(user.role)) {
      setLoading(false);
      return;
    }
    fetchStudentData();
  }, [user]);

  const studentStats = useMemo(() => {
    return {
      uploaded: mySubmissions.length,
      downloads: 0,
      viewed: 0
    };
  }, [mySubmissions]);

  const sessionStats = useMemo(() => {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    return sessions.reduce(
      (accumulator, session) => {
        const dateValue = new Date(session.date);
        if (Number.isNaN(dateValue.getTime())) return accumulator;

        const sessionKey = dateValue.toISOString().slice(0, 10);
        if (sessionKey > todayKey) accumulator.upcoming += 1;
        else if (sessionKey === todayKey) accumulator.ongoing += 1;
        else accumulator.completed += 1;

        return accumulator;
      },
      { upcoming: 0, ongoing: 0, completed: 0 }
    );
  }, [sessions]);

  const studentActions = [
    {
      to: '/student/materials/browse',
      title: 'Browse Study Materials',
      description: 'Explore approved resources',
      icon: '📖'
    },
    {
      to: '/student/materials/submit',
      title: 'Submit Study Material',
      description: 'Send your content for review',
      icon: '📝'
    }
  ];

  const adminActions = [
    {
      to: '/admin/lecture-hub/manage',
      title: 'Manage Study Materials',
      description: 'Review submissions and statuses',
      icon: '🗂'
    },
    {
      to: '/admin/lecture-hub/modules',
      title: 'Manage Modules',
      description: 'Maintain year-semester modules',
      icon: '🧩'
    },
    {
      to: '/admin/lecture-hub/upload',
      title: 'Upload Study Material',
      description: 'Directly publish approved resources',
      icon: '⬆️'
    },
    {
      to: '/admin/lecture-hub/browse',
      title: 'Browse Study Materials',
      description: 'Explore approved resources',
      icon: '📖'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="card-soft loading">Loading Lecture Hub...</div>
      </div>
    );
  }

  if (isAdminRole(user?.role)) {
    return (
      <div className="space-y-5">
        <section className="card-soft bg-gradient-to-r text-white">
          <h1 className="text-2xl font-semibold">Welcome to Unibridge, Admin 👋</h1>
          <p className="mt-2 text-sm text-white/90">Manage lecture materials and review student submissions.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminActions.map((action) => (
              <QuickActionCard key={action.to} {...action} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card-soft bg-gradient-to-r text-white">
        <h1 className="text-2xl font-semibold">Welcome to Unibridge, {user?.firstName || 'Student'} 👋</h1>
        <p className="mt-2 text-sm text-white/90">Your academic study materials hub is ready for today.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Uploaded" value={studentStats.uploaded} icon="📤" />
        <StatCard label="Downloads" value={studentStats.downloads} icon="⬇️" />
        <StatCard label="Viewed" value={studentStats.viewed} icon="👁️" />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {studentActions.map((action) => (
            <QuickActionCard key={action.to} {...action} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Sessions (Upcoming / Ongoing / Completed)</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Upcoming" value={sessionStats.upcoming} icon="🗓️" />
          <StatCard label="Ongoing" value={sessionStats.ongoing} icon="🟢" />
          <StatCard label="Completed" value={sessionStats.completed} icon="✅" />
        </div>
        {sessions.length === 0 && (
          <EmptyState
            title="No sessions yet"
            description="Upcoming, ongoing, and completed Kuppi sessions will appear here."
            icon="📚"
          />
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
        {mySubmissions.length === 0 ? (
          <EmptyState
            title="No recent activity yet"
            description="Your latest uploads, reviews, and downloads will appear here."
            icon="📚"
          />
        ) : (
          <div className="space-y-3">
            {mySubmissions.slice(0, 3).map((item) => (
              <div key={item._id} className="card-soft">
                <div className="text-xs text-slate-500">{item.module}</div>
                <div className="text-base font-semibold text-slate-900">{item.title}</div>
                <div className="mt-1 text-sm text-slate-600">Status: {item.status}</div>
                {item.reviewNotes ? <div className="mt-1 text-xs text-slate-600">Notes: {item.reviewNotes}</div> : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Materials;
