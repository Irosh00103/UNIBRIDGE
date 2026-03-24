import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
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

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student/home" element={<ProtectedRoute role="student"><StudentHome /></ProtectedRoute>} />
        <Route path="/student/materials" element={<ProtectedRoute role="student"><Materials /></ProtectedRoute>} />
        <Route path="/student/materials/upload" element={<ProtectedRoute role="student"><UploadMaterial /></ProtectedRoute>} />
        <Route path="/student/jobs" element={<ProtectedRoute role="student"><Jobs /></ProtectedRoute>} />
        <Route path="/student/jobs/:id" element={<ProtectedRoute role="student"><JobDetails /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute role="student"><MyApplications /></ProtectedRoute>} />
        <Route path="/student/kuppi" element={<ProtectedRoute role="student"><Kuppi /></ProtectedRoute>} />
        
        {/* Employer Routes */}
        <Route path="/employer/dashboard" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/employer/jobs/create" element={<ProtectedRoute role="employer"><CreateJob /></ProtectedRoute>} />
        <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute role="employer"><ViewApplicants /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
