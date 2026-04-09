const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  birthDate: { type: String, default: '' },
  currentPosition: { type: String, default: '' },
  gender: { type: String, default: '' },
  profilePicture: { type: String, default: null }, // Base64 or URL
  profilePictureName: { type: String, default: '' },
  
  // Enhanced Profile completion fields
  isAvailable: { type: Boolean, default: false },
  
  targetJob: {
    jobTitle: { type: String, default: '' },
    desiredLocation: { type: String, default: '' },
    contractType: { type: String, default: '' },
    remoteWork: { type: String, default: '' },
    experienceLevel: { type: String, default: '' },
    minimumSalary: { type: String, default: '' },
    currency: { type: String, default: 'LKR' },
    summary: { type: String, default: '' }
  },

  workExperiences: [{
    id: { type: String },
    jobTitle: { type: String, default: '' },
    companyName: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String, default: '' }
  }],

  skills: [{ type: String }],
  
  languages: [{ type: String }],

  educationItems: [{
    id: { type: String },
    title: { type: String, default: '' },
    level: { type: String, default: '' },
    institution: { type: String, default: '' },
    fromDate: { type: String, default: '' },
    toDate: { type: String, default: '' },
    currentlyStudying: { type: Boolean, default: false },
    projectsInvolved: { type: String, default: '' }
  }],

  otherAssets: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
