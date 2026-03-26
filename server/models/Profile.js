const mongoose = require('mongoose');

const workExperienceSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, default: '' },
    companyName: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    level: { type: String, default: '' },
    institution: { type: String, default: '' },
    fromDate: { type: String, default: '' },
    toDate: { type: String, default: '' },
    currentlyStudying: { type: Boolean, default: false },
    projectsInvolved: { type: String, default: '' },
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    birthDate: { type: String, default: '' },
    currentPosition: { type: String, default: '' },
    gender: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    profilePictureName: { type: String, default: '' },
    targetJob: {
      jobTitle: { type: String, default: '' },
      desiredLocation: { type: String, default: '' },
      contractType: { type: String, default: '' },
      remoteWork: { type: String, default: '' },
      experienceLevel: { type: String, default: '' },
      minimumSalary: { type: String, default: '' },
      currency: { type: String, default: 'LKR' },
      summary: { type: String, default: '' },
    },
    workExperiences: { type: [workExperienceSchema], default: [] },
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    educationItems: { type: [educationSchema], default: [] },
    otherAssets: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
