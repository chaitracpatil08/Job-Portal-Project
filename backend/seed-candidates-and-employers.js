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

// Helper to create a valid, readable base64 PDF
function createValidPdfBase64(candidateName, headline, skills) {
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
<< /Length 180 >>
stream
BT
/F1 18 Tf
72 720 Td
(${candidateName} - Professional Resume) Tj
0 -30 Td
/F1 12 Tf
(${headline}) Tj
0 -20 Td
(Key Skills: ${skills.slice(0, 5).join(", ")}) Tj
0 -20 Td
(Verified Online Job Portal Candidate Profile) Tj
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
440
%%EOF`;
  return `data:application/pdf;base64,${Buffer.from(pdfRaw).toString("base64")}`;
}

async function runSeed() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/JobPortalData";
  console.log(`Connecting to MongoDB at: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  // ==========================================
  // 1. ENSURE EMPLOYER TEST ACCOUNTS
  // ==========================================
  console.log("\n--- CONFIGURING VERIFIED EMPLOYER TEST ACCOUNTS ---");

  const employerAccounts = [
    {
      fullName: "Tech Corp Global",
      email: "employer@example.com",
      password: "password123",
      companyName: "Tech Corp Global",
      industry: "Information Technology",
      location: "Bengaluru, Karnataka, India",
      website: "https://techcorpglobal.example.com",
      companySize: "1,000-5,000 Employees",
      description: "Premier enterprise software and digital transformation partner.",
    },
    {
      fullName: "Google",
      email: "google@jobportal.demo",
      password: "Google#26",
      companyName: "Google",
      industry: "Internet & Technology",
      location: "Bangalore / Hyderabad, India",
      website: "https://about.google",
      companySize: "10,000+ Employees",
      description: "Google is a multinational technology enterprise focusing on search, cloud, AI, and operating systems.",
    },
    {
      fullName: "Microsoft",
      email: "microsoft@jobportal.demo",
      password: "Microsoft#26",
      companyName: "Microsoft",
      industry: "Computer Software & Cloud",
      location: "Bangalore / Hyderabad, India",
      website: "https://careers.microsoft.com",
      companySize: "10,000+ Employees",
      description: "Global cloud, productivity, AI, and personal computing platform provider.",
    },
    {
      fullName: "Amazon",
      email: "amazon@jobportal.demo",
      password: "Amazon#26",
      companyName: "Amazon",
      industry: "E-Commerce & Cloud Computing",
      location: "Bengaluru / Hyderabad, India",
      website: "https://amazon.jobs",
      companySize: "10,000+ Employees",
      description: "Pioneer in cloud infrastructure (AWS), retail innovation, and autonomous systems.",
    },
    {
      fullName: "Infosys",
      email: "infosys@jobportal.demo",
      password: "Infosys#26",
      companyName: "Infosys",
      industry: "IT Services & Consulting",
      location: "Bengaluru / Mysuru, India",
      website: "https://www.infosys.com",
      companySize: "10,000+ Employees",
      description: "Global leader in next-generation digital services and consulting.",
    },
    {
      fullName: "Wipro",
      email: "wipro@jobportal.demo",
      password: "Wipro#26",
      companyName: "Wipro",
      industry: "IT Services & Consulting",
      location: "Bengaluru, Karnataka, India",
      website: "https://www.wipro.com",
      companySize: "10,000+ Employees",
      description: "Leading technology services and consulting company focused on building innovative solutions.",
    },
    {
      fullName: "TCS",
      email: "tcs@jobportal.demo",
      password: "Tcs#26",
      companyName: "Tata Consultancy Services (TCS)",
      industry: "IT Services & Consulting",
      location: "Bengaluru / Mumbai, India",
      website: "https://www.tcs.com",
      companySize: "10,000+ Employees",
      description: "Part of the Tata group, TCS is an IT services, consulting, and business solutions leader.",
    },
    {
      fullName: "Mindtree",
      email: "mindtree@jobportal.demo",
      password: "Mindtree#26",
      companyName: "Mindtree",
      industry: "Digital Transformation & IT",
      location: "Bengaluru, Karnataka, India",
      website: "https://www.ltimindtree.com",
      companySize: "5,000-10,000 Employees",
      description: "Specialized in agile engineering, cloud migration, and consumer experience platforms.",
    },
    {
      fullName: "Flipkart",
      email: "flipkart@jobportal.demo",
      password: "Flipkart#26",
      companyName: "Flipkart",
      industry: "E-Commerce",
      location: "Bengaluru, Karnataka, India",
      website: "https://www.flipkartcareers.com",
      companySize: "10,000+ Employees",
      description: "India's homegrown e-commerce marketplace empowering millions of consumers and sellers.",
    },
  ];

  for (const emp of employerAccounts) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(emp.password, salt);

    let user = await User.findOne({ email: emp.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        fullName: emp.fullName,
        email: emp.email.toLowerCase(),
        password: hashedPassword,
        role: "employer",
        isActive: true,
        isBlocked: false,
      });
      console.log(`+ Created employer: ${emp.fullName} (${emp.email})`);
    } else {
      user.fullName = emp.fullName;
      user.password = hashedPassword;
      user.role = "employer";
      user.isActive = true;
      user.isBlocked = false;
      await user.save();
      console.log(`~ Updated employer password & status: ${emp.fullName} (${emp.email})`);
    }

    await EmployerProfile.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          companyName: emp.companyName,
          email: emp.email.toLowerCase(),
          location: emp.location,
          industry: emp.industry,
          website: emp.website,
          companySize: emp.companySize,
          description: emp.description,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  // ==========================================
  // 2. SEED 13 DISTINCT CANDIDATE TEST ACCOUNTS
  // ==========================================
  console.log("\n--- SEEDING 13 DISTINCT CANDIDATE TEST ACCOUNTS ---");

  const candidatesData = [
    {
      fullName: "Rahul Sharma",
      email: "jobseeker@example.com",
      password: "password123",
      headline: "Senior Full Stack Developer | React, Node.js, AWS",
      phone: "+91 98450 11001",
      location: "Bengaluru, Karnataka, India",
      education: "B.Tech in Computer Science, Visvesvaraya Technological University (VTU), Belagavi",
      experience: "3+ Years",
      skills: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript", "REST APIs", "AWS"],
      bio: "Passionate full stack developer with 3+ years experience engineering responsive SPAs and resilient microservices.",
      hasResume: true,
      resumeTitle: "Rahul_Sharma_Resume.pdf",
    },
    {
      fullName: "Ananya Rao",
      email: "ananya.rao@jobportal.demo",
      password: "Ananya#2026",
      headline: "Software Engineer | Java, Spring Boot, Microservices",
      phone: "+91 98860 22002",
      location: "Mysuru, Karnataka, India",
      education: "B.E. in Information Science, University of Mysore",
      experience: "Fresher",
      skills: ["Java", "Spring Boot", "Hibernate", "MySQL", "REST APIs", "Git", "Docker"],
      bio: "Top-ranking Information Science graduate with strong algorithms foundation and practical Spring Boot project portfolio.",
      hasResume: true,
      resumeTitle: "Ananya_Rao_Resume.pdf",
    },
    {
      fullName: "Karthik Hegde",
      email: "karthik.hegde@jobportal.demo",
      password: "Karthik#2026",
      headline: "Data Scientist & ML Engineer | Python, PyTorch, SQL",
      phone: "+91 94480 33003",
      location: "Bengaluru, Karnataka, India",
      education: "M.Tech in Data Science, IIIT Bangalore",
      experience: "1-3 Years",
      skills: ["Python", "Machine Learning", "PyTorch", "SQL", "Pandas", "Scikit-Learn", "FastAPI"],
      bio: "Data scientist experienced in exploratory data analysis, predictive statistical modeling, and deep learning NLP pipelines.",
      hasResume: true,
      resumeTitle: "Karthik_Hegde_Resume.pdf",
    },
    {
      fullName: "Priya Suresh",
      email: "priya.suresh@jobportal.demo",
      password: "Priya#2026",
      headline: "DevOps & Cloud Engineer | AWS, Kubernetes, Terraform",
      phone: "+91 97410 44004",
      location: "Hubballi, Karnataka, India",
      education: "B.Tech in Electronics & Communication, KLE Technological University, Hubballi",
      experience: "1-3 Years",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Python"],
      bio: "DevOps enthusiast focused on automated continuous delivery, GitOps infrastructure, and containerized microservices.",
      hasResume: true,
      resumeTitle: "Priya_Suresh_Resume.pdf",
    },
    {
      fullName: "Vikram Naik",
      email: "vikram.naik@jobportal.demo",
      password: "Vikram#2026",
      headline: "Junior Frontend Developer | HTML5, CSS3, JavaScript",
      phone: "+91 96320 55005",
      location: "Mangaluru, Karnataka, India",
      education: "B.C.A, Mangalore University",
      experience: "Fresher",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Responsive Design", "UI/UX"],
      bio: "Creative frontend graduate with keen eye for pixel-perfect design, accessible layouts, and interactive UI components.",
      hasResume: false, // NO resume uploaded: for testing resume-check application gating!
      resumeTitle: "",
    },
    {
      fullName: "Sneha Kulkarni",
      email: "sneha.kulkarni@jobportal.demo",
      password: "Sneha#2026",
      headline: "QA Automation Engineer | Selenium, Cypress, Java",
      phone: "+91 91480 66006",
      location: "Belagavi, Karnataka, India",
      education: "B.E. in Computer Science, Gogte Institute of Technology, Belagavi",
      experience: "1-3 Years",
      skills: ["Selenium", "Cypress", "Java", "TestNG", "Postman", "API Testing", "Jira"],
      bio: "Quality assurance engineer specialized in functional automation suites, API integration tests, and regression workflows.",
      hasResume: true,
      resumeTitle: "Sneha_Kulkarni_Resume.pdf",
    },
    {
      fullName: "Aditya Bhat",
      email: "aditya.bhat@jobportal.demo",
      password: "Aditya#2026",
      headline: "Mobile Application Developer | Flutter, Android, Kotlin",
      phone: "+91 98440 77007",
      location: "Udupi, Karnataka, India",
      education: "B.Tech in Information Technology, Manipal Institute of Technology (MIT), Manipal",
      experience: "1-3 Years",
      skills: ["Flutter", "Dart", "Android", "Kotlin", "Firebase", "REST APIs", "State Management"],
      bio: "Cross-platform mobile developer with 2 published applications on Google Play Store built with Flutter and Firebase.",
      hasResume: true,
      resumeTitle: "Aditya_Bhat_Resume.pdf",
    },
    {
      fullName: "Meera Deshmukh",
      email: "meera.deshmukh@jobportal.demo",
      password: "Meera#2026",
      headline: "UI/UX Designer & Frontend Engineer | Figma, React, Tailwind",
      phone: "+91 99010 88008",
      location: "Bengaluru, Karnataka, India",
      education: "B.Des in Interaction Design, NIFT Bengaluru",
      experience: "1-3 Years",
      skills: ["Figma", "UI/UX Design", "React", "Tailwind CSS", "HTML5", "User Research", "Wireframing"],
      bio: "Product designer bridging user psychology with modern React frontend engineering to craft delightful software experiences.",
      hasResume: true,
      resumeTitle: "Meera_Deshmukh_Resume.pdf",
    },
    {
      fullName: "Rohan Vernekar",
      email: "rohan.vernekar@jobportal.demo",
      password: "Rohan#2026",
      headline: "Backend Systems Engineer | Go, PostgreSQL, Redis, gRPC",
      phone: "+91 99800 99009",
      location: "Karwar, Karnataka, India",
      education: "B.E. in Computer Science, SDM College of Engineering, Dharwad",
      experience: "3+ Years",
      skills: ["Go", "PostgreSQL", "Redis", "gRPC", "Docker", "Kafka", "Distributed Systems"],
      bio: "High-concurrency systems engineer proficient in Golang, relational database query optimization, and event-driven backends.",
      hasResume: true,
      resumeTitle: "Rohan_Vernekar_Resume.pdf",
    },
    {
      fullName: "Divya Prasad",
      email: "divya.prasad@jobportal.demo",
      password: "Divya#2026",
      headline: "Cybersecurity & Cloud Security Analyst | SIEM, Python, Linux",
      phone: "+91 98800 10110",
      location: "Mysuru, Karnataka, India",
      education: "M.Sc in Information Security, JSS Science & Technology University, Mysuru",
      experience: "1-3 Years",
      skills: ["Cybersecurity", "Network Security", "Python", "Linux", "SIEM", "Wireshark", "SOC Analysis"],
      bio: "Security analyst dedicated to vulnerability assessments, penetration testing, threat detection, and cloud governance.",
      hasResume: true,
      resumeTitle: "Divya_Prasad_Resume.pdf",
    },
    {
      fullName: "Naveen Gowda",
      email: "naveen.gowda@jobportal.demo",
      password: "Naveen#2026",
      headline: "Database & Data Warehouse Engineer | MongoDB, PostgreSQL, ETL",
      phone: "+91 97400 12121",
      location: "Mandya, Karnataka, India",
      education: "B.E. in Information Science, PES College of Engineering, Mandya",
      experience: "1-3 Years",
      skills: ["MongoDB", "PostgreSQL", "MySQL", "ETL", "Python", "Data Modeling", "Database Tuning"],
      bio: "Database professional experienced with schema design, indexing strategies, backup recovery, and automated data pipelines.",
      hasResume: true,
      resumeTitle: "Naveen_Gowda_Resume.pdf",
    },
    {
      fullName: "Pooja Shetty",
      email: "pooja.shetty@jobportal.demo",
      password: "Pooja#2026",
      headline: "Product & Business Systems Analyst | SQL, Tableau, Agile",
      phone: "+91 96110 13131",
      location: "Mangaluru, Karnataka, India",
      education: "M.B.A in Tech Management, NMAM Institute of Technology, Nitte",
      experience: "1-3 Years",
      skills: ["Business Analysis", "SQL", "Tableau", "Agile / Scrum", "Jira", "Requirements Gathering"],
      bio: "Business analyst translating complex enterprise operational workflows into clear product backlog requirements and dashboards.",
      hasResume: true,
      resumeTitle: "Pooja_Shetty_Resume.pdf",
    },
    {
      fullName: "Arjun Murthy",
      email: "arjun.murthy@jobportal.demo",
      password: "Arjun#2026",
      headline: "Embedded Systems & IoT Developer | C, C++, FreeRTOS, ESP32",
      phone: "+91 94800 14141",
      location: "Shivamogga, Karnataka, India",
      education: "B.E. in Electronics & Communication, JNNCE Shivamogga",
      experience: "Fresher",
      skills: ["Embedded C", "C++", "FreeRTOS", "ESP32", "ARM Cortex", "UART / SPI / I2C", "IoT Protocols"],
      bio: "Hardware-firmware engineer specialized in microcontroller programming, sensor interfacing, and IoT edge communication.",
      hasResume: true,
      resumeTitle: "Arjun_Murthy_Resume.pdf",
    },
  ];

  for (const c of candidatesData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(c.password, salt);

    let user = await User.findOne({ email: c.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        fullName: c.fullName,
        email: c.email.toLowerCase(),
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
      const pdfBase64 = createValidPdfBase64(c.fullName, c.headline, c.skills);
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
        { upsert: true, returnDocument: "after" }
      );
    } else {
      // For Vikram Naik, explicitly ensure NO resume exists
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
      { upsert: true, returnDocument: "after" }
    );
  }

  // ==========================================
  // 3. VERIFY LOGIN FOR ALL SEEDED ACCOUNTS
  // ==========================================
  console.log("\n--- VERIFYING BCRYPT AUTHENTICATION MATCHES ---");

  console.log("Checking Employers:");
  for (const emp of employerAccounts) {
    const u = await User.findOne({ email: emp.email.toLowerCase() });
    const isMatch = u ? await bcrypt.compare(emp.password, u.password) : false;
    console.log(`  ${emp.companyName.padEnd(20)} | ${emp.email.padEnd(28)} | Match: ${isMatch ? "SUCCESS ✓" : "FAILED ❌"}`);
  }

  console.log("\nChecking Candidates:");
  for (const cand of candidatesData) {
    const u = await User.findOne({ email: cand.email.toLowerCase() });
    const isMatch = u ? await bcrypt.compare(cand.password, u.password) : false;
    const hasRes = await Resume.findOne({ user: u?._id });
    console.log(`  ${cand.fullName.padEnd(20)} | ${cand.email.padEnd(32)} | Match: ${isMatch ? "SUCCESS ✓" : "FAILED ❌"} | Resume: ${hasRes ? "YES" : "NO (Gated)"}`);
  }

  // Total summary counts
  const totalCand = await User.countDocuments({ role: { $in: ["jobseeker", "candidate"] } });
  const totalEmp = await User.countDocuments({ role: "employer" });
  const totalJobs = await Job.countDocuments();
  const totalCompanies = await EmployerProfile.countDocuments();

  console.log(`\nFinal Database State:`);
  console.log(`Total Candidates: ${totalCand}`);
  console.log(`Total Employers: ${totalEmp}`);
  console.log(`Total Companies: ${totalCompanies}`);
  console.log(`Total Jobs: ${totalJobs}`);

  await mongoose.disconnect();
  console.log("\n✓ Seeding and verification completed successfully.");
}

runSeed().catch((err) => {
  console.error("Seed execution failed:", err);
  process.exit(1);
});
