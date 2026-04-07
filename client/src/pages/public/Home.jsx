// Home.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, materials: 0, jobs: 0, satisfaction: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef = useRef(null);
  const animationStarted = useRef(false);

  const testimonials = [
    {
      quote: "UniBridge completely transformed how I study and find internships. The platform is intuitive and the community is amazing!",
      name: "Jane Doe",
      role: "Computer Science Student, University of Colombo",
      initials: "JD"
    },
    {
      quote: "The peer study sessions feature helped me ace my final exams. Finding study partners has never been easier!",
      name: "Michael Chen",
      role: "Engineering Student, University of Moratuwa",
      initials: "MC"
    },
    {
      quote: "As an employer, I've found incredible talent through UniBridge. The application tracking system is a game-changer.",
      name: "Sarah Johnson",
      role: "HR Director, TechCorp Sri Lanka",
      initials: "SJ"
    }
  ];

  // Stats Animation
  const animateStats = useCallback(() => {
    if (animationStarted.current) return;
    animationStarted.current = true;

    const targets = { students: 12450, materials: 874, jobs: 312, satisfaction: 98 };
    const duration = 1800;
    const steps = 60;
    const increment = {
      students: targets.students / steps,
      materials: targets.materials / steps,
      jobs: targets.jobs / steps,
      satisfaction: targets.satisfaction / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setStats(targets);
        clearInterval(timer);
      } else {
        setStats({
          students: Math.floor(increment.students * currentStep),
          materials: Math.floor(increment.materials * currentStep),
          jobs: Math.floor(increment.jobs * currentStep),
          satisfaction: Math.floor(increment.satisfaction * currentStep)
        });
      }
    }, duration / steps);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateStats();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [animateStats]);

  // Testimonial Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      {/* Particle Canvas */}
      <canvas id="particle-canvas" className="particle-canvas" />

      {/* HERO SECTION - More Premium */}
      <section className="hero">
        <div className="hero-overlay" />

        <div className="container hero-content">
          <div className="badge">🚀 Sri Lanka's Leading University Platform</div>

          <h1 className="hero-title">
            Your University.<br />
            <span className="highlight">Connected.</span>
          </h1>

          <p className="hero-subtitle">
            The all-in-one platform for students and employers. Share materials,
            find jobs, join study groups, and build your future — all in one beautiful place.
          </p>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              Start for Free
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/about')}>
              Watch 1:30 Demo
            </button>
          </div>

          <div className="hero-trust">
            Trusted by students from <strong>University of Colombo, Moratuwa, Peradeniya &amp; more</strong>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="hero-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.students.toLocaleString()}+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.materials.toLocaleString()}+</div>
              <div className="stat-label">Study Materials</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.jobs.toLocaleString()}+</div>
              <div className="stat-label">Job Opportunities</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.satisfaction}%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need.<br />Nothing you don’t.</h2>
            <p>Powerful tools designed specifically for Sri Lankan university life.</p>
          </div>

          <div className="features-grid">
            {[
              { icon: "📚", title: "Lecture Materials Hub", desc: "Upload, organize, and discover lecture notes, past papers, and video recordings from your batch mates." },
              { icon: "💼", title: "Smart Job Portal", desc: "Internships and graduate jobs from top companies. One-click apply with your UniBridge profile." },
              { icon: "👥", title: "Kuppi & Study Groups", desc: "Create or join live study sessions. Find motivated peers for group discussions and exam prep." }
            ].map((feature, i) => (
              <div className="feature-card" key={i} style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonial-section">
        <div className="container">
          <div className="testimonial-container">
            <div className="testimonial-card">
              <div className="quote-mark">“</div>
              <p className="testimonial-quote">
                {testimonials[activeTestimonial].quote}
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonials[activeTestimonial].initials}</div>
                <div>
                  <strong>{testimonials[activeTestimonial].name}</strong>
                  <span>{testimonials[activeTestimonial].role}</span>
                </div>
              </div>
            </div>

            <div className="testimonial-controls">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  className={`dot ${idx === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to level up your university experience?</h2>
            <p>Join thousands of Sri Lankan students already using UniBridge.</p>
            <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>
              Create Free Account — Takes 30 seconds
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;