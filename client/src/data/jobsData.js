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

const normalizeJobText = (...values) =>
  values
    .flatMap((value) => {
      if (Array.isArray(value)) return value;
      return [value];
    })
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const hasAnySignal = (text, signals) => signals.some((signal) => text.includes(signal));

export const mapJobToPortalCategory = (job) => {
  const titleText = normalizeJobText(job.title);
  const categoryText = normalizeJobText(job.category);
  const primaryText = normalizeJobText(job.title, job.category);
  const supportText = normalizeJobText(
    job.qualification,
    job.experience,
    job.workMode,
    job.overview,
    job.description,
    job.responsibilities,
    job.requirements,
    job.skills
  );
  const fullText = normalizeJobText(primaryText, supportText);

  const softwareRoleSignals = [
    "software engineer",
    "software engineering",
    "full stack engineer",
    "full stack developer",
    "frontend engineer",
    "frontend developer",
    "backend engineer",
    "backend developer",
    "web developer",
    "mobile developer",
    "app developer",
    "devops engineer",
    "qa engineer",
    "data engineer",
    "data analyst",
    "ui/ux",
    "ui ux",
  ];

  const softwareSignals = [
    "frontend",
    "backend",
    "full stack",
    "software",
    "developer",
    "programmer",
    "react",
    "node",
    "javascript",
    "java",
    "python",
    "qa",
    "quality assurance",
    "cyber",
    "security",
    "data analyst",
    "data science",
    "analytics",
    "ui/ux",
    "web",
    "mobile app",
    "devops",
    "cloud",
    "api",
    "database",
  ];

  const physicalEngineeringRoleSignals = [
    "civil engineer",
    "civil engineering",
    "electrical engineer",
    "electrical engineering",
    "electric engineer",
    "mechanical engineer",
    "mechanical engineering",
    "structural engineer",
    "structural engineering",
    "site engineer",
    "project engineer",
    "quantity surveyor",
    "mep engineer",
  ];

  const physicalEngineeringSignals = [
    "electrical",
    "electric",
    "civil",
    "mechanical",
    "construction",
    "structural",
    "site supervisor",
    "site engineer",
    "quantity surveyor",
    "autocad",
    "mep",
    "hvac",
    "plumbing",
    "estimating engineer",
    "project engineer",
  ];

  const primaryHasSoftwareRole = hasAnySignal(primaryText, softwareRoleSignals);
  const primaryHasPhysicalEngineeringRole = hasAnySignal(
    primaryText,
    physicalEngineeringRoleSignals
  );
  const primaryHasPhysicalEngineeringSignals = hasAnySignal(
    primaryText,
    physicalEngineeringSignals
  );
  const fullHasSoftwareSignals = hasAnySignal(fullText, softwareSignals);
  const fullHasPhysicalEngineeringSignals = hasAnySignal(
    fullText,
    physicalEngineeringSignals
  );

  if (primaryHasSoftwareRole) return "it-software-jobs";
  if (primaryHasPhysicalEngineeringRole || primaryHasPhysicalEngineeringSignals) {
    return "construction-engineering-jobs";
  }

  if (fullHasSoftwareSignals) return "it-software-jobs";
  if (
    fullHasPhysicalEngineeringSignals ||
    (categoryText.includes("engineering") && !fullHasSoftwareSignals) ||
    ((titleText.includes("engineer") || titleText.includes("engineering")) &&
      !primaryHasSoftwareRole &&
      !fullHasSoftwareSignals)
  ) {
    return "construction-engineering-jobs";
  }
  if (fullText.includes("education") || fullText.includes("training") || fullText.includes("academic")) return "education-training-jobs";
  if (fullText.includes("marketing") || fullText.includes("communication") || fullText.includes("social media") || fullText.includes("content")) return "marketing-communication-jobs";
  if (fullText.includes("finance") || fullText.includes("accounting") || fullText.includes("operations")) return "accounting-finance-jobs";
  if (fullText.includes("banking")) return "finance-banking-jobs";
  if (fullText.includes("hr") || fullText.includes("recruitment")) return "hr-recruitment-jobs";
  if (fullText.includes("customer care") || fullText.includes("call center")) return "customer-care-call-center-jobs";
  if (fullText.includes("administrative") || fullText.includes("secretarial")) return "administrative-secretarial-jobs";
  if (fullText.includes("production") || fullText.includes("manufacturing")) return "production-manufacturing-jobs";
  if (fullText.includes("sales") || fullText.includes("business development")) return "sales-business-development-jobs";

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
