// Home.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import '../../styles/Home.css';

// Custom hook for scroll-triggered animations
const useInView = (options = { threshold: 0.2, triggerOnce: true }) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (options.triggerOnce) observer.disconnect();
      } else if (!options.triggerOnce) {
        setIsInView(false);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
};

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, materials: 0, jobs: 0, satisfaction: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef = useRef(null);
  const animationStarted = useRef(false);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);

  // Scroll-triggered animation refs
  const [featuresRef, featuresInView] = useInView({ threshold: 0.15 });
  const [testimonialRef, testimonialInView] = useInView({ threshold: 0.2 });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.2 });

  const testimonials = [
    {
      quote: "UniBridge completely transformed how I study and find internships. The platform is intuitive and the community is amazing!",
      name: "Jane Doe",
      role: "Computer Science Student, University of Colombo",
      initials: "JD",
      avatar: "https://i.pravatar.cc/150?img=32"
    },
    {
      quote: "The peer study sessions feature helped me ace my final exams. Finding study partners has never been easier!",
      name: "Michael Chen",
      role: "Engineering Student, University of Moratuwa",
      initials: "MC",
      avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
      quote: "As an employer, I've found incredible talent through UniBridge. The application tracking system is a game-changer.",
      name: "Sarah Johnson",
      role: "HR Director, TechCorp Sri Lanka",
      initials: "SJ",
      avatar: "https://i.pravatar.cc/150?img=28"
    }
  ];

  // Advanced particle system with mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animationFrame;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      const particleCount = Math.min(Math.floor(width * 0.15), 120);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2.5 + 1.5,
          baseSize: Math.random() * 2.5 + 1.5
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particles
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction
        if (mouse.x && mouse.y) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * force * 2;
            p.y -= Math.sin(angle) * force * 2;
            p.size = p.baseSize + force * 4;
          } else {
            p.size = p.baseSize;
          }
        }

        // Draw particle with gradient
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.6, '#ec4899');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(drawParticles);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    animationFrame = requestAnimationFrame(drawParticles);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Parallax effect for hero shapes
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        const shapes = heroRef.current.querySelectorAll('.hero-shape');
        shapes.forEach((shape, i) => {
          const speed = 0.1 + (i * 0.05);
          shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.02}deg)`;
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Advanced stats animation with spring-like easing
  const animateStats = useCallback(() => {
    if (animationStarted.current) return;
    animationStarted.current = true;

    const targets = { students: 12450, materials: 874, jobs: 312, satisfaction: 98 };
    const duration = 2000;
    const startTime = performance.now();
    const startValues = { students: 0, materials: 0, jobs: 0, satisfaction: 0 };

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      setStats({
        students: Math.floor(startValues.students + (targets.students - startValues.students) * eased),
        materials: Math.floor(startValues.materials + (targets.materials - startValues.materials) * eased),
        jobs: Math.floor(startValues.jobs + (targets.jobs - startValues.jobs) * eased),
        satisfaction: Math.floor(startValues.satisfaction + (targets.satisfaction - startValues.satisfaction) * eased)
      });

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateStats();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [animateStats]);

  // Testimonial auto-rotate with pause on hover
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // FAQ Accordion functionality
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="home">
      {/* Advanced Particle Canvas */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* HERO SECTION - Ultra Premium */}
      <section className="hero" ref={heroRef}>
        <div className="hero-overlay" />
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <div className="container hero-content">
          <div className="badge animate-fade-up">
            <span className="badge-icon">✨</span>
            Sri Lanka's #1 University Ecosystem
          </div>

          <h1 className="hero-title animate-fade-up delay-1">
            <span className="title-line">Your University.</span>
            <span className="title-line highlight-wrapper">
              <span className="highlight">Connected.</span>
              <span className="highlight-blur">Connected.</span>
            </span>
          </h1>

          <p className="hero-subtitle animate-fade-up delay-2">
            The all-in-one platform that bridges students, educators, and employers.
            Share knowledge, discover opportunities, and build your future — all within
            Sri Lanka's most vibrant academic community.
          </p>

          <div className="hero-buttons animate-fade-up delay-3">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              <span>Start for Free</span>
              <span className="btn-icon">→</span>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/about')}>
              <span className="play-icon">▶</span>
              Watch 1:30 Demo
            </button>
          </div>

          <div className="hero-trust animate-fade-up delay-4">
            <div className="trust-logos">
              <span>Trusted by students from</span>
              <div className="university-logos">
                <span className="uni-logo">UoC</span>
                <span className="uni-logo">UoM</span>
                <span className="uni-logo">UoP</span>
                <span className="uni-logo">+12 more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated hero shapes with parallax */}
        <div className="hero-shapes">
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />
          <div className="hero-shape shape-4" />
        </div>

        <div className="scroll-indicator">
          <span>Discover More</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* STATS BAR - Glassmorphism */}
      <div className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid glass-card">
            {[
              { value: stats.students, label: 'Active Students', suffix: '+' },
              { value: stats.materials, label: 'Study Materials', suffix: '+' },
              { value: stats.jobs, label: 'Job Opportunities', suffix: '+' },
              { value: stats.satisfaction, label: 'Satisfaction Rate', suffix: '%' }
            ].map((stat, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-number">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-trend">↑ 12% this month</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES SECTION - Advanced Cards */}
      <section className="features-section" ref={featuresRef}>
        <div className="container">
          <div className={`section-header ${featuresInView ? 'in-view' : ''}`}>
            <span className="section-tag">Powerful Features</span>
            <h2>
              Everything you need.
              <span className="text-gradient"> Nothing you don't.</span>
            </h2>
            <p>Purpose-built tools designed specifically for the Sri Lankan university ecosystem.</p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: "📚",
                title: "Smart Materials Hub",
                desc: "AI-powered lecture notes organization. Upload, categorize, and discover materials with intelligent search and recommendations.",
                color: "#6366f1",
                stats: "5,000+ resources"
              },
              {
                icon: "💼",
                title: "Career Accelerator",
                desc: "Direct pipeline to top employers. One-click applications, interview prep, and real-time application tracking.",
                color: "#ec4899",
                stats: "300+ partner companies"
              },
              {
                icon: "👥",
                title: "Collaborative Learning",
                desc: "Virtual study rooms with whiteboard, screen share, and session recording. Find your perfect study squad.",
                color: "#22d3ee",
                stats: "1,200+ weekly sessions"
              },
              {
                icon: "🎓",
                title: "Mentorship Network",
                desc: "Connect with alumni and industry professionals for guidance, resume reviews, and career advice.",
                color: "#f59e0b",
                stats: "500+ active mentors"
              }
            ].map((feature, i) => (
              <div
                className={`feature-card ${featuresInView ? 'in-view' : ''}`}
                key={i}
                style={{ '--accent': feature.color, transitionDelay: `${i * 0.1}s` }}
              >
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-icon-glow" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <div className="feature-stats">{feature.stats}</div>
                <div className="feature-hover-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION - Detailed Value Proposition */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose UniBridge</span>
            <h2>More than just a platform<span className="text-gradient">. A complete ecosystem.</span></h2>
            <p>Discover how UniBridge transforms your academic and professional journey with comprehensive tools and resources.</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3>Launch Your Career Faster</h3>
              <p>Get direct access to exclusive internships and job opportunities from Sri Lanka's top companies. Our AI-powered matching system connects you with roles that fit your skills and aspirations.</p>
              <ul className="benefit-list">
                <li>Priority access to 500+ companies</li>
                <li>AI-powered job matching</li>
                <li>Interview preparation tools</li>
              </ul>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🧠</div>
              <h3>Smart Learning Experience</h3>
              <p>Access curated study materials, past papers, and notes from top performers. Our intelligent system recommends content based on your learning style and academic progress.</p>
              <ul className="benefit-list">
                <li>10,000+ study resources</li>
                <li>Personalized learning paths</li>
                <li>Real-time progress tracking</li>
              </ul>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">👥</div>
              <h3>Build Your Network</h3>
              <p>Connect with peers, alumni, and industry professionals. Join study groups, attend virtual events, and find mentors who can guide your career path.</p>
              <ul className="benefit-list">
                <li>25,000+ active users</li>
                <li>500+ industry mentors</li>
                <li>Weekly networking events</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Enhanced Carousel */}
      <section className="testimonial-section" ref={testimonialRef}>
        <div className="container">
          <div className={`testimonial-container ${testimonialInView ? 'in-view' : ''}`}>
            <div className="testimonial-header">
              <span className="section-tag">Success Stories</span>
              <h2>What our community says</h2>
            </div>

            <div className="testimonial-carousel">
              <div className="testimonial-card glass-card">
                <div className="quote-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M14 20H6V12C6 8.68629 8.68629 6 12 6H14V10H12C10.8954 10 10 10.8954 10 12V16H14V20Z" fill="url(#quote-gradient)" />
                    <path d="M42 20H34V12C34 8.68629 36.6863 6 40 6H42V10H40C38.8954 10 38 10.8954 38 12V16H42V20Z" fill="url(#quote-gradient)" />
                  </svg>
                </div>
                <p className="testimonial-quote">
                  {testimonials[activeTestimonial].quote}
                </p>
                <div className="testimonial-author">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <strong>{testimonials[activeTestimonial].name}</strong>
                    <span>{testimonials[activeTestimonial].role}</span>
                  </div>
                </div>
              </div>

              <div className="testimonial-controls">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    className={`testimonial-dot ${idx === activeTestimonial ? 'active' : ''}`}
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <svg className="quote-gradient-defs">
          <defs>
            <linearGradient id="quote-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </section>

      {/* FAQ SECTION - Frequently Asked Questions */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Got Questions?</span>
            <h2>Frequently Asked <span className="text-gradient">Questions</span></h2>
            <p>Find answers to common questions about UniBridge and how it can help you succeed.</p>
          </div>

          <div className="faq-grid">
            <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(0)}>
                <h4>Is UniBridge really free for students?</h4>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Yes! UniBridge is completely free for all Sri Lankan university students. We believe in providing equal access to opportunities and resources for everyone.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(1)}>
                <h4>How do I get started with job applications?</h4>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Simply create your profile, complete your academic and professional information, and start browsing exclusive job opportunities. Our AI will match you with suitable positions.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(2)}>
                <h4>Can I upload my own study materials?</h4>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Absolutely! We encourage students to share their notes, past papers, and study resources. You can earn recognition and help your peers while building your academic profile.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 3 ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(3)}>
                <h4>How does the mentorship program work?</h4>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Connect with industry professionals and alumni who volunteer as mentors. Schedule virtual sessions, get resume reviews, and receive career guidance tailored to your goals.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 4 ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(4)}>
                <h4>Is my data secure and private?</h4>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Yes, we take data privacy seriously. Your personal information is encrypted and never shared without your consent. You control who sees your profile and academic information.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 5 ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(5)}>
                <h4>Can employers contact me directly?</h4>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Employers can only contact you if you've applied to their positions or opted-in to be contacted. You have full control over your job search privacy settings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA - Dynamic Background */}
      <section className="final-cta" ref={ctaRef}>
        <div className="container">
          <div className={`cta-box ${ctaInView ? 'in-view' : ''}`}>
            <div className="cta-content">
              <h2>Ready to transform your university journey?</h2>
              <p>Join 12,000+ Sri Lankan students already accelerating their careers with UniBridge.</p>
              <div className="cta-buttons">
                <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>
                  Create Free Account
                  <span className="btn-subtext">Takes less than 30 seconds</span>
                </button>
                <button className="btn btn-outline-light" onClick={() => navigate('/universities')}>
                  Explore Universities
                </button>
              </div>
              <div className="cta-guarantee">
                <span>🔒 No credit card required</span>
                <span>⭐ 4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
            <div className="cta-visual">
              <div className="floating-card card-1" />
              <div className="floating-card card-2" />
              <div className="floating-card card-3" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;