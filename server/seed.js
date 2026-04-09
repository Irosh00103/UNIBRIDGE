const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Job = require('./models/Job');
const bcrypt = require('bcryptjs');
const { mapJobToPortalCategory } = require('./utils/jobCategoryMapper');

const portalJobs = [
  {
    title: "UI/UX Design Intern",
    company: "Nimbus Labs",
    type: "Internship",
    location: "Colombo 03, Sri Lanka",
    deadline: new Date("2026-04-10"),
    postedDate: "21 Mar 2026",
    category: "Design / Product",
    workMode: "On-site",
    experience: "0 - 1 year",
    qualification: "Design, IT, HCI, or related field",
    sideSummary: "Strong visual thinking, wireframing ability, user-centered design awareness.",
    overview: "Nimbus Labs is looking for a creative UI/UX Design Intern to support product design for student-facing platforms.",
    description: "Support product design for web platforms. Work with product and development teams.",
    responsibilities: [
      "Design user flows, wireframes, and high-fidelity UI screens.",
      "Support usability improvements.",
      "Collaborate with developers for design consistency.",
    ],
    requirements: [
      "Pursuing degree in Design, IT, or related field.",
      "Basic understanding of UI/UX principles.",
      "Familiarity with Figma or Adobe XD.",
    ],
    skills: ["UI Design", "UX Thinking", "Wireframing", "Figma"],
    screeningQuestions: [
      { id: "q1", type: "textarea", question: "What is the difference between UI and UX design?" },
      { id: "q2", type: "select", question: "Which tool are you most comfortable with?", options: ["Figma", "Adobe XD", "Sketch", "Other"] },
    ],
  },
  {
    title: "Junior Frontend Developer",
    company: "Vertex Digital",
    type: "Graduate Role",
    location: "Colombo 07, Sri Lanka",
    deadline: new Date("2026-04-05"),
    postedDate: "22 Mar 2026",
    category: "Software Engineering",
    workMode: "Hybrid",
    experience: "Fresh Graduate",
    qualification: "Degree in IT / SE / CS",
    sideSummary: "Solid React, JavaScript, responsive UI, and component-based development fundamentals.",
    overview: "Vertex Digital is hiring a Junior Frontend Developer to build responsive web interfaces.",
    description: "Build responsive, modern web interfaces for digital products using React.",
    responsibilities: [
      "Develop responsive UIs using React and modern CSS.",
      "Translate UI designs into reusable frontend components.",
      "Work with APIs and display data in user-friendly formats.",
    ],
    requirements: [
      "Degree in IT, Software Engineering, or CS.",
      "Strong understanding of HTML, CSS, JavaScript, and React.",
      "Awareness of responsive design.",
    ],
    skills: ["React", "JavaScript", "Responsive Design", "APIs"],
    screeningQuestions: [
      { id: "q1", type: "textarea", question: "Explain the difference between props and state in React." },
      { id: "q2", type: "select", question: "Which HTML element is best for site navigation?", options: ["div", "span", "nav", "section"] },
    ],
  },
  {
    title: "Data Analyst Intern",
    company: "BlueOrbit Analytics",
    type: "Internship",
    location: "Kandy, Sri Lanka",
    deadline: new Date("2026-04-15"),
    postedDate: "20 Mar 2026",
    category: "Data / Analytics",
    workMode: "Hybrid",
    experience: "Trainee / Entry Level",
    qualification: "Statistics, IT, Data Science, or related",
    sideSummary: "Analytical thinking, spreadsheet confidence, reporting awareness.",
    overview: "BlueOrbit Analytics is seeking a Data Analyst Intern for hands-on exposure to dashboards and reporting.",
    description: "Work with data-driven decision making, spreadsheets, data cleaning, and dashboards.",
    responsibilities: [
      "Clean, organize, and validate datasets.",
      "Assist in preparing weekly and monthly reports.",
      "Support dashboard updates and KPI tracking.",
    ],
    requirements: [
      "Pursuing degree in Data Science, Statistics, or related field.",
      "Comfortable with Excel or Google Sheets.",
      "Strong attention to detail.",
    ],
    skills: ["Excel", "Analysis", "Reporting", "Data Cleaning"],
    screeningQuestions: [
      { id: "q1", type: "textarea", question: "What is the difference between data cleaning and data analysis?" },
      { id: "q2", type: "select", question: "Which chart is best for monthly trends?", options: ["Pie chart", "Line chart", "Scatter chart", "Radar chart"] },
    ],
  },
  {
    title: "Marketing Coordinator",
    company: "ElevateX Solutions",
    type: "Entry Level",
    location: "Colombo 05, Sri Lanka",
    deadline: new Date("2026-04-02"),
    postedDate: "23 Mar 2026",
    category: "Marketing",
    workMode: "On-site",
    experience: "Entry Level",
    qualification: "Marketing, Management, Business, or related",
    sideSummary: "Campaign coordination, communication strength, digital marketing basics.",
    overview: "ElevateX Solutions is looking for a proactive Marketing Coordinator.",
    description: "Support campaign planning, content coordination, and brand execution.",
    responsibilities: [
      "Assist in planning digital marketing campaigns.",
      "Track campaign progress and performance metrics.",
      "Coordinate with designers and content creators.",
    ],
    requirements: [
      "Degree in Marketing, Business, or Communication.",
      "Basic digital marketing knowledge.",
      "Strong communication skills.",
    ],
    skills: ["Campaigns", "Coordination", "Digital Marketing", "Communication"],
    screeningQuestions: [
      { id: "q1", type: "textarea", question: "What is the main objective of a digital marketing campaign?" },
      { id: "q2", type: "select", question: "Which metric measures email engagement?", options: ["Open rate", "CPU usage", "File size", "Database rows"] },
    ],
  },
  {
    title: "Associate QA Engineer",
    company: "CloudNest Tech",
    type: "Graduate Role",
    location: "Malabe, Sri Lanka",
    deadline: new Date("2026-04-08"),
    postedDate: "22 Mar 2026",
    category: "Quality Assurance",
    workMode: "Hybrid",
    experience: "Fresh Graduate",
    qualification: "IT / SE / CS or related field",
    sideSummary: "Testing fundamentals, bug reporting clarity, logical thinking.",
    overview: "CloudNest Tech is looking for an Associate QA Engineer to support product quality.",
    description: "Support product quality through structured testing and defect reporting.",
    responsibilities: [
      "Execute test cases for web applications.",
      "Identify, document, and track defects.",
      "Validate fixes and perform regression checks.",
    ],
    requirements: [
      "Degree in IT or Software Engineering.",
      "Understanding of software testing concepts.",
      "Attention to detail.",
    ],
    skills: ["Manual Testing", "Bug Reporting", "Regression Testing", "Quality"],
    screeningQuestions: [
      { id: "q1", type: "textarea", question: "What is the difference between a bug, an error, and a defect?" },
      { id: "q2", type: "select", question: "What is regression testing for?", options: ["Checking existing features after changes", "Creating tables", "Improving logos", "Writing code"] },
    ],
  },
  {
    title: "Cyber Security Intern",
    company: "CoreGrid Systems",
    type: "Internship",
    location: "Colombo 04, Sri Lanka",
    deadline: new Date("2026-04-01"),
    postedDate: "23 Mar 2026",
    category: "Cyber Security",
    workMode: "Hybrid",
    experience: "Trainee / Entry Level",
    qualification: "IT, CS, Cyber Security or related",
    sideSummary: "Security awareness, risk thinking, basic threat knowledge.",
    overview: "CoreGrid Systems is seeking a Cyber Security Intern for security awareness and monitoring.",
    description: "Support security awareness, vulnerability review, and process documentation.",
    responsibilities: [
      "Assist in basic security checks.",
      "Support review of security alerts.",
      "Help maintain security-related records.",
    ],
    requirements: [
      "Pursuing degree in IT, CS, or Cyber Security.",
      "Basic understanding of cyber security principles.",
      "Analytical thinking and careful attention to detail.",
    ],
    skills: ["Security Basics", "Awareness", "Risk Thinking", "Documentation"],
    screeningQuestions: [
      { id: "q1", type: "textarea", question: "What is phishing and how would you identify a suspicious email?" },
      { id: "q2", type: "select", question: "Which is a common cyber security risk?", options: ["Weak passwords", "Proper backups", "Regular updates", "Access controls"] },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Seed admin user if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    let adminId;
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@unibridge.com',
        passwordHash,
        role: 'admin',
      });
      adminId = admin._id;
      console.log('Admin user created: admin@unibridge.com / admin123');
    } else {
      adminId = adminExists._id;
      console.log('Admin user already exists');
    }

    // Seed portal jobs
    const existingJobCount = await Job.countDocuments();
    if (existingJobCount === 0) {
      const jobsWithCategory = portalJobs.map(job => ({
        ...job,
        employerId: adminId,
        employerName: 'Admin',
        applyLink: '',
        status: 'OPEN',
        portalCategory: mapJobToPortalCategory(job),
      }));
      await Job.insertMany(jobsWithCategory);
      console.log(`${jobsWithCategory.length} portal jobs seeded`);
    } else {
      console.log(`Skipped job seeding — ${existingJobCount} jobs already exist`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
