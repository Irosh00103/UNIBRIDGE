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
  ) =>
    applications.filter(
      (app) =>
        String(app.jobId) ===
        String(jobId)
    ).length;

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

  const openJobs =
    jobs.filter(
      (j) =>
        j.status === "OPEN"
    ).length;

  return (
    <>
      <style>{`
        *{
          box-sizing:border-box;
        }

        body{
          margin:0;
          font-family:Inter,system-ui,sans-serif;
          background:#f8fafc;
        }

        .fade{
          animation:fade .7s ease;
        }

        @keyframes fade{
          from{
            opacity:0;
            transform:translateY(18px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        .hover-card{
          transition:.3s ease;
        }

        .hover-card:hover{
          transform:translateY(-5px);
          box-shadow:0 18px 40px rgba(0,0,0,.08);
        }

        .table-row{
          transition:.2s ease;
        }

        .table-row:hover{
          background:#f8fafc;
        }

        .glow-btn{
          transition:.25s ease;
        }

        .glow-btn:hover{
          transform:translateY(-2px);
          box-shadow:0 14px 24px rgba(37,99,235,.25);
        }

        .loader{
          width:48px;
          height:48px;
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

      <div
        style={{
          minHeight: "100vh",
          padding: "80px 24px",
          background:
            "linear-gradient(135deg,#f8fafc,#eef2ff,#ffffff)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}
          <div
            className="fade"
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom:
                "24px",
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
                PREMIUM EMPLOYER PANEL
              </p>

              <h1
                style={{
                  margin:
                    "8px 0 0",
                  fontSize:
                    "44px",
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
                Manage recruitment with
                modern tools.
              </p>
            </div>

            <button
              className="glow-btn"
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

          {/* HERO SECTION */}
          <div
            className="fade"
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr",
              gap: "18px",
              marginBottom:
                "24px",
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg,#2563eb,#1d4ed8)",
                borderRadius:
                  "24px",
                padding:
                  "28px",
                color:
                  "#fff",
              }}
            >
              <p
                style={{
                  margin: 0,
                  opacity: .9,
                }}
              >
                HIRING INSIGHT
              </p>

              <h2
                style={{
                  margin:
                    "10px 0",
                  fontSize:
                    "34px",
                }}
              >
                Build Your Dream Team 🚀
              </h2>

              <p
                style={{
                  margin: 0,
                  opacity: .9,
                }}
              >
                Review applicants,
                track listings and
                hire faster.
              </p>
            </div>

            <div
              className="hover-card"
              style={{
                background:
                  "#fff",
                borderRadius:
                  "24px",
                padding:
                  "24px",
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
                Current Time
              </p>

              <h2
                style={{
                  margin:
                    "10px 0",
                  color:
                    "#0f172a",
                }}
              >
                {new Date().toLocaleTimeString()}
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    "#2563eb",
                  fontWeight:
                    "700",
                }}
              >
                {new Date().toDateString()}
              </p>
            </div>
          </div>

          {/* KPI */}
          <div
            className="fade"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: "18px",
              marginBottom:
                "24px",
            }}
          >
            <Card
              title="Jobs"
              value={
                jobs.length
              }
            />
            <Card
              title="Open"
              value={
                openJobs
              }
            />
            <Card
              title="Applicants"
              value={
                applications.length
              }
            />
            <Card
              title="Visible"
              value={
                filteredJobs.length
              }
            />
          </div>

          {/* FILTER */}
          <div
            className="fade"
            style={{
              background:
                "#fff",
              padding:
                "18px",
              borderRadius:
                "18px",
              marginBottom:
                "22px",
              display: "flex",
              gap: "14px",
              flexWrap:
                "wrap",
              boxShadow:
                "0 8px 20px rgba(0,0,0,.05)",
            }}
          >
            <input
              type="text"
              placeholder="Search title / company..."
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
            className="fade"
            style={{
              background:
                "#fff",
              borderRadius:
                "24px",
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
              <div
                style={{
                  padding:
                    "60px",
                }}
              >
                <div className="loader"></div>
              </div>
            ) : filteredJobs.length ===
              0 ? (
              <p>
                No jobs found
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
                        className="table-row"
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
    </>
  );
};

const Card = ({
  title,
  value,
}) => (
  <div
    className="hover-card"
    style={{
      background:
        "#fff",
      padding:
        "24px",
      borderRadius:
        "20px",
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
        color:
          "#0f172a",
        fontSize:
          "34px",
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
  minWidth: "260px",
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