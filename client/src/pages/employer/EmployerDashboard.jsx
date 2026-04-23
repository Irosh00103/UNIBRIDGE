import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW FEATURES
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const fetchData = async () => {
    setLoading(true);

    try {
      const jobRes = await axios.get(
        "http://localhost:5000/api/jobs"
      );

      const allJobs =
        jobRes?.data?.data || [];

      const employerJobs =
        user?.role === "admin"
          ? allJobs
          : allJobs.filter(
              (job) =>
                String(
                  job.employerId
                ) ===
                String(
                  user?.id
                )
            );

      setJobs(employerJobs);

      try {
        const appRes =
          await axios.get(
            "http://localhost:5000/api/applications"
          );

        setApplications(
          appRes?.data?.data ||
            []
        );
      } catch {
        setApplications([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const getApplicantsCount = (
    jobId
  ) => {
    return applications.filter(
      (app) =>
        String(app.jobId) ===
        String(jobId)
    ).length;
  };

  // FILTERED DATA
  const filteredJobs = jobs.filter(
    (job) => {
      const matchesSearch =
        job.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        job.company
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : job.status ===
            statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  const totalApplicants =
    applications.length;

  const openJobs =
    jobs.filter(
      (j) =>
        j.status === "OPEN"
    ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "80px 24px",
        background:
          "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "1350px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom:
              "28px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color:
                  "#2563eb",
                fontWeight:
                  "800",
                fontSize:
                  "13px",
                letterSpacing:
                  ".08em",
              }}
            >
              EMPLOYER DASHBOARD
            </p>

            <h1
              style={{
                margin:
                  "8px 0 0",
                fontSize:
                  "42px",
                color:
                  "#0f172a",
              }}
            >
              Welcome{" "}
              {user?.name}
              👋
            </h1>

            <p
              style={{
                color:
                  "#64748b",
              }}
            >
              Manage jobs and
              applicants
              efficiently
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/employer/jobs/create"
              )
            }
            style={
              createBtn
            }
          >
            + Create Job
          </button>
        </div>

        {/* KPI CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "18px",
            marginBottom:
              "25px",
          }}
        >
          <Card
            title="Total Jobs"
            value={
              jobs.length
            }
          />
          <Card
            title="Open Jobs"
            value={
              openJobs
            }
          />
          <Card
            title="Applicants"
            value={
              totalApplicants
            }
          />
          <Card
            title="Filtered"
            value={
              filteredJobs.length
            }
          />
        </div>

        {/* FILTER BAR */}
        <div
          style={{
            background:
              "#fff",
            padding:
              "18px",
            borderRadius:
              "18px",
            marginBottom:
              "20px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,.05)",
            display: "flex",
            gap: "14px",
            flexWrap:
              "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(
              e
            ) =>
              setSearch(
                e.target
                  .value
              )
            }
            style={
              searchInput
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
            style={
              selectBox
            }
          >
            <option value="ALL">
              All Status
            </option>
            <option value="OPEN">
              Open
            </option>
            <option value="CLOSED">
              Closed
            </option>
          </select>
        </div>

        {/* TABLE */}
        <div
          style={{
            background:
              "#fff",
            borderRadius:
              "22px",
            padding:
              "24px",
            boxShadow:
              "0 15px 35px rgba(0,0,0,.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color:
                "#0f172a",
            }}
          >
            Job Listings
          </h2>

          {loading ? (
            <p>
              Loading...
            </p>
          ) : filteredJobs.length ===
            0 ? (
            <p>
              No jobs
              found
            </p>
          ) : (
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <Th>
                    Title
                  </Th>
                  <Th>
                    Company
                  </Th>
                  <Th>
                    Applicants
                  </Th>
                  <Th>
                    Status
                  </Th>
                  <Th>
                    Action
                  </Th>
                </tr>
              </thead>

              <tbody>
                {filteredJobs.map(
                  (
                    job
                  ) => (
                    <tr
                      key={
                        job._id
                      }
                      style={{
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      <Td strong>
                        {
                          job.title
                        }
                      </Td>

                      <Td>
                        {
                          job.company
                        }
                      </Td>

                      <Td>
                        {getApplicantsCount(
                          job._id
                        )}
                      </Td>

                      <Td>
                        <span
                          style={{
                            padding:
                              "6px 12px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "700",
                            background:
                              job.status ===
                              "OPEN"
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              job.status ===
                              "OPEN"
                                ? "#166534"
                                : "#991b1b",
                          }}
                        >
                          {
                            job.status
                          }
                        </span>
                      </Td>

                      <Td>
                        <button
                          onClick={() =>
                            navigate(
                              `/employer/jobs/${job._id}/applicants`,
                              {
                                state:
                                  {
                                    ...job,
                                    _origin:
                                      "employer-dashboard",
                                  },
                              }
                            )
                          }
                          style={
                            actionBtn
                          }
                        >
                          View Applicants
                        </button>
                      </Td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const Card = ({
  title,
  value,
}) => (
  <div
    style={{
      background:
        "#fff",
      padding:
        "24px",
      borderRadius:
        "18px",
      boxShadow:
        "0 8px 20px rgba(0,0,0,.05)",
    }}
  >
    <p
      style={{
        margin: 0,
        color:
          "#64748b",
      }}
    >
      {title}
    </p>

    <h2
      style={{
        margin:
          "10px 0 0",
        fontSize:
          "34px",
        color:
          "#0f172a",
      }}
    >
      {value}
    </h2>
  </div>
);

const Th = ({
  children,
}) => (
  <th
    style={{
      textAlign:
        "left",
      padding:
        "14px",
      color:
        "#64748b",
      fontSize:
        "13px",
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
        "14px",
      color:
        "#334155",
      fontWeight:
        strong
          ? "700"
          : "500",
    }}
  >
    {children}
  </td>
);

const createBtn = {
  border: "none",
  padding:
    "14px 24px",
  borderRadius:
    "14px",
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};

const actionBtn = {
  border: "none",
  padding:
    "8px 14px",
  borderRadius:
    "10px",
  background:
    "#2563eb",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};

const searchInput = {
  flex: 1,
  minWidth: "250px",
  padding:
    "12px 14px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "12px",
};

const selectBox = {
  padding:
    "12px 14px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "12px",
};

export default EmployerDashboard;