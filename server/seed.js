const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Material = require('./models/Material');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Kuppi = require('./models/Kuppi');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        await User.deleteMany({});
        await Material.deleteMany({});
        await Job.deleteMany({});
        await Application.deleteMany({});
        await Kuppi.deleteMany({});

        const studentPassword = await bcrypt.hash('test123', 10);
        const employerPassword = await bcrypt.hash('test123', 10);

        const student = await User.create({
            name: "Alice Student",
            email: "student@test.com",
            passwordHash: studentPassword,
            role: "student"
        });

        const employer = await User.create({
            name: "Bob Employer",
            email: "employer@test.com",
            passwordHash: employerPassword,
            role: "employer"
        });

        await Material.create([
            {
                studentId: student._id,
                studentName: student.name,
                title: "Data Structures Lecture Notes",
                module: "IT2050",
                type: "PDF",
                link: "https://drive.google.com/file/example1"
            },
            {
                studentId: student._id,
                studentName: student.name,
                title: "React Complete Guide Slides",
                module: "IT3040",
                type: "PPT",
                link: "https://drive.google.com/file/example2"
            }
        ]);

        const jobs = await Job.create([
            {
                employerId: employer._id,
                employerName: employer.name,
                title: "Junior Software Engineer",
                description: "Looking for a passionate junior developer to join our team. Experience in React or Node.js preferred.",
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                employerId: employer._id,
                employerName: employer.name,
                title: "UI/UX Design Intern",
                description: "We need a creative intern for 6 months to work on mobile and web interfaces.",
                deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            }
        ]);

        await Application.create({
            studentId: student._id,
            studentName: student.name,
            studentEmail: student.email,
            jobId: jobs[0]._id,
            cvLink: "https://drive.google.com/cv-alice",
            note: "Looking forward to this!"
        });

        await Kuppi.create([
            {
                studentId: student._id,
                studentName: student.name,
                title: "Database Exam Prep",
                module: "IT2030",
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                description: "Covering ER diagrams and SQL joins"
            },
            {
                studentId: student._id,
                studentName: student.name,
                title: "React Hooks Deep Dive",
                module: "IT3040",
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                description: "useState, useEffect, useContext explained"
            }
        ]);

        console.log("✅ Database seeded successfully!");
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();
