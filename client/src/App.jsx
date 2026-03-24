import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentHome from './pages/student/StudentHome';
import Materials from './pages/student/Materials';
import UploadMaterial from './pages/student/UploadMaterial';
import Jobs from './pages/student/Jobs';
import JobDetails from './pages/student/JobDetails';
import MyApplications from './pages/student/MyApplications';
import Kuppi from './pages/student/Kuppi';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import CreateJob from './pages/employer/CreateJob';
import ViewApplicants from './pages/employer/ViewApplicants';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        {/* Student Routes */}
        <Route path="/student/home" element={<ProtectedRoute role="student"><StudentHome /></ProtectedRoute>} />
        <Route path="/student/materials" element={<ProtectedRoute role="student"><Materials /></ProtectedRoute>} />
        <Route path="/student/materials/upload" element={<ProtectedRoute role="student"><UploadMaterial /></ProtectedRoute>} />
        <Route path="/student/jobs" element={<ProtectedRoute role="student"><Jobs /></ProtectedRoute>} />
        <Route path="/student/jobs/:id" element={<ProtectedRoute role="student"><JobDetails /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute role="student"><MyApplications /></ProtectedRoute>} />
        <Route path="/student/kuppi" element={<ProtectedRoute role="student"><Kuppi /></ProtectedRoute>} />
        
        {/* Employer Routes */}
        <Route path="/employer/dashboard" element={<ProtectedRoute role={['employer', 'admin']}><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/employer/jobs/create" element={<ProtectedRoute role={['employer', 'admin']}><CreateJob /></ProtectedRoute>} />
        <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute role={['employer', 'admin']}><ViewApplicants /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
