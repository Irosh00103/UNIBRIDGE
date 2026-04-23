import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  useLocation,
  useParams,
  Link,
  useNavigate,
} from 'react-router-dom';
import {
  FaArrowLeft,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaUsers,
  FaFileAlt,
  FaPaperPlane,
} from 'react-icons/fa';
import '../../styles/ViewApplicants.css';

const ViewApplicants = () => {
  const navigate =
    useNavigate();

  const {
    id:
      jobIdFromRoute,
  } = useParams();

  const { state } =
    useLocation();

  const [job, setJob] =
    useState(
      state || {
        title:
          'Job Position',
      }
    );

  const [
    applicants,
    setApplicants,
  ] = useState([]);

  const [loading,
    setLoading,
  ] = useState(true);

  const [error,
    setError,
  ] = useState('');

  const [
    emailSearch,
    setEmailSearch,
  ] = useState('');

  /* NEW STATES */
  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('ALL');

  const [
    sortType,
    setSortType,
  ] = useState('NEWEST');

  const [
    darkMode,
    setDarkMode,
  ] = useState(false);

  const token =
    localStorage.getItem(
      'ub_token'
    );

  const authHeaders =
    token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};

  useEffect(() => {
    if (
      state?._origin !==
      'employer-dashboard'
    ) {
      navigate(
        '/employer/dashboard',
        {
          replace: true,
        }
      );
      return;
    }

    const fetchApplicants =
      async () => {
        try {
          let resolvedJob =
            state;

          const targetJobId =
            state?._id ||
            jobIdFromRoute;

          if (
            !resolvedJob &&
            targetJobId
          ) {
            const jobsRes =
              await axios.get(
                'http://localhost:5000/api/jobs',
                {
                  headers:
                    authHeaders,
                }
              );

            resolvedJob =
              (
                jobsRes
                  .data
                  ?.data ||
                []
              ).find(
                (
                  item
                ) =>
                  String(
                    item._id
                  ) ===
                  String(
                    targetJobId
                  )
              );
          }

          if (
            resolvedJob
          ) {
            setJob(
              resolvedJob
            );
          }

          if (
            !targetJobId
          ) {
            setLoading(
              false
            );
            return;
          }

          const res =
            await axios.get(
              `http://localhost:5000/api/applications/job/${targetJobId}`,
              {
                headers:
                  authHeaders,
              }
            );

          setApplicants(
            res.data
              .data
          );
        } catch (err) {
          setError(
            err
              .response
              ?.data
              ?.message ||
              'Failed to load applicants'
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    fetchApplicants();
  }, [
    jobIdFromRoute,
    state,
    navigate,
  ]);

  const handleStatusUpdate =
    async (
      id,
      status
    ) => {
      if (
        !window.confirm(
          `Are you sure you want to ${status} this applicant?`
        )
      )
        return;

      try {
        const res =
          await axios.patch(
            `http://localhost:5000/api/applications/${id}/status`,
            {
              status,
            },
            {
              headers:
                authHeaders,
            }
          );

        if (
          res.data
            .success
        ) {
          setApplicants(
            (
              prev
            ) =>
              prev.map(
                (
                  app
                ) =>
                  app._id ===
                  id
                    ? {
                        ...app,
                        status,
                      }
                    : app
              )
          );
        }
      } catch (err) {
        alert(
          err
            .response
            ?.data
            ?.message ||
            'Failed to update status'
        );
      }
    };

  const pendingCount =
    applicants.filter(
      (
        app
      ) =>
        String(
          app.status
        ).toUpperCase() ===
        'PENDING'
    ).length;

  const selectedCount =
    applicants.filter(
      (
        app
      ) =>
        String(
          app.status
        ).toUpperCase() ===
        'SELECTED'
    ).length;

  const rejectedCount =
    applicants.filter(
      (
        app
      ) =>
        String(
          app.status
        ).toUpperCase() ===
        'REJECTED'
    ).length;

  const statCards =
    [
      {
        label:
          'Total Applicants',
        value:
          applicants.length,
        icon:
          <FaUsers />,
      },
      {
        label:
          'Pending',
        value:
          pendingCount,
        icon:
          <FaUserClock />,
      },
      {
        label:
          'Selected',
        value:
          selectedCount,
        icon:
          <FaUserCheck />,
      },
      {
        label:
          'Rejected',
        value:
          rejectedCount,
        icon:
          <FaUserTimes />,
      },
    ];

  const filteredApplicants =
    applicants
      .filter(
        (
          app
        ) => {
          const searchOk =
            (
              app.studentName ||
              ''
            )
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            (
              app.studentEmail ||
              ''
            )
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              );

          const statusOk =
            statusFilter ===
            'ALL'
              ? true
              : String(
                  app.status ||
                    'PENDING'
                ).toUpperCase() ===
                statusFilter;

          return (
            searchOk &&
            statusOk
          );
        }
      )
      .sort(
        (
          a,
          b
        ) => {
          if (
            sortType ===
            'NAME'
          ) {
            return (
              a.studentName ||
              ''
            ).localeCompare(
              b.studentName ||
                ''
            );
          }

          return 0;
        }
      );

  const handleSearchProfile =
    (e) => {
      e.preventDefault();

      const email =
        emailSearch
          .trim()
          .toLowerCase();

      if (
        !email ||
        !email.includes(
          '@'
        )
      ) {
        setError(
          'Please enter valid email'
        );
        return;
      }

      navigate(
        '/employer/students/profile',
        {
          state: {
            email,
            _origin:
              'employer-applicants',
          },
        }
      );
    };

  const handleOpenProfile =
    (
      email
    ) => {
      navigate(
        '/employer/students/profile',
        {
          state: {
            email,
            _origin:
              'employer-applicants',
          },
        }
      );
    };

  const exportCSV =
    () => {
      const rows =
        filteredApplicants.map(
          (
            app
          ) => ({
            Name:
              app.studentName,
            Email:
              app.studentEmail,
            Status:
              app.status,
          })
        );

      const csv =
        [
          Object.keys(
            rows[0] ||
              {}
          ).join(
            ','
          ),
          ...rows.map(
            (
              r
            ) =>
              Object.values(
                r
              ).join(
                ','
              )
          ),
        ].join(
          '\n'
        );

      const blob =
        new Blob(
          [csv],
          {
            type:
              'text/csv',
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const a =
        document.createElement(
          'a'
        );

      a.href =
        url;
      a.download =
        'applicants.csv';
      a.click();
    };

  return (
    <div
      className={`container page applicants-page ${
        darkMode
          ? 'dark-ui'
          : ''
      }`}
    >
      <div className="applicants-back-row">
        <Link
          to="/employer/dashboard"
          className="applicants-back-link"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>
      </div>

      <section className="applicants-hero card">
        <div className="applicants-hero-tag">
          Talent Pipeline
        </div>

        <div className="applicants-hero-main">
          <div>
            <h1>
              Applicants for{' '}
              {
                job.title
              }
            </h1>

            <p>
              Review
              candidate
              profiles
              faster.
            </p>

            <div
              style={{
                display:
                  'flex',
                gap:
                  '10px',
                flexWrap:
                  'wrap',
                marginTop:
                  '14px',
              }}
            >
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setDarkMode(
                    !darkMode
                  )
                }
              >
                {darkMode
                  ? '☀ Light'
                  : '🌙 Dark'}
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={
                  exportCSV
                }
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="applicants-hero-meta">
            <span>
              {job.company ||
                'Company'}
            </span>

            <span>
              {job.location ||
                'Location'}
            </span>
          </div>
        </div>
      </section>

      <section className="applicants-stats-grid">
        {statCards.map(
          (
            item
          ) => (
            <article
              key={
                item.label
              }
              className="applicants-stat-card"
            >
              <div className="applicants-stat-icon">
                {
                  item.icon
                }
              </div>

              <div>
                <h3>
                  {
                    item.value
                  }
                </h3>
                <p>
                  {
                    item.label
                  }
                </p>
              </div>
            </article>
          )
        )}
      </section>

      <section className="card applicants-search-card">
        <form
          className="applicants-search-form"
          onSubmit={
            handleSearchProfile
          }
        >
          <input
            type="email"
            placeholder="student@email.com"
            value={
              emailSearch
            }
            onChange={(
              e
            ) =>
              setEmailSearch(
                e.target
                  .value
              )
            }
          />

          <button className="btn btn-primary">
            Search Profile
          </button>
        </form>

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',
            gap:
              '12px',
            marginTop:
              '12px',
          }}
        >
          <input
            placeholder="Search applicant..."
            value={
              searchTerm
            }
            onChange={(
              e
            ) =>
              setSearchTerm(
                e.target
                  .value
              )
            }
          />

          <select
            value={
              statusFilter
            }
            onChange={(
              e
            ) =>
              setStatusFilter(
                e.target
                  .value
              )
            }
          >
            <option value="ALL">
              All
            </option>
            <option value="PENDING">
              Pending
            </option>
            <option value="SELECTED">
              Selected
            </option>
            <option value="REJECTED">
              Rejected
            </option>
          </select>

          <select
            value={
              sortType
            }
            onChange={(
              e
            ) =>
              setSortType(
                e.target
                  .value
              )
            }
          >
            <option value="NEWEST">
              Default
            </option>
            <option value="NAME">
              Name A-Z
            </option>
          </select>
        </div>
      </section>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          Loading...
        </div>
      ) : filteredApplicants.length ===
        0 ? (
        <section className="applicants-empty card">
          <FaFileAlt />
          <h2>
            No Applicants
          </h2>
          <p>
            No data
            found.
          </p>
        </section>
      ) : (
        <section className="card applicants-table-shell">
          <div className="applicants-table-header">
            <h2>
              Candidate List
            </h2>
            <span>
              {
                filteredApplicants.length
              }{' '}
              total
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    Name
                  </th>
                  <th>
                    Email
                  </th>
                  <th>
                    CV
                  </th>
                  <th>
                    Status
                  </th>
                  <th>
                    Action
                  </th>
                  <th>
                    Profile
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredApplicants.map(
                  (
                    app
                  ) => (
                    <tr
                      key={
                        app._id
                      }
                    >
                      <td>
                        {
                          app.studentName
                        }
                      </td>

                      <td>
                        {
                          app.studentEmail
                        }
                      </td>

                      <td>
                        {app.cvLink ? (
                          <a
                            href={
                              app.cvLink
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            View CV
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        {
                          app.status
                        }
                      </td>

                      <td>
                        {String(
                          app.status
                        ).toUpperCase() ===
                        'PENDING' ? (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                handleStatusUpdate(
                                  app._id,
                                  'SELECTED'
                                )
                              }
                            >
                              Select
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                handleStatusUpdate(
                                  app._id,
                                  'REJECTED'
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          'Done'
                        )}
                      </td>

                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            handleOpenProfile(
                              app.studentEmail
                            )
                          }
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default ViewApplicants;