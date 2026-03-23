const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/materials');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const kuppiRoutes = require('./routes/kuppi');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/kuppi', kuppiRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

if (!process.env.MONGO_URI) {
  console.warn('MONGO_URI is not set. Server is running without MongoDB.');
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection error. Server continues without DB access:', err.message);
    });
}
