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
  FaDownload,
  FaSearch,
  FaMoon,
  FaSun,
  FaEye,
} from 'react-icons/fa';
import '../../styles/ViewApplicants.css';

const ViewApplicants = () => {
  const navigate = useNavigate();
  const { id: jobIdFromRoute } = useParams();
  const { state } = useLocation();

  const [job, setJob] = useState(
    state || { title: 'Job Position' }
  );

  const [applicants, setApplicants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [emailSearch, setEmailSearch] =
    useState('');

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('ALL');

  const [darkMode, setDarkMode] =
    useState(false);

  const token =
    localStorage.getItem(
      'ub_token'
    );

  const authHeaders = token
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

    fetchApplicants();
  }, []);

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
              jobsRes.data
                ?.data || []
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

        if (resolvedJob)
          setJob(
            resolvedJob
          );

        const res =
          await axios.get(
            `http://localhost:5000/api/applications/job/${targetJobId}`,
            {
              headers:
                authHeaders,
            }
          );

        setApplicants(
          res.data.data ||
            []
        );
      } catch (err) {
        setError(
          err.response
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

  const handleStatusUpdate =
    async (
      id,
      status
    ) => {
      const ok =
        window.confirm(
          `Confirm ${status}?`
        );

      if (!ok) return;

      try {
        await axios.patch(
          `http://localhost:5000/api/applications/${id}/status`,
          { status },
          {
            headers:
              authHeaders,
          }
        );

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
      } catch {
        alert(
          'Update failed'
        );
      }
    };

  const handleSearchProfile =
    (e) => {
      e.preventDefault();

      if (
        !emailSearch.includes(
          '@'
        )
      ) {
        setError(
          'Enter valid email'
        );
        return;
      }

      navigate(
        '/employer/students/profile',
        {
          state: {
            email:
              emailSearch,
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
          ) =>
            `${app.studentName},${app.studentEmail},${app.status}`
        );

      const csv =
        'Name,Email,Status\n' +
        rows.join('\n');

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

  const filteredApplicants =
    applicants.filter(
      (
        app
      ) => {
        const matchSearch =
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

        const matchStatus =
          statusFilter ===
          'ALL'
            ? true
            : String(
                app.status
              ).toUpperCase() ===
              statusFilter;

        return (
          matchSearch &&
          matchStatus
        );
      }
    );

  const stats = {
    total:
      applicants.length,
    pending:
      applicants.filter(
        (
          a
        ) =>
          a.status ===
          'PENDING'
      ).length,
    selected:
      applicants.filter(
        (
          a
        ) =>
          a.status ===
          'SELECTED'
      ).length,
    rejected:
      applicants.filter(
        (
          a
        ) =>
          a.status ===
          'REJECTED'
      ).length,
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
          Back
        </Link>
      </div>

      {/* HERO */}
      <section className="applicants-hero card">
        <div className="applicants-hero-main">
          <div>
            <h1>
              {job.title}
              {' '}
              Applicants
            </h1>

            <p>
              Easy candidate
              management panel.
            </p>
          </div>

          <div
            style={{
              display:
                'flex',
              gap: '10px',
              flexWrap:
                'wrap',
            }}
          >
            <button
              className="btn btn-outline"
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
            >
              {darkMode ? (
                <FaSun />
              ) : (
                <FaMoon />
              )}
            </button>

            <button
              className="btn btn-primary"
              onClick={
                exportCSV
              }
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="applicants-stats-grid">
        <StatCard
          icon={
            <FaUsers />
          }
          title="Total"
          value={
            stats.total
          }
        />

        <StatCard
          icon={
            <FaUserClock />
          }
          title="Pending"
          value={
            stats.pending
          }
        />

        <StatCard
          icon={
            <FaUserCheck />
          }
          title="Selected"
          value={
            stats.selected
          }
        />

        <StatCard
          icon={
            <FaUserTimes />
          }
          title="Rejected"
          value={
            stats.rejected
          }
        />
      </section>

      {/* TOOLBAR */}
      <section className="card applicants-search-card">
        <form
          onSubmit={
            handleSearchProfile
          }
          className="applicants-search-form"
        >
          <input
            type="email"
            placeholder="Search profile by email"
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
            <FaSearch />
            Search
          </button>
        </form>

        <div
          style={{
            display:
              'grid',
            gridTemplateColumns:
              '2fr 1fr',
            gap: '12px',
            marginTop:
              '14px',
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
            No records found.
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
              }
              {' '}
              Results
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
                            View
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge badge-${String(
                            app.status
                          ).toLowerCase()}`}
                        >
                          {
                            app.status
                          }
                        </span>
                      </td>

                      <td>
                        {app.status ===
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
                          <FaEye />
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

const StatCard = ({
  icon,
  title,
  value,
}) => (
  <article className="applicants-stat-card">
    <div className="applicants-stat-icon">
      {icon}
    </div>

    <div>
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </article>
);

export default ViewApplicants;