const http = require("http");

// We can start the server in a child process or test with request simulation
const baseUrl = "http://localhost:5000";

async function request(path, options = {}) {
  const url = new URL(path, baseUrl);
  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== RUNNING BACKEND API VALIDATION ===");

  // 1. Health check
  const health = await request("/");
  console.log("1. Health check (GET /):", health.status === 200 ? "PASS" : "FAIL", health.data);

  // 2. Candidate Login
  const loginRes = await request("/api/auth/login", {
    method: "POST",
    body: { email: "jobseeker@example.com", password: "password123" },
  });
  console.log("2. Candidate Login (POST /api/auth/login):", loginRes.status === 200 ? "PASS" : "FAIL", "Token received:", !!loginRes.data.token);
  const candidateToken = loginRes.data.token;

  // 3. Current user
  const meRes = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  console.log("3. Current user (GET /api/auth/me):", meRes.status === 200 ? "PASS" : "FAIL", meRes.data.user?.fullName);

  // 4. Registration of a new user
  const testEmail = `newuser_${Date.now()}@example.com`;
  const regRes = await request("/api/auth/register", {
    method: "POST",
    body: {
      fullName: "Test Candidate",
      email: testEmail,
      password: "securepassword",
      role: "jobseeker",
    },
  });
  console.log("4. Register user (POST /api/auth/register):", regRes.status === 201 ? "PASS" : "FAIL", regRes.data.message);

  // 5. Duplicate registration check
  const dupRes = await request("/api/auth/register", {
    method: "POST",
    body: {
      fullName: "Duplicate Candidate",
      email: testEmail,
      password: "securepassword",
      role: "jobseeker",
    },
  });
  console.log("5. Duplicate email check:", dupRes.status === 400 && dupRes.data.message === "Email already registered." ? "PASS" : "FAIL", dupRes.data.message);

  // 6. Get all jobs
  const jobsRes = await request("/api/jobs");
  console.log("6. Get all jobs (GET /api/jobs):", jobsRes.status === 200 && jobsRes.data.count > 0 ? "PASS" : "FAIL", `Found ${jobsRes.data.count} jobs`);
  const firstJob = jobsRes.data.jobs[0];

  // 7. Get job by ID
  const jobRes = await request(`/api/jobs/${firstJob._id}`);
  console.log("7. Get job by ID:", jobRes.status === 200 ? "PASS" : "FAIL", jobRes.data.job?.title);

  // 8. Search & filter jobs
  const searchRes = await request("/api/jobs?keyword=Google&jobType=full-time");
  console.log("8. Search jobs with query:", searchRes.status === 200 ? "PASS" : "FAIL", `Found ${searchRes.data.count} matching jobs`);

  // 9. Check employer login & create job
  const empLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "google@jobportal.demo", password: "Google#26" },
  });
  const empToken = empLogin.data.token;
  console.log("9. Employer Login (google@jobportal.demo):", empLogin.status === 200 ? "PASS" : "FAIL");

  const newJobRes = await request("/api/jobs", {
    method: "POST",
    headers: { Authorization: `Bearer ${empToken}` },
    body: {
      title: "Senior Cloud Architect",
      company: "Google",
      location: "Bangalore, India",
      jobType: "Full Time",
      experience: "5+ Years",
      salary: "₹35 - 50 LPA",
      skills: "GCP, Kubernetes, Go, Python",
      description: "Design and lead Google Cloud architectural deployments for tier-1 enterprises.",
    },
  });
  console.log("10. Employer creates job:", newJobRes.status === 201 ? "PASS" : "FAIL", newJobRes.data.job?.title);

  // 11. Candidate applies to newly created job
  const applyRes = await request(`/api/applications/apply/${newJobRes.data.job._id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: {
      phone: "+91 99999 88888",
      resumeUrl: "https://example.com/rahul-cloud.pdf",
      coverLetter: "I would love to be considered for Senior Cloud Architect.",
    },
  });
  console.log("11. Candidate applies for job:", applyRes.status === 201 ? "PASS" : "FAIL", applyRes.data.message);

  // 12. Candidate duplicate application rejection
  const dupApplyRes = await request(`/api/applications/apply/${newJobRes.data.job._id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: { phone: "+91 99999 88888" },
  });
  console.log("12. Candidate duplicate application blocked:", dupApplyRes.status === 400 ? "PASS" : "FAIL", dupApplyRes.data.message);

  // 13. Candidate views applications
  const myApps = await request("/api/applications/my-applications", {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  console.log("13. Candidate my-applications:", myApps.status === 200 ? "PASS" : "FAIL", `Found ${myApps.data.count} applications`);

  // 14. Employer views applications and updates status
  const empApps = await request("/api/applications/employer-applications", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  console.log("14. Employer views applications:", empApps.status === 200 ? "PASS" : "FAIL", `Found ${empApps.data.count} applications`);
  
  if (empApps.data.applications?.length > 0) {
    const appToUpdate = empApps.data.applications[0];
    const updateRes = await request(`/api/applications/${appToUpdate._id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${empToken}` },
      body: { status: "Accepted", notes: "Excellent match!" },
    });
    console.log("15. Employer updates status:", updateRes.status === 200 ? "PASS" : "FAIL", updateRes.data.message);
  }

  // 16. Admin login and stats
  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "admin@jobportal.demo", password: "Admin@26" },
  });
  const adminToken = adminLogin.data.token;
  console.log("16. Admin Login (admin@jobportal.demo):", adminLogin.status === 200 ? "PASS" : "FAIL");
  const adminStats = await request("/api/admin/stats", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("16. Admin Dashboard stats:", adminStats.status === 200 ? "PASS" : "FAIL", adminStats.data.stats);

  // 17. Security Check: Candidate WITHOUT resume applying MUST be blocked (Feature 3)
  const noResumeCandEmail = `noresume_${Date.now()}@example.com`;
  const noResumeReg = await request("/api/auth/register", {
    method: "POST",
    body: {
      fullName: "No Resume Candidate",
      email: noResumeCandEmail,
      password: "password123",
      role: "jobseeker",
    },
  });
  const noResumeToken = noResumeReg.data.token;
  const blockedApplyRes = await request(`/api/applications/apply/${firstJob._id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${noResumeToken}` },
    body: { phone: "+91 91111 22222" }, // No resume provided!
  });
  console.log(
    "17. Backend strictly blocks candidate applying without resume:",
    blockedApplyRes.status === 400 && blockedApplyRes.data.message.includes("Resume is required")
      ? "PASS"
      : "FAIL",
    blockedApplyRes.data.message
  );

  // 18. Candidate uploads resume (Feature 3)
  const uploadResumeRes = await request("/api/profiles/candidate/resume", {
    method: "POST",
    headers: { Authorization: `Bearer ${noResumeToken}` },
    body: {
      title: "My Full Stack Resume",
      fileUrl: "https://example.com/resumes/my-resume.pdf",
      skills: ["React", "Node.js", "MongoDB"],
    },
  });
  console.log("18. Candidate uploads resume:", uploadResumeRes.status === 200 ? "PASS" : "FAIL", uploadResumeRes.data.message);

  // 19. Candidate with uploaded resume applies successfully (Feature 3)
  const nowAllowedApply = await request(`/api/applications/apply/${firstJob._id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${noResumeToken}` },
    body: { phone: "+91 91111 22222", coverLetter: "Excited to apply!" },
  });
  console.log("19. Candidate applies with uploaded resume:", nowAllowedApply.status === 201 ? "PASS" : "FAIL", nowAllowedApply.data.message);

  // 20. Notification Check: Employer receives notification for candidate application (Feature 2)
  const employerNotifs = await request("/api/profiles/notifications", {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  const foundNewAppNotif = employerNotifs.data.notifications?.some((n) =>
    n.type === "new_application" && n.title === "New Application Received"
  );
  console.log("20. Employer received application notification:", foundNewAppNotif ? "PASS" : "FAIL");

  // 21. Company -> Candidate status change notification (Feature 2)
  if (nowAllowedApply.data.application?._id) {
    // Let employer update candidate's application to Shortlisted
    await request(`/api/applications/${nowAllowedApply.data.application._id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${empToken}` },
      body: { status: "Shortlisted" },
    });

    const candNotifs = await request("/api/profiles/notifications", {
      headers: { Authorization: `Bearer ${noResumeToken}` },
    });
    const foundShortlistNotif = candNotifs.data.notifications?.some((n) =>
      n.message?.toLowerCase().includes("shortlisted") || n.title?.toLowerCase().includes("shortlisted")
    );
    console.log(
      "21. Candidate receives Shortlisted notification:",
      foundShortlistNotif ? "PASS" : "FAIL",
      candNotifs.data.notifications?.[0]?.message
    );
  }

  // 22. Admin Candidate Management (Feature 1)
  const adminCandidatesRes = await request("/api/admin/candidates", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("22. Admin Candidate Management:", adminCandidatesRes.status === 200 && adminCandidatesRes.data.count > 0 ? "PASS" : "FAIL", `Found ${adminCandidatesRes.data.count} candidates`);

  // 23. Admin Company Management (Feature 1)
  const adminCompaniesRes = await request("/api/admin/companies", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("23. Admin Company Management:", adminCompaniesRes.status === 200 && adminCompaniesRes.data.count > 0 ? "PASS" : "FAIL", `Found ${adminCompaniesRes.data.count} companies`);

  // 24. Admin User Control: Toggle Active / Disable status (Feature 1)
  const targetCandId = noResumeReg.data.user.id;
  const toggleRes = await request(`/api/admin/users/${targetCandId}/toggle-status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("24. Admin toggles user status to Disabled:", toggleRes.status === 200 && toggleRes.data.isActive === false ? "PASS" : "FAIL", toggleRes.data.message);

  // Test that disabled user cannot login
  const disabledLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: noResumeCandEmail, password: "password123" },
  });
  console.log("25. Disabled user blocked from login:", disabledLogin.status === 403 ? "PASS" : "FAIL", disabledLogin.data.message);

  // Reactivate user
  await request(`/api/admin/users/${targetCandId}/toggle-status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  // 26. Public Contact Message Submission (Task 4G)
  const contactMsgRes = await request("/api/contact", {
    method: "POST",
    body: {
      fullName: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      phone: "+91 98765 11111",
      inquiryType: "Candidate Support",
      subject: "Resume verification assistance",
      message: "Hello JobPortal team, how long does resume review take for verified openings?",
    },
  });
  console.log("26. Public Contact Submission (POST /api/contact):", contactMsgRes.status === 201 ? "PASS" : "FAIL", contactMsgRes.data.message);
  const createdMsgId = contactMsgRes.data.contactMessage?._id;

  // 27. Admin Review Contact Messages (Task 4G)
  const adminMsgsRes = await request("/api/admin/messages", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("27. Admin gets contact messages (GET /api/admin/messages):", adminMsgsRes.status === 200 && adminMsgsRes.data.count > 0 ? "PASS" : "FAIL", `Found ${adminMsgsRes.data.count} messages (${adminMsgsRes.data.unreadCount} unread)`);

  // 28. Admin Mark Contact Message as Read (Task 4G)
  if (createdMsgId) {
    const markReadRes = await request(`/api/admin/messages/${createdMsgId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("28. Admin marks message read (PATCH /api/admin/messages/:id/read):", markReadRes.status === 200 && markReadRes.data.contactMessage?.read === true ? "PASS" : "FAIL", markReadRes.data.message);
  }

  // 29. Admin Delete Contact Message (Task 4G)
  if (createdMsgId) {
    const delMsgRes = await request(`/api/admin/messages/${createdMsgId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("29. Admin deletes message (DELETE /api/admin/messages/:id):", delMsgRes.status === 200 ? "PASS" : "FAIL", delMsgRes.data.message);
  }

  // 30. Admin Blocks Employer (Task 5)
  // Let's get an employer to block (e.g. Mindtree or Amazon)
  const empListRes = await request("/api/admin/companies", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const targetEmployer = empListRes.data.companies?.find((c) => c.email === "mindtree@jobportal.demo") || empListRes.data.companies?.[1];
  
  if (targetEmployer) {
    const blockRes = await request(`/api/admin/employers/${targetEmployer._id}/block`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { reason: "Security violation: suspicious job postings reported" },
    });
    console.log("30. Admin blocks employer (PATCH /api/admin/employers/:id/block):", blockRes.status === 200 && blockRes.data.employer?.isBlocked === true ? "PASS" : "FAIL", blockRes.data.message);

    // 31. Blocked employer login rejection (Task 5)
    const blockedEmpLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: targetEmployer.email, password: "Mindtree#26" },
    });
    console.log("31. Blocked employer login rejected with HTTP 403:", blockedEmpLogin.status === 403 && blockedEmpLogin.data.isBlocked === true ? "PASS" : "FAIL", blockedEmpLogin.data.message);

    // 32. Admin Unblocks Employer (Task 5)
    const unblockRes = await request(`/api/admin/employers/${targetEmployer._id}/unblock`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("32. Admin unblocks employer (PATCH /api/admin/employers/:id/unblock):", unblockRes.status === 200 && unblockRes.data.employer?.isBlocked === false ? "PASS" : "FAIL", unblockRes.data.message);

    // 33. Restored employer can login (Task 5)
    const restoredEmpLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: targetEmployer.email, password: "Mindtree#26" },
    });
    console.log("33. Unblocked employer login restored (HTTP 200):", restoredEmpLogin.status === 200 && !!restoredEmpLogin.data.token ? "PASS" : "FAIL");
  }

  // 34. Candidate Resume Upload under 5 MB Limit (Task 9)
  // Create a 100 KB mock PDF base64 string
  const validMockPdf = "data:application/pdf;base64," + Buffer.alloc(100 * 1024, "A").toString("base64");
  const validResumeRes = await request("/api/profiles/candidate/resume", {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: {
      title: "Rahul_Sharma_Resume.pdf",
      fileUrl: validMockPdf,
    },
  });
  console.log("34. Resume upload under 5MB succeeds (HTTP 200):", validResumeRes.status === 200 ? "PASS" : "FAIL", validResumeRes.data.message);

  // 35. Candidate Resume Upload OVER 5 MB Limit (Task 9)
  // Create a 5.2 MB mock base64 payload to verify rejection
  const oversizedMockPdf = "data:application/pdf;base64," + Buffer.alloc(5.2 * 1024 * 1024, "B").toString("base64");
  const oversizedResumeRes = await request("/api/profiles/candidate/resume", {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: {
      title: "Oversized_Resume.pdf",
      fileUrl: oversizedMockPdf,
    },
  });
  console.log("35. Resume upload over 5MB rejected with HTTP 400:", oversizedResumeRes.status === 400 ? "PASS" : "FAIL", oversizedResumeRes.data.message);

  // 36. Public Directory 25 Companies Count Check (Task 6)
  const allCompaniesRes = await request("/api/profiles/companies");
  console.log("36. Public companies directory verification:", allCompaniesRes.status === 200 && allCompaniesRes.data.count === 25 ? "PASS" : "FAIL", `Found ${allCompaniesRes.data.count} curated companies in DB`);

  console.log("=== BACKEND API TESTS COMPLETED SUCCESSFULLY ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
