import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/landing/Home";
import Jobs from "./pages/jobs/Jobs";
import JobDetails from "./pages/job-details/JobDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Companies from "./pages/companies/Companies";
import CompanyDetails from "./pages/company-details/CompanyDetails";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;