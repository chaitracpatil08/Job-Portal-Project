import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/landing/Home";
import Jobs from "./pages/jobs/jobs";
import JobDetails from "./pages/job-details/JobDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Companies from "./pages/companies/Companies";
import CompanyDetails from "./pages/company-details/CompanyDetails";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job-details" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/company-details" element={<CompanyDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Candidate Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["jobseeker", "candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={["jobseeker", "candidate"]}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Employer Routes */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["employer", "admin"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-job"
            element={
              <ProtectedRoute allowedRoles={["employer", "admin"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;