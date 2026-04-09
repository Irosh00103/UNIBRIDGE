import "../../styles/ApplicationsPage.css";
import { useMemo, useState } from "react";
import {
  FaSearch,
  FaFileAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { useJobs } from "../../context/JobsContext";

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const normalized = status.toLowerCase();

  return (
    <span className={`applications-status-badge ${normalized}`}>
      {status}
    </span>
  );
}

export default function JobPortalApplications() {
  const { applications, applicationsLoading, removeApplication } = useJobs();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleDeleteApplication = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this application from your tracking list?"
    );

    if (!confirmed) return;

    await removeApplication(id);
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const matchesStatus =
        statusFilter === "All" ? true : item.status === statusFilter;

      const query = searchValue.trim().toLowerCase();
      const matchesSearch =
        query === ""
          ? true
          : item.refNo.toLowerCase().includes(query) ||
            item.appliedJob.toLowerCase().includes(query) ||
            item.company.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchValue, statusFilter]);

  if (applicationsLoading) {
    return (
      <div className="applications-page">
        <div className="applications-container">
          <section className="applications-hero">
            <div className="applications-header">
              <div className="applications-header-icon-wrap">
                <div className="applications-header-icon-glow"></div>
                <div className="applications-header-icon">
                  <FaFileAlt />
                </div>
              </div>

              <div className="applications-header-text">
                <h1>Welcome to your application tracking!</h1>
                <p>Loading your applications...</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <div className="applications-container">
        <section className="applications-hero">
          <div className="applications-header">
            <div className="applications-header-icon-wrap">
              <div className="applications-header-icon-glow"></div>
              <div className="applications-header-icon">
                <FaFileAlt />
              </div>
            </div>

            <div className="applications-header-text">
              <h1>Welcome to your application tracking!</h1>
              <p>
                Stay organized and keep track of every role you've applied for in
                one place.
              </p>
            </div>
          </div>
        </section>

        <section className="applications-table-card">
          <div className="applications-toolbar">
            <div className="applications-search-wrap">
              <FaSearch className="applications-search-icon" />
              <input
                type="text"
                placeholder="Search by reference number, job title, or company"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="applications-search-input"
              />
            </div>

            <div className="applications-filter-wrap">
              <label htmlFor="statusFilter" className="applications-filter-label">
                Filter by status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="applications-filter-select"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="applications-table-wrap">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>App. Ref. No</th>
                  <th>Applied Job</th>
                  <th>Company</th>
                  <th>Date of Apply</th>
                  <th>Status</th>
                  <th className="applications-actions-heading">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((item) => (
                    <tr key={item.id}>
                      <td className="applications-ref">{item.refNo}</td>
                      <td>{item.appliedJob}</td>
                      <td>{item.company}</td>
                      <td>{formatDate(item.dateOfApply)}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="applications-actions-cell">
                        <button
                          type="button"
                          className="applications-delete-btn"
                          onClick={() => handleDeleteApplication(item.id)}
                          aria-label={`Delete application ${item.refNo}`}
                          title="Delete application"
                        >
                          <FaTrashAlt />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="applications-empty-state">
                        <div className="applications-empty-illustration">
                          <div className="applications-empty-illustration-circle">
                            <FaFileAlt />
                          </div>
                        </div>

                        <h3>No applications yet</h3>
                        <p>
                          Once you start applying for jobs, your application
                          details will appear here automatically.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
