const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, default: '' },
  
  // Enhanced Profile Fields
  isAvailable: { type: Boolean, default: false },
  profileHeadline: { type: String, default: '' },
  
  // Academic Profile
  university: { type: String, default: '' },
  degree: { type: String, default: '' },
  year: { type: String, default: '' },
  department: { type: String, default: '' },
  
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  
  targetJob: {
    title: String,
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract', ''] },
    location: String,
    expectedSalary: String
  },
  
  workExperience: [{
    company: String,
    role: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  
  skills: [{ type: String }],
  
  languages: [{
    language: String,
    proficiency: { type: String, enum: ['Elementary', 'Limited Working', 'Professional Working', 'Full Professional', 'Native/Bilingual', ''] }
  }],
  
  otherAssets: [{
    type: { type: String }, // e.g., 'Portfolio', 'GitHub', 'LinkedIn'
    url: String,
    description: String
  }],
  
  bio: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  
  certifications: [{
    name: String,
    issuer: String,
    date: Date
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
