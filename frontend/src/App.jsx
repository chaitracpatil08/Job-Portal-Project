import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/landing/Home";
import Jobs from "./pages/jobs/Jobs";
import JobDetails from "./pages/job-details/JobDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Companies from "./pages/companies/Companies";
import CompanyDetails from "./pages/company-details/CompanyDetails";
import Dashboard from "./pages/dashboard/dashboard";
import Profile from "./pages/profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/job-details" element={<JobDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/company-details"element={<CompanyDetails />}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;