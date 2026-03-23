const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Material = require('./models/Material');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Kuppi = require('./models/Kuppi');

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany();
    await Material.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Kuppi.deleteMany();

    const studentPassword = await bcrypt.hash('test123', 10);
    const employerPassword = await bcrypt.hash('test123', 10);

    const alice = await User.create({
      name: 'Alice Student',
      email: 'student@test.com',
      passwordHash: studentPassword,
      role: 'student',
    });
    const bob = await User.create({
      name: 'Bob Employer',
      email: 'employer@test.com',
      passwordHash: employerPassword,
      role: 'employer',
    });

    const material1 = await Material.create({
      studentId: alice._id,
      studentName: alice.name,
      title: 'CS101 Lecture 1 Notes',
      module: 'CS101',
      type: 'PDF',
      link: 'http://example.com/cs101-lecture1.pdf',
    });
    const material2 = await Material.create({
      studentId: alice._id,
      studentName: alice.name,
      title: 'CS102 Slides',
      module: 'CS102',
      type: 'PPT',
      link: 'http://example.com/cs102-slides.ppt',
    });

    const job1 = await Job.create({
      employerId: bob._id,
      employerName: bob.name,
      title: 'Software Intern',
      description: 'Work on real projects.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    const job2 = await Job.create({
      employerId: bob._id,
      employerName: bob.name,
      title: 'Research Assistant',
      description: 'Assist in research.',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      studentId: alice._id,
      studentName: alice.name,
      studentEmail: alice.email,
      jobId: job1._id,
      cvLink: 'http://example.com/alice-cv.pdf',
      note: 'Looking forward to this!',
    });

    await Kuppi.create({
      studentId: alice._id,
      studentName: alice.name,
      title: 'Math Revision',
      module: 'MATH101',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      description: 'Group study for midterms.',
    });
    await Kuppi.create({
      studentId: alice._id,
      studentName: alice.name,
      title: 'Physics Q&A',
      module: 'PHYS201',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description: 'Peer learning session.',
    });

    console.log('Seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
