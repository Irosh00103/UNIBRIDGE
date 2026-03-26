import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { JobsProvider } from './context/JobsContext';

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
import Kuppi from './pages/student/Kuppi';
import CreateJob from './pages/employer/CreateJob';
import ViewApplicants from './pages/employer/ViewApplicants';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

// Job Portal Pages
import JobPortal from './pages/student/JobPortal';
import JobPortalAll from './pages/student/JobPortalAll';
import JobPortalCategory from './pages/student/JobPortalCategory';
import JobPortalDetail from './pages/student/JobPortalDetail';
import JobPortalSaved from './pages/student/JobPortalSaved';
import JobPortalApplications from './pages/student/JobPortalApplications';



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
        <Route path="/student/*" element={
          <ProtectedRoute role="student">
            <JobsProvider>
              <Routes>
                <Route path="home" element={<StudentHome />} />
                <Route path="materials" element={<Materials />} />
                <Route path="materials/upload" element={<UploadMaterial />} />
                <Route path="kuppi" element={<Kuppi />} />
                
                {/* Legacy Job Routes -> Redirect to Job Portal */}
                <Route path="jobs" element={<Navigate to="/student/job-portal" replace />} />
                <Route path="jobs/:id" element={<Navigate to="/student/job-portal" replace />} />
                
                {/* Job Portal Routes */}
                <Route path="job-portal" element={<JobPortal />} />
                <Route path="job-portal/all" element={<JobPortalAll />} />
                <Route path="job-portal/categories/:slug" element={<JobPortalCategory />} />
                <Route path="job-portal/jobs/:id" element={<JobPortalDetail />} />
                <Route path="job-portal/saved" element={<JobPortalSaved />} />
                <Route path="job-portal/applications" element={<JobPortalApplications />} />


                
                {/* Fallback for student sub-routes */}
                <Route path="*" element={<Navigate to="/student/home" replace />} />
              </Routes>
            </JobsProvider>
          </ProtectedRoute>
        } />
        
        {/* Employer/Admin Routes */}
        <Route path="/employer/dashboard" element={<ProtectedRoute role={['admin', 'employer']}><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/employer/jobs/create" element={<ProtectedRoute role={['admin', 'employer']}><CreateJob /></ProtectedRoute>} />
        <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute role={['admin', 'employer']}><ViewApplicants /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
