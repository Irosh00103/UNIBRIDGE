import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Context
import { JobsProvider } from './context/JobsContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import BrowseStudyMaterials from './pages/student/BrowseStudyMaterials';
import ManageStudyMaterialsPage from './pages/student/ManageStudyMaterialsPage';
import ManageModulesPage from './pages/student/ManageModulesPage';
import SubmitStudyMaterialPage from './pages/student/SubmitStudyMaterialPage';
import Kuppi from './pages/student/Kuppi';
import CreateJob from './pages/employer/CreateJob';
import ViewApplicants from './pages/employer/ViewApplicants';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import ViewStudentProfile from './pages/employer/ViewStudentProfile';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import ProfessionalProfile from './pages/student/ProfessionalProfile';
import AlertsPage from './pages/AlertsPage';
import StructuredStudyMaterialsPage from './pages/StructuredStudyMaterialsPage';

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
        
        {/* Job Portal Routes Additive Layer - Restricted to Students Only as requested */}
        <Route path="/job-portal/*" element={
          <ProtectedRoute role="student">
            <JobsProvider>
              <>
                <Routes>
                  <Route path="/" element={<JobPortal />} />
                  <Route path="all" element={<JobPortalAll />} />
                  <Route path="categories/:slug" element={<JobPortalCategory />} />
                  <Route path="jobs/:id" element={<JobPortalDetail />} />
                  <Route path="saved" element={<JobPortalSaved />} />
                  <Route path="applications" element={<JobPortalApplications />} />
                </Routes>
                <Footer />
              </>
            </JobsProvider>
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute role="student">
            <JobsProvider>
              <Routes>
                <Route path="home" element={<StudentHome />} />
                <Route path="materials" element={<Materials />} />
                <Route path="materials/browse" element={<BrowseStudyMaterials />} />
                <Route path="materials/structured" element={<StructuredStudyMaterialsPage />} />
                <Route path="materials/submit" element={<SubmitStudyMaterialPage />} />
                <Route path="kuppi" element={<Kuppi />} />
                
                {/* Legacy Job Routes -> Redirect to Job Portal */}
                <Route path="jobs" element={<Navigate to="/student/job-portal" replace />} />
                <Route path="jobs/:id" element={<Navigate to="/student/job-portal" replace />} />
                
                {/* Job Portal Routes */}
                <Route path="job-portal" element={<><JobPortal /><Footer /></>} />
                <Route path="job-portal/all" element={<><JobPortalAll /><Footer /></>} />
                <Route path="job-portal/categories/:slug" element={<><JobPortalCategory /><Footer /></>} />
                <Route path="job-portal/jobs/:id" element={<><JobPortalDetail /><Footer /></>} />
                <Route path="job-portal/saved" element={<><JobPortalSaved /><Footer /></>} />
                <Route path="job-portal/applications" element={<><JobPortalApplications /><Footer /></>} />
                <Route path="profile/professional" element={<><ProfessionalProfile /><Footer /></>} />
                <Route path="notifications" element={<AlertsPage />} />


                
                {/* Fallback for student sub-routes */}
                <Route path="*" element={<Navigate to="/student/home" replace />} />
              </Routes>
            </JobsProvider>
          </ProtectedRoute>
        } />
        
        {/* Employer/Admin Routes */}
        <Route path="/employer/dashboard" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
        <Route path="/employer/notifications" element={<ProtectedRoute role="employer"><AlertsPage /></ProtectedRoute>} />
        <Route path="/employer/jobs/create" element={<ProtectedRoute role="employer"><CreateJob /></ProtectedRoute>} />
        <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute role="employer"><ViewApplicants /></ProtectedRoute>} />
        <Route path="/employer/students/profile" element={<ProtectedRoute role="employer"><ViewStudentProfile /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><AdminNotificationsPage /></ProtectedRoute>} />
        <Route path="/admin/lecture-hub" element={<ProtectedRoute role="admin"><Materials /></ProtectedRoute>} />
        <Route path="/admin/lecture-hub/browse" element={<ProtectedRoute role="admin"><BrowseStudyMaterials /></ProtectedRoute>} />
        <Route path="/admin/lecture-hub/structured" element={<ProtectedRoute role="admin"><StructuredStudyMaterialsPage /></ProtectedRoute>} />
        <Route path="/admin/lecture-hub/manage" element={<ProtectedRoute role="admin"><ManageStudyMaterialsPage /></ProtectedRoute>} />
        <Route path="/admin/lecture-hub/modules" element={<ProtectedRoute role="admin"><ManageModulesPage /></ProtectedRoute>} />
        <Route path="/admin/lecture-hub/upload" element={<ProtectedRoute role="admin"><UploadMaterial /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
