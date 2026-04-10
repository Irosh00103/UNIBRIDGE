const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/materials');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const kuppiRoutes = require('./routes/kuppi');
const notificationRoutes = require('./routes/notifications');
const moduleRoutes = require('./routes/modules');

const userRoutes = require('./routes/users');

const adminRoutes = require('./routes/admin');
const savedJobRoutes = require('./routes/savedJobs');
const uniAuthRoutes = require('./routes/uniAuth');
const uniEmployerRoutes = require('./routes/uniEmployers');
const uniStudentRoutes = require('./routes/uniStudents');
const uniJobRoutes = require('./routes/uniJobs');
const uniApplicationRoutes = require('./routes/uniApplications');
const uniNotificationRoutes = require('./routes/uniNotifications');

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/kuppi', kuppiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/modules', moduleRoutes);

app.use('/api/users', userRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/uni/auth', uniAuthRoutes);
app.use('/api/uni/employers', uniEmployerRoutes);
app.use('/api/uni/students', uniStudentRoutes);
app.use('/api/uni/jobs', uniJobRoutes);
app.use('/api/uni/applications', uniApplicationRoutes);
app.use('/api/uni/notifications', uniNotificationRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
