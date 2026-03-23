import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const cards = [
  {
    to: '/student/materials',
    emoji: '📚',
    title: 'Materials',
    desc: 'Browse lecture notes and slides.'
  },
  {
    to: '/student/jobs',
    emoji: '💼',
    title: 'Jobs',
    desc: 'Find and apply for jobs.'
  },
  {
    to: '/student/applications',
    emoji: '📝',
    title: 'My Applications',
    desc: 'Track your job applications.'
  },
  {
    to: '/student/kuppi',
    emoji: '🤝',
    title: 'Kuppi Hub',
    desc: 'Join or create peer sessions.'
  }
];

const StudentHome = () => {
  const { user } = useAuth();
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>Welcome, {user?.name}!</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {cards.map(card => (
          <div className="card" key={card.title} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>{card.emoji}</div>
            <div style={{ fontWeight: 600, fontSize: 20, margin: '12px 0' }}>{card.title}</div>
            <div style={{ color: 'var(--muted)', marginBottom: 16 }}>{card.desc}</div>
            <Link to={card.to}><button className="button">Go</button></Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentHome;
