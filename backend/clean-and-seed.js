const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");
const CandidateProfile = require("./models/CandidateProfile");
const EmployerProfile = require("./models/EmployerProfile");
const Resume = require("./models/Resume");
const Notification = require("./models/Notification");

// Helper to create a valid base64 PDF data URL
function createValidPdfBase64(candidateName, title) {
  const pdfRaw = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 18 Tf
72 720 Td
(${candidateName} - Resume) Tj
0 -30 Td
/F1 12 Tf
(${title}) Tj
0 -20 Td
(Verified Online Job Portal Candidate) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000214 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
380
%%EOF`;
  return `data:application/pdf;base64,${Buffer.from(pdfRaw).toString("base64")}`;
}

async function cleanAndSeed() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/JobPortalData";
  console.log(`Connecting to MongoDB at: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  console.log("\n--- STEP 1: CLEANING DUPLICATE JOBS ---");
  const allJobs = await Job.find({}).sort({ createdAt: 1 });
  const seenJobs = new Map();
  let duplicatesRemoved = 0;

  for (const job of allJobs) {
    const key = `${job.title.trim().toLowerCase()}_${job.company.trim().toLowerCase()}`;
    if (!seenJobs.has(key)) {
      seenJobs.set(key, job);
    } else {
      // Check if this duplicate job has any applications
      const appsForThisJob = await Application.find({ job: job._id });
      const primaryJob = seenJobs.get(key);

      if (appsForThisJob.length > 0) {
        for (const app of appsForThisJob) {
          const existsOnPrimary = await Application.findOne({
            job: primaryJob._id,
            candidate: app.candidate,
          });
          if (existsOnPrimary) {
            // Already applied to primary job, delete redundant application
            await Application.findByIdAndDelete(app._id);
          } else {
            app.job = primaryJob._id;
            await app.save();
          }
        }
      }

      await Job.findByIdAndDelete(job._id);
      duplicatesRemoved++;
    }
  }
  console.log(`✓ Removed ${duplicatesRemoved} duplicate job listings. Unique jobs remaining: ${seenJobs.size}`);

  // Ensure all jobs have valid status ("Active" or "Archived")
  await Job.updateMany({ status: "Closed" }, { $set: { status: "Archived" } });
  await Job.updateMany({ status: { $exists: false } }, { $set: { status: "Active" } });

  console.log("\n--- STEP 2: CLEANING ARTIFICIAL TEST CANDIDATE ACCOUNTS ---");
  // Find test candidates created by automated test runs
  const testUsers = await User.find({
    role: { $in: ["jobseeker", "candidate"] },
    email: { $regex: /^(newuser_|noresume_)/i },
  });

  console.log(`Found ${testUsers.length} artificial test accounts to clean.`);
  for (const tu of testUsers) {
    await CandidateProfile.deleteOne({ user: tu._id });
    await Resume.deleteMany({ user: tu._id });
    await Application.deleteMany({ candidate: tu._id });
    await Notification.deleteMany({ recipient: tu._id });
    await User.findByIdAndDelete(tu._id);
  }
  console.log(`✓ Cleaned ${testUsers.length} test accounts.`);

  console.log("\n--- STEP 3: SEEDING REALISTIC CANDIDATE ACCOUNTS ---");
  const candidateSeeds = [
    {
      fullName: "Rahul Sharma",
      email: "jobseeker@example.com", // Existing demo candidate login
      altEmail: "rahul.sharma@jobportal.demo",
      password: "password123",
      headline: "Senior Full Stack Developer | React, Node.js, Cloud",
      phone: "+91 98450 12345",
      location: "Bengaluru, Karnataka, India",
      education: "B.Tech in Computer Science, Visvesvaraya Technological University (VTU), Belagavi",
      experience: "1-3 Years",
      skills: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript", "REST APIs", "AWS"],
      bio: "Passionate full stack developer with 3 years experience building high-throughput web applications with Node.js and modern React frontends.",
      hasResume: true,
      resumeTitle: "Rahul_Sharma_Resume.pdf",
    },
    {
      fullName: "Ananya Rao",
      email: "ananya.rao@jobportal.demo",
      password: "Ananya#2026",
      headline: "Software Engineer | Java, Spring Boot, Microservices",
      phone: "+91 98860 23456",
      location: "Mysuru, Karnataka, India",
      education: "B.E. in Information Science, University of Mysore",
      experience: "Fresher",
      skills: ["Java", "Spring Boot", "Hibernate", "MySQL", "REST APIs", "Git", "Docker"],
      bio: "Recent Information Science graduate specialized in robust backend engineering with Java Spring Boot and enterprise microservice architecture.",
      hasResume: true,
      resumeTitle: "Ananya_Rao_Resume.pdf",
    },
    {
      fullName: "Karthik Hegde",
      email: "karthik.hegde@jobportal.demo",
      password: "Karthik#2026",
      headline: "Data Scientist & ML Engineer | Python, PyTorch, Analytics",
      phone: "+91 94480 34567",
      location: "Bengaluru, Karnataka, India",
      education: "M.Tech in Data Science, IIIT Bangalore",
      experience: "1-3 Years",
      skills: ["Python", "Machine Learning", "PyTorch", "SQL", "Pandas", "Scikit-Learn", "FastAPI"],
      bio: "Data scientist with expertise in predictive modeling, deep learning pipelines, and production NLP deployments.",
      hasResume: true,
      resumeTitle: "Karthik_Hegde_Resume.pdf",
    },
    {
      fullName: "Priya Suresh",
      email: "priya.suresh@jobportal.demo",
      password: "Priya#2026",
      headline: "DevOps & Cloud Engineer | AWS, Kubernetes, Terraform",
      phone: "+91 97410 45678",
      location: "Hubballi, Karnataka, India",
      education: "B.Tech in Electronics & Communication, KLE Technological University, Hubballi",
      experience: "1-3 Years",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Python"],
      bio: "Cloud engineer passionate about infrastructure as code, automated continuous delivery, and container orchestration.",
      hasResume: true,
      resumeTitle: "Priya_Suresh_Resume.pdf",
    },
    {
      fullName: "Vikram Naik",
      email: "vikram.naik@jobportal.demo",
      password: "Vikram#2026",
      headline: "Junior Frontend Developer | React, CSS3, JavaScript",
      phone: "+91 96320 56789",
      location: "Mangaluru, Karnataka, India",
      education: "B.C.A, Mangalore University",
      experience: "Fresher",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Responsive Design", "UI/UX"],
      bio: "Enthusiastic frontend fresher with strong foundation in responsive web design, semantic HTML, modern CSS, and React component workflows.",
      hasResume: false, // Intentionally NO resume for test gating!
      resumeTitle: "",
    },
  ];

  for (const c of candidateSeeds) {
    let user = await User.findOne({ email: c.email });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(c.password, salt);

    if (!user) {
      user = await User.create({
        fullName: c.fullName,
        email: c.email,
        password: hashedPassword,
        role: "jobseeker",
        isActive: true,
        isBlocked: false,
      });
      console.log(`+ Created candidate: ${c.fullName} (${c.email})`);
    } else {
      user.fullName = c.fullName;
      user.password = hashedPassword;
      user.role = "jobseeker";
      user.isActive = true;
      user.isBlocked = false;
      await user.save();
      console.log(`~ Updated candidate: ${c.fullName} (${c.email})`);
    }

    let resumeUrl = "";
    if (c.hasResume) {
      const pdfBase64 = createValidPdfBase64(c.fullName, c.headline);
      resumeUrl = pdfBase64;

      await Resume.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            user: user._id,
            title: c.resumeTitle,
            fileUrl: pdfBase64,
            summary: c.bio,
            skills: c.skills,
          },
        },
        { upsert: true, new: true }
      );
    } else {
      // Ensure candidate WITHOUT resume has no resume records
      await Resume.deleteMany({ user: user._id });
    }

    await CandidateProfile.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          fullName: c.fullName,
          headline: c.headline,
          phone: c.phone,
          location: c.location,
          skills: c.skills,
          experience: c.experience,
          education: c.education,
          resumeUrl: resumeUrl,
          bio: c.bio,
        },
      },
      { upsert: true, new: true }
    );
  }

  console.log("\n--- STEP 4: VERIFYING DATABASE STATS ---");
  const totalCandidates = await User.countDocuments({ role: { $in: ["jobseeker", "candidate"] } });
  const totalEmployers = await User.countDocuments({ role: "employer" });
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ status: "Active" });
  const archivedJobs = await Job.countDocuments({ status: "Archived" });
  const totalResumes = await Resume.countDocuments();

  console.log(`Candidates: ${totalCandidates}`);
  console.log(`Employers: ${totalEmployers}`);
  console.log(`Total Jobs: ${totalJobs} (Active: ${activeJobs}, Archived: ${archivedJobs})`);
  console.log(`Resumes: ${totalResumes}`);

  await mongoose.disconnect();
  console.log("\n✓ Database cleanup and seeding completed successfully.");
}

cleanAndSeed().catch((err) => {
  console.error("Clean and seed failed:", err);
  process.exit(1);
});
