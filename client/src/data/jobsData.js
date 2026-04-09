export const portalCategories = [
  { slug: "it-software-jobs", name: "IT / Software Jobs", accent: "software", order: 1 },
  { slug: "accounting-finance-jobs", name: "Accounting / Finance Jobs", accent: "finance", order: 2 },
  { slug: "marketing-communication-jobs", name: "Marketing / Communication Jobs", accent: "marketing", order: 3 },
  { slug: "construction-engineering-jobs", name: "Construction / Engineering Jobs", accent: "engineering", order: 4 },
  { slug: "sales-business-development-jobs", name: "Sales / Business Development Jobs", accent: "sales", order: 5 },
  { slug: "other", name: "Other Jobs", accent: "other", order: 6 },
  { slug: "administrative-secretarial-jobs", name: "Administrative / Secretarial Jobs", accent: "admin", order: 7 },
  { slug: "production-manufacturing-jobs", name: "Production / Manufacturing Jobs", accent: "production", order: 8 },
  { slug: "customer-care-call-center-jobs", name: "Customer Care / Call Center Jobs", accent: "customer", order: 9 },
  { slug: "finance-banking-jobs", name: "Finance / Banking Jobs", accent: "banking", order: 10 },
  { slug: "education-training-jobs", name: "Education / Training Jobs", accent: "education", order: 11 },
  { slug: "hr-recruitment-jobs", name: "HR / Recruitment Jobs", accent: "hr", order: 12 },
];

export const mapJobToPortalCategory = (job) => {
  const text = [
    job.title || "",
    job.category || "",
    job.qualification || "",
    job.experience || "",
    job.workMode || "",
    ...(job.skills || []),
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("education") || text.includes("training") || text.includes("academic")) return "education-training-jobs";
  if (text.includes("frontend") || text.includes("software") || text.includes("react") || text.includes("qa") || text.includes("quality assurance") || text.includes("cyber") || text.includes("security") || text.includes("data") || text.includes("analytics") || text.includes("ui/ux") || text.includes("design")) return "it-software-jobs";
  if (text.includes("marketing") || text.includes("communication") || text.includes("social media") || text.includes("content")) return "marketing-communication-jobs";
  if (text.includes("finance") || text.includes("accounting") || text.includes("operations")) return "accounting-finance-jobs";
  if (text.includes("banking")) return "finance-banking-jobs";
  if (text.includes("hr") || text.includes("recruitment")) return "hr-recruitment-jobs";
  if (text.includes("customer care") || text.includes("call center")) return "customer-care-call-center-jobs";
  if (text.includes("administrative") || text.includes("secretarial")) return "administrative-secretarial-jobs";
  if (text.includes("production") || text.includes("manufacturing")) return "production-manufacturing-jobs";
  if (text.includes("engineering") || text.includes("construction")) return "construction-engineering-jobs";
  if (text.includes("sales") || text.includes("business development")) return "sales-business-development-jobs";

  return "other";
};

export const getPortalCategoryBySlug = (slug) =>
  portalCategories.find((c) => c.slug === slug);

export const filterJobs = (jobs, filters) => {
  return jobs.filter((job) => {
    const keyword = filters.keyword?.trim().toLowerCase() || "";
    const location = filters.location?.trim().toLowerCase() || "";
    const jobType = filters.jobType || "";
    const experience = filters.experience || "";
    const workMode = filters.workMode || "";

    const searchableText = [
      job.title, job.company, job.category, job.location, job.qualification, ...(job.skills || []),
    ].join(" ").toLowerCase();

    const matchesKeyword = !keyword || searchableText.includes(keyword);
    const matchesLocation = !location || (job.location || "").toLowerCase().includes(location);
    const matchesJobType = !jobType || job.type === jobType;
    const matchesExperience = !experience || job.experience === experience;
    const matchesWorkMode = !workMode || job.workMode === workMode;

    return matchesKeyword && matchesLocation && matchesJobType && matchesExperience && matchesWorkMode;
  });
};

export const getUniqueJobTypes = (jobs) => [...new Set(jobs.map((j) => j.type).filter(Boolean))];
export const getUniqueExperiences = (jobs) => [...new Set(jobs.map((j) => j.experience).filter(Boolean))];
export const getUniqueWorkModes = (jobs) => [...new Set(jobs.map((j) => j.workMode).filter(Boolean))];
