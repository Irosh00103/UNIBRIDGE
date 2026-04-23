import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        'http://localhost:5000/api/jobs'
      );

      const allJobs = res?.data?.data || [];

      const employerJobs =
        user?.role === 'admin'
          ? allJobs
          : allJobs.filter(
              (job) =>
                String(job.employerId) ===
                String(user?.id)
            );

      setJobs(employerJobs);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to load jobs'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  const handleCloseJob = async (id) => {
    const ok = window.confirm(
      'Close this listing?'
    );
    if (!ok) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/jobs/${id}/close`
      );
      fetchJobs();
    } catch {
      alert('Failed to close listing');
    }
  };

  const activeJobs = jobs.filter(
    (j) => j.status === 'OPEN'
  ).length;

  const closedJobs = jobs.filter(
    (j) => j.status === 'CLOSED'
  ).length;

  return (
    <>
      <style>{`
        *{
          box-sizing:border-box;
        }

        .dash-page{
          min-height:100vh;
          padding:90px 24px 50px;
          background:
          radial-gradient(circle at top right,#8b5cf620,transparent 30%),
          radial-gradient(circle at bottom left,#2563eb20,transparent 30%),
          linear-gradient(135deg,#f8fafc,#eef2ff,#ffffff);
          animation:bgMove 10s ease infinite alternate;
        }

        @keyframes bgMove{
          from{background-position:0% 0%;}
          to{background-position:100% 100%;}
        }

        .float-card{
          animation:floatUp .8s ease forwards;
          opacity:0;
          transform:translateY(30px);
        }

        @keyframes floatUp{
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        .glass{
          background:rgba(255,255,255,.72);
          backdrop-filter:blur(14px);
          border:1px solid rgba(255,255,255,.6);
        }

        .hover-lift{
          transition:.35s ease;
        }

        .hover-lift:hover{
          transform:translateY(-8px) scale(1.02);
          box-shadow:0 25px 40px rgba(0,0,0,.08);
        }

        .pulse-btn{
          position:relative;
          overflow:hidden;
        }

        .pulse-btn::after{
          content:'';
          position:absolute;
          inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
          transform:translateX(-100%);
          transition:.7s;
        }

        .pulse-btn:hover::after{
          transform:translateX(100%);
        }

        .row-hover{
          transition:.25s ease;
        }

        .row-hover:hover{
          background:#f8fafc;
          transform:scale(1.01);
        }

        .spin-loader{
          width:46px;
          height:46px;
          border-radius:50%;
          border:4px solid #dbeafe;
          border-top:4px solid #2563eb;
          animation:spin .8s linear infinite;
          margin:auto;
        }

        @keyframes spin{
          to{transform:rotate(360deg)}
        }
      `}</style>

      <div className="dash-page">
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <div
            className="float-card"
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '28px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '42px',
                  margin: 0,
                  fontWeight: 900,
                  color: '#0f172a',
                }}
              >
                Welcome, {user?.name} 👋
              </h1>

              <p
                style={{
                  color: '#64748b',
                  marginTop: '10px',
                }}
              >
                Control your hiring universe.
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  '/employer/jobs/create'
                )
              }
              className="pulse-btn"
              style={{
                border: 'none',
                padding:
                  '14px 24px',
                borderRadius:
                  '18px',
                background:
                  'linear-gradient(135deg,#2563eb,#7c3aed)',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
                height:
                  'fit-content',
                boxShadow:
                  '0 18px 35px rgba(37,99,235,.25)',
              }}
            >
              + Create Job
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(250px,1fr))',
              gap: '18px',
              marginBottom: '28px',
            }}
          >
            <Card
              title="Total Jobs"
              value={jobs.length}
              icon="📄"
              delay="0s"
            />
            <Card
              title="Open Listings"
              value={activeJobs}
              icon="🟢"
              delay=".15s"
            />
            <Card
              title="Closed Listings"
              value={closedJobs}
              icon="🔒"
              delay=".3s"
            />
          </div>

          {/* Main Panel */}
          <div
            className="glass float-card"
            style={{
              animationDelay:
                '.4s',
              borderRadius:
                '26px',
              padding: '24px',
              boxShadow:
                '0 20px 45px rgba(0,0,0,.07)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: '#0f172a',
              }}
            >
              Your Job Listings
            </h2>

            {error && (
              <div
                style={{
                  background:
                    '#fee2e2',
                  color:
                    '#991b1b',
                  padding:
                    '12px',
                  borderRadius:
                    '14px',
                  marginBottom:
                    '16px',
                }}
              >
                {error}
              </div>
            )}

            {loading ? (
              <div
                style={{
                  padding:
                    '60px 0',
                  textAlign:
                    'center',
                }}
              >
                <div className="spin-loader"></div>
                <p
                  style={{
                    color:
                      '#64748b',
                    marginTop:
                      '12px',
                  }}
                >
                  Loading dashboard...
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div
                style={{
                  textAlign:
                    'center',
                  padding:
                    '60px',
                  color:
                    '#64748b',
                }}
              >
                <div
                  style={{
                    fontSize:
                      '60px',
                    animation:
                      'floatUp .8s ease',
                  }}
                >
                  📭
                </div>
                No jobs yet
              </div>
            ) : (
              <div
                style={{
                  overflowX:
                    'auto',
                }}
              >
                <table
                  style={{
                    width:
                      '100%',
                    borderCollapse:
                      'separate',
                    borderSpacing:
                      '0 10px',
                  }}
                >
                  <thead>
                    <tr>
                      <Th>
                        Job Title
                      </Th>
                      <Th>
                        Deadline
                      </Th>
                      <Th>
                        Status
                      </Th>
                      <Th>
                        Actions
                      </Th>
                    </tr>
                  </thead>

                  <tbody>
                    {jobs.map(
                      (
                        job,
                        index
                      ) => (
                        <tr
                          key={
                            job._id
                          }
                          className="row-hover"
                          style={{
                            background:
                              '#fff',
                            boxShadow:
                              '0 8px 18px rgba(0,0,0,.04)',
                          }}
                        >
                          <Td strong>
                            {
                              job.title
                            }
                          </Td>

                          <Td>
                            {job.deadline
                              ? new Date(
                                  job.deadline
                                ).toLocaleDateString()
                              : 'N/A'}
                          </Td>

                          <Td>
                            <span
                              style={{
                                padding:
                                  '6px 12px',
                                borderRadius:
                                  '999px',
                                fontSize:
                                  '12px',
                                fontWeight:
                                  '700',
                                background:
                                  job.status ===
                                  'OPEN'
                                    ? '#dcfce7'
                                    : '#fee2e2',
                                color:
                                  job.status ===
                                  'OPEN'
                                    ? '#166534'
                                    : '#991b1b',
                              }}
                            >
                              {
                                job.status
                              }
                            </span>
                          </Td>

                          <Td>
                            <div
                              style={{
                                display:
                                  'flex',
                                gap:
                                  '8px',
                                flexWrap:
                                  'wrap',
                              }}
                            >
                              <button
                                style={
                                  btn
                                }
                                onClick={() =>
                                  navigate(
                                    `/employer/jobs/${job._id}/applicants`,
                                    {
                                      state:
                                        job,
                                    }
                                  )
                                }
                              >
                                Applicants
                              </button>

                              {job.status ===
                                'OPEN' && (
                                <button
                                  style={{
                                    ...btn,
                                    background:
                                      '#ef4444',
                                    color:
                                      '#fff',
                                  }}
                                  onClick={() =>
                                    handleCloseJob(
                                      job._id
                                    )
                                  }
                                >
                                  Close
                                </button>
                              )}
                            </div>
                          </Td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Card = ({
  title,
  value,
  icon,
  delay,
}) => (
  <div
    className="glass hover-lift float-card"
    style={{
      animationDelay:
        delay,
      borderRadius:
        '24px',
      padding: '24px',
      boxShadow:
        '0 12px 25px rgba(0,0,0,.05)',
    }}
  >
    <div
      style={{
        fontSize: '30px',
      }}
    >
      {icon}
    </div>

    <h3
      style={{
        fontSize: '34px',
        margin:
          '10px 0 6px',
        color:
          '#0f172a',
      }}
    >
      {value}
    </h3>

    <p
      style={{
        margin: 0,
        color:
          '#64748b',
        fontWeight:
          '700',
      }}
    >
      {title}
    </p>
  </div>
);

const Th = ({
  children,
}) => (
  <th
    style={{
      textAlign:
        'left',
      padding:
        '14px',
      color:
        '#64748b',
      fontSize:
        '13px',
    }}
  >
    {children}
  </th>
);

const Td = ({
  children,
  strong,
}) => (
  <td
    style={{
      padding:
        '16px',
      color:
        '#334155',
      fontWeight:
        strong
          ? '700'
          : '500',
      borderTop:
        '1px solid #f1f5f9',
      borderBottom:
        '1px solid #f1f5f9',
    }}
  >
    {children}
  </td>
);

const btn = {
  padding:
    '8px 12px',
  borderRadius:
    '10px',
  border: 'none',
  background:
    '#eff6ff',
  color: '#1d4ed8',
  fontWeight: '700',
  cursor: 'pointer',
};

export default EmployerDashboard;