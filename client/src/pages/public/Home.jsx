import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Animated background layer */}
      <div className="marvel-bg-animated"></div>

      {/* Hero Section */}
      <section className="hero-advanced">
        <div className="container hero-container">
          <div className="hero-content fade-in-up">
            <div className="marvel-badge">
              🚀 THE ALL-IN-ONE PLATFORM
            </div>
            <h1 className="hero-title">
              Empower Your <br />
              <span className="gradient-text">University Journey</span>
            </h1>
            <p className="hero-subtitle">
              UniBridge seamlessly connects students and employers. Share lecture materials, explore job opportunities, schedule peer study sessions, and track applications all in one place.
            </p>
            <div className="button-group">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>
                Get Started Free
              </button>
              <button className="btn btn-outline btn-large" onClick={() => navigate('/about')}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="container stats-container">
        <div className="stats-grid fade-in-up delay-1">
          <div className="stat-card">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Active Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">Study Materials</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">200+</div>
            <div className="stat-label">Job Postings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container features-section">
        <div className="section-header fade-in-up delay-2">
          <h2 className="section-title">Why Choose UniBridge?</h2>
          <p className="section-desc">
            Everything you need to succeed academically and professionally, packed into a single, beautiful platform.
          </p>
        </div>

        <div className="features-grid fade-in-up delay-3">
          <div className="feature-card-advanced">
            <div className="feature-icon-advanced">📚</div>
            <h3 className="feature-title-advanced">Lecture Materials</h3>
            <p className="feature-text-advanced">
              Easily browse, upload, and organize your class notes, PDFs, or videos. Share knowledge with your peers effortlessly.
            </p>
          </div>
          <div className="feature-card-advanced">
            <div className="feature-icon-advanced">💼</div>
            <h3 className="feature-title-advanced">Career Opportunities</h3>
            <p className="feature-text-advanced">
              Discover internships and jobs tailored for you. Apply with a single click and track your applications in real time.
            </p>
          </div>
          <div className="feature-card-advanced">
            <div className="feature-icon-advanced">🎓</div>
            <h3 className="feature-title-advanced">Peer Study Hub</h3>
            <p className="feature-text-advanced">
              Create or join 'Kuppi' study sessions. Connect with classmates and prepare for your exams together.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonial Section (Marvel style) */}
      <div className="container testimonial-section fade-in-up delay-4">
        <div className="testimonial-card">
          <p className="testimonial-quote">
            “UniBridge completely transformed how I study and find internships. The platform is intuitive and the community is amazing!”
          </p>
          <div className="testimonial-author">
            <div className="author-avatar">JD</div>
            <div className="author-info">
              <strong>Jane Doe</strong>
              <span>Computer Science Student</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container cta-advanced fade-in-up delay-5">
        <div className="cta-inner">
          <h2>Ready to bridge the gap?</h2>
          <p>Join completely free and start exploring resources and opportunities today.</p>
          <button className="btn btn-white btn-large" onClick={() => navigate('/register')}>
            Create an Account
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;