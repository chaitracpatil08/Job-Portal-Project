const http = require("http");

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

async function runValidationTests() {
  console.log("==========================================================");
  console.log("       JOB PORTAL VERIFICATION: TESTS 1 THROUGH 14         ");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;
  const testResults = [];

  function record(testNum, testName, isPass, detail) {
    if (isPass) {
      passed++;
      console.log(`[PASS] Test ${testNum}: ${testName}`);
      if (detail) console.log(`       -> ${detail}`);
    } else {
      failed++;
      console.error(`[FAIL] Test ${testNum}: ${testName}`);
      if (detail) console.error(`       -> ${detail}`);
    }
    testResults.push({ testNum, testName, isPass, detail });
  }

  // Tokens & entities used across tests
  let candidateToken = "";
  let employerToken = "";
  let adminToken = "";
  let testJobId = "";
  let testJobTitle = "";
  let testAppId = "";

  try {
    // ----------------------------------------------------
    // TEST 1: Candidate login with existing credentials
    // ----------------------------------------------------
    const t1 = await request("/api/auth/login", {
      method: "POST",
      body: { email: "jobseeker@example.com", password: "password123" },
    });
    candidateToken = t1.data?.token || "";
    record(
      1,
      "Candidate login with existing credentials",
      t1.status === 200 && Boolean(candidateToken) && t1.data.user?.role === "jobseeker",
      `Logged in as: ${t1.data?.user?.fullName} (${t1.data?.user?.email})`
    );

    // ----------------------------------------------------
    // TEST 2: Employer login with existing credentials
    // ----------------------------------------------------
    const t2 = await request("/api/auth/login", {
      method: "POST",
      body: { email: "google@jobportal.demo", password: "Google#26" },
    });
    employerToken = t2.data?.token || "";
    record(
      2,
      "Employer login with existing credentials",
      t2.status === 200 && Boolean(employerToken) && t2.data.user?.role === "employer",
      `Logged in as employer: ${t2.data?.user?.fullName} (${t2.data?.user?.email})`
    );

    // ----------------------------------------------------
    // TEST 3: Admin login with admin credentials
    // ----------------------------------------------------
    const t3 = await request("/api/auth/login", {
      method: "POST",
      body: { email: "admin@jobportal.demo", password: "Admin@26" },
    });
    adminToken = t3.data?.token || "";
    record(
      3,
      "Admin login with admin credentials",
      t3.status === 200 && Boolean(adminToken) && t3.data.user?.role === "admin",
      `Logged in as super admin: ${t3.data?.user?.fullName} (${t3.data?.user?.email})`
    );

    // ----------------------------------------------------
    // TEST 4: Candidate searches and views active jobs
    // ----------------------------------------------------
    const t4 = await request("/api/jobs");
    const activeJobsList = t4.data?.jobs || [];
    const allActive = activeJobsList.every((j) => j.status === "Active");
    record(
      4,
      "Candidate searches and views active jobs",
      t4.status === 200 && activeJobsList.length > 0 && allActive,
      `Retrieved ${activeJobsList.length} active jobs; all verify status === 'Active'`
    );

    // ----------------------------------------------------
    // TEST 5: Employer views their job listings with correct Active status
    // ----------------------------------------------------
    const t5 = await request("/api/jobs/my-jobs", {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const employerJobs = t5.data?.jobs || [];
    const firstEmpJob = employerJobs[0];
    if (firstEmpJob) {
      testJobId = firstEmpJob._id;
      testJobTitle = firstEmpJob.title;
    }
    record(
      5,
      "Employer views their job listings with correct Active status",
      t5.status === 200 && employerJobs.length > 0 && firstEmpJob.status === "Active",
      `Employer has ${employerJobs.length} posted jobs. Selected "${testJobTitle}" (${testJobId})`
    );

    // ----------------------------------------------------
    // TEST 6: Employer archives an active job
    // ----------------------------------------------------
    const t6 = await request(`/api/jobs/${testJobId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${employerToken}` },
      body: { status: "Archived" },
    });
    record(
      6,
      "Employer archives an active job (status changes to Archived)",
      t6.status === 200 && t6.data?.job?.status === "Archived",
      `Status updated to: "${t6.data?.job?.status}" | Message: "${t6.data?.message}"`
    );

    // ----------------------------------------------------
    // TEST 7: Archived job is NOT visible in candidate job search / listings
    // ----------------------------------------------------
    const t7 = await request("/api/jobs");
    const candidateJobsAfterArchive = t7.data?.jobs || [];
    const isArchivedJobPresent = candidateJobsAfterArchive.some(
      (j) => j._id.toString() === testJobId
    );
    record(
      7,
      "Archived job is NOT visible in candidate job search / listings",
      t7.status === 200 && !isArchivedJobPresent,
      `Public candidate jobs count: ${candidateJobsAfterArchive.length}; Archived job ${testJobId} is hidden: ${!isArchivedJobPresent}`
    );

    // ----------------------------------------------------
    // TEST 8: Candidate cannot apply to an archived job
    // ----------------------------------------------------
    const t8 = await request(`/api/applications/apply/${testJobId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: { phone: "+91 98450 12345", coverLetter: "Attempting apply on archived" },
    });
    record(
      8,
      "Candidate cannot apply to an archived job (proper error displayed)",
      t8.status === 400 && t8.data?.message?.includes("no longer accepting applications"),
      `HTTP status: ${t8.status} | Rejection message: "${t8.data?.message}"`
    );

    // ----------------------------------------------------
    // TEST 9: Employer activates the archived job
    // ----------------------------------------------------
    const t9 = await request(`/api/jobs/${testJobId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${employerToken}` },
      body: { status: "Active" },
    });
    record(
      9,
      "Employer activates the archived job (status returns to Active)",
      t9.status === 200 && t9.data?.job?.status === "Active",
      `Status updated to: "${t9.data?.job?.status}" | Message: "${t9.data?.message}"`
    );

    // ----------------------------------------------------
    // TEST 10: Activated job is visible to candidates again
    // ----------------------------------------------------
    const t10 = await request("/api/jobs");
    const candidateJobsAfterActivate = t10.data?.jobs || [];
    const isJobRestored = candidateJobsAfterActivate.some(
      (j) => j._id.toString() === testJobId
    );
    record(
      10,
      "Activated job is visible to candidates again",
      t10.status === 200 && isJobRestored,
      `Job "${testJobTitle}" restored to candidate listings: ${isJobRestored}`
    );

    // ----------------------------------------------------
    // TEST 11: Candidate applies to the active job
    // ----------------------------------------------------
    // Use candidate Ananya Rao who has a valid PDF resume and hasn't applied to this job yet
    const ananyaLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: "ananya.rao@jobportal.demo", password: "Ananya#2026" },
    });
    const ananyaToken = ananyaLogin.data?.token || "";

    const t11 = await request(`/api/applications/apply/${testJobId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ananyaToken}` },
      body: {
        phone: "+91 98860 23456",
        coverLetter: "Excited to apply for this engineering role!",
      },
    });
    if (t11.status === 201 && t11.data?.application?._id) {
      testAppId = t11.data.application._id;
    }
    record(
      11,
      "Candidate applies to the active job (application succeeds)",
      t11.status === 201 && Boolean(t11.data?.application),
      `Application ID: ${t11.data?.application?._id} | Status: "${t11.data?.application?.status}"`
    );

    // ----------------------------------------------------
    // TEST 12: Admin Dashboard displays correct, dynamic statistics
    // ----------------------------------------------------
    const t12 = await request("/api/admin/stats", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stats = t12.data?.stats || {};
    const hasAllStats =
      typeof stats.totalCandidates === "number" &&
      typeof stats.totalEmployers === "number" &&
      typeof stats.totalCompanies === "number" &&
      typeof stats.totalJobs === "number" &&
      typeof stats.activeJobs === "number" &&
      typeof stats.archivedJobs === "number" &&
      typeof stats.totalApplications === "number" &&
      typeof stats.blockedEmployers === "number";
    record(
      12,
      "Admin Dashboard displays correct, dynamic statistics from database",
      t12.status === 200 && hasAllStats,
      `Candidates: ${stats.totalCandidates}, Employers: ${stats.totalEmployers}, Companies: ${stats.totalCompanies}, Total Jobs: ${stats.totalJobs}, Active: ${stats.activeJobs}, Archived: ${stats.archivedJobs}, Applications: ${stats.totalApplications}, Blocked: ${stats.blockedEmployers}`
    );

    // ----------------------------------------------------
    // TEST 13: Candidate without resume is prompted / blocked from applying
    // ----------------------------------------------------
    const vikramLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: "vikram.naik@jobportal.demo", password: "Vikram#2026" },
    });
    const vikramToken = vikramLogin.data?.token || "";

    const t13 = await request(`/api/applications/apply/${testJobId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${vikramToken}` },
      body: { phone: "+91 96320 56789", coverLetter: "Applying without a resume" },
    });
    record(
      13,
      "Candidate without resume is prompted/blocked before applying",
      t13.status === 400 && t13.data?.message?.includes("Resume is required"),
      `HTTP status: ${t13.status} | Rejection message: "${t13.data?.message}"`
    );

    // ----------------------------------------------------
    // TEST 14: Candidate with resume completes application successfully
    // ----------------------------------------------------
    // Candidate Priya Suresh has an uploaded valid resume and applies to a different job
    const priyaLogin = await request("/api/auth/login", {
      method: "POST",
      body: { email: "priya.suresh@jobportal.demo", password: "Priya#2026" },
    });
    const priyaToken = priyaLogin.data?.token || "";

    // Pick a second job for Priya's application
    const secondJob = activeJobsList.find((j) => j._id.toString() !== testJobId) || activeJobsList[1];
    const t14 = await request(`/api/applications/apply/${secondJob._id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${priyaToken}` },
      body: {
        phone: "+91 97410 45678",
        coverLetter: "Experienced with AWS and Kubernetes pipelines.",
      },
    });
    let priyaAppId = "";
    if (t14.status === 201 && t14.data?.application?._id) {
      priyaAppId = t14.data.application._id;
    }
    record(
      14,
      "Candidate with resume completes application successfully",
      t14.status === 201 && Boolean(t14.data?.application),
      `Candidate Priya Suresh applied to "${secondJob.title}" (${secondJob.company}) | Status: ${t14.data?.application?.status}`
    );

    // ----------------------------------------------------
    // CLEANUP: Clean test applications so tests remain idempotent
    // ----------------------------------------------------
    console.log("\n--- CLEANING TEST ARTIFACTS FOR IDEMPOTENCY ---");
    const ApplicationModel = require("./models/Application");
    const NotificationModel = require("./models/Notification");
    const mongoose = require("mongoose");
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/JobPortalData";
    await mongoose.connect(mongoUri);

    if (testAppId) {
      await ApplicationModel.findByIdAndDelete(testAppId);
    }
    if (priyaAppId) {
      await ApplicationModel.findByIdAndDelete(priyaAppId);
    }
    // Delete any test notifications generated
    await NotificationModel.deleteMany({
      title: "New Application Received",
      createdAt: { $gte: new Date(Date.now() - 60000) },
    });
    await mongoose.disconnect();
    console.log("✓ Test application records cleaned up cleanly.");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  }

  console.log("\n==========================================================");
  console.log(`FINAL RESULT: ${passed}/14 TESTS PASSED (${failed} FAILED)`);
  console.log("==========================================================");

  if (failed === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runValidationTests();
