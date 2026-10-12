const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");
const CandidateProfile = require("./models/CandidateProfile");
const EmployerProfile = require("./models/EmployerProfile");
const Notification = require("./models/Notification");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/JobPortalData";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data to avoid duplicates during fresh seed
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      CandidateProfile.deleteMany({}),
      EmployerProfile.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Users
    const candidateUser = await User.create({
      fullName: "Rahul Sharma",
      email: "jobseeker@example.com",
      password: passwordHash,
      role: "jobseeker",
    });

    const employerUser = await User.create({
      fullName: "Google India",
      email: "employer@example.com",
      password: passwordHash,
      role: "employer",
    });

    const adminUser = await User.create({
      fullName: "System Admin",
      email: "admin@example.com",
      password: passwordHash,
      role: "admin",
    });

    // Additional employers
    const msftEmployer = await User.create({
      fullName: "Microsoft India",
      email: "microsoft@example.com",
      password: passwordHash,
      role: "employer",
    });

    const amazonEmployer = await User.create({
      fullName: "Amazon Tech",
      email: "amazon@example.com",
      password: passwordHash,
      role: "employer",
    });

    const accentureEmployer = await User.create({
      fullName: "Accenture Careers",
      email: "accenture@example.com",
      password: passwordHash,
      role: "employer",
    });

    const infosysEmployer = await User.create({
      fullName: "Infosys Careers",
      email: "infosys@example.com",
      password: passwordHash,
      role: "employer",
    });

    const tcsEmployer = await User.create({
      fullName: "TCS Careers",
      email: "tcs@example.com",
      password: passwordHash,
      role: "employer",
    });

    // 2. Create Candidate Profile
    await CandidateProfile.create({
      user: candidateUser._id,
      fullName: "Rahul Sharma",
      headline: "Full Stack Developer | React, Node.js, Express, MongoDB",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "SQL", "Git"],
      experience: "1-3 Years as Junior Web Developer",
      education: "B.Tech in Computer Science, 2024",
      resumeUrl: "https://example.com/resume-rahul.pdf",
      portfolioUrl: "https://rahulsharma.dev",
      bio: "Passionate software developer interested in scalable web architecture and cloud services.",
    });

    // 3. Create Employer Profiles
    const companyProfiles = [
      {
        user: employerUser._id,
        companyName: "Google",
        email: "careers@google.com",
        phone: "+91 80 6721 8000",
        website: "https://careers.google.com",
        location: "Bangalore, India",
        industry: "Technology & Software",
        companySize: "10,000+ Employees",
        description: "Google is a technology company focused on building products and services that help people access information and connect with the world.",
        logo: "G",
      },
      {
        user: msftEmployer._id,
        companyName: "Microsoft",
        email: "careers@microsoft.com",
        phone: "+91 40 6695 0000",
        website: "https://careers.microsoft.com",
        location: "Hyderabad, India",
        industry: "Technology & Software",
        companySize: "10,000+ Employees",
        description: "Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.",
        logo: "M",
      },
      {
        user: amazonEmployer._id,
        companyName: "Amazon",
        email: "careers@amazon.com",
        phone: "+91 44 6700 0000",
        website: "https://amazon.jobs",
        location: "Chennai, India",
        industry: "E-Commerce & Cloud",
        companySize: "10,000+ Employees",
        description: "Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking.",
        logo: "A",
      },
      {
        user: accentureEmployer._id,
        companyName: "Accenture",
        email: "careers@accenture.com",
        phone: "+91 80 4077 0000",
        website: "https://accenture.com/careers",
        location: "Bangalore, India",
        industry: "IT Services & Consulting",
        companySize: "10,000+ Employees",
        description: "Accenture is a leading global professional services company, providing a broad range of services in strategy and consulting, interactive, technology and operations.",
        logo: "A",
      },
      {
        user: infosysEmployer._id,
        companyName: "Infosys",
        email: "careers@infosys.com",
        phone: "+91 20 2293 2800",
        website: "https://infosys.com",
        location: "Pune, India",
        industry: "IT Services & Consulting",
        companySize: "10,000+ Employees",
        description: "Infosys is a global leader in next-generation digital services and consulting.",
        logo: "I",
      },
      {
        user: tcsEmployer._id,
        companyName: "TCS",
        email: "careers@tcs.com",
        phone: "+91 22 6778 9999",
        website: "https://tcs.com",
        location: "Mumbai, India",
        industry: "IT Services & Consulting",
        companySize: "10,000+ Employees",
        description: "Tata Consultancy Services is an IT services, consulting and business solutions organization.",
        logo: "T",
      },
    ];

    await EmployerProfile.insertMany(companyProfiles);

    // 4. Create Jobs
    const jobs = await Job.insertMany([
      {
        title: "Software Developer",
        company: "Google",
        employer: employerUser._id,
        location: "Bangalore, India",
        jobType: "Full Time",
        experience: "Fresher",
        salary: "₹12 - 18 LPA",
        skills: ["Java", "React", "SQL", "Git", "REST API"],
        description:
          "We are looking for a passionate Software Developer to join our team. You will work on building scalable applications and solving real-world technical problems. You will collaborate with developers, designers, and product teams to create high-quality software solutions.",
        responsibilities: [
          "Develop and maintain web applications.",
          "Write clean and efficient code.",
          "Work with cross-functional teams.",
          "Debug and fix software issues.",
          "Participate in code reviews.",
        ],
        requirements: [
          "Bachelor's degree in Computer Science or related field.",
          "Good understanding of programming concepts.",
          "Strong problem-solving skills.",
          "Good communication and teamwork skills.",
        ],
        logo: "G",
        status: "Active",
      },
      {
        title: "Frontend Developer",
        company: "Accenture",
        employer: accentureEmployer._id,
        location: "Bangalore, India",
        jobType: "Full Time",
        experience: "1-3 Years",
        salary: "₹5 - 8 LPA",
        skills: ["HTML", "CSS", "JavaScript", "React", "Redux"],
        description:
          "Accenture is seeking a Frontend Developer to create intuitive user interfaces for enterprise clients worldwide. You will translate designs into responsive web components and ensure high-performance rendering.",
        responsibilities: [
          "Build responsive React web applications.",
          "Optimize applications for maximum speed and scalability.",
          "Ensure high quality graphic standards and brand consistency.",
        ],
        requirements: [
          "1+ years experience in frontend development.",
          "Proficiency in HTML5, CSS3, JavaScript, React.",
          "Experience with responsive design and modern CSS frameworks.",
        ],
        logo: "A",
        status: "Active",
      },
      {
        title: "Java Developer",
        company: "Microsoft",
        employer: msftEmployer._id,
        location: "Hyderabad, India",
        jobType: "Full Time",
        experience: "3+ Years",
        salary: "₹15 - 25 LPA",
        skills: ["Java", "Spring Boot", "MySQL", "Azure", "Microservices"],
        description:
          "Join Microsoft's Cloud team as a Java Developer. You will be designing and implementing scalable cloud-native microservices, optimizing low-latency backend APIs, and contributing to core Azure platform services.",
        responsibilities: [
          "Architect microservices using Spring Boot and Java.",
          "Design robust database schemas and write optimized queries.",
          "Collaborate with architects on system scalability and security.",
        ],
        requirements: [
          "3+ years building backend systems in Java/Spring Boot.",
          "Strong computer science fundamentals in data structures and algorithms.",
          "Experience with distributed systems and cloud providers.",
        ],
        logo: "M",
        status: "Active",
      },
      {
        title: "Product Manager",
        company: "Microsoft",
        employer: msftEmployer._id,
        location: "Hyderabad, India",
        jobType: "Full Time",
        experience: "3+ Years",
        salary: "₹18 - 28 LPA",
        skills: ["Product Strategy", "Agile", "User Research", "Analytics"],
        description:
          "Lead cross-functional teams to build next-generation productivity tools at Microsoft.",
        responsibilities: [
          "Define product vision, roadmap, and growth opportunities.",
          "Assess value, develop use cases, and prioritize stories.",
        ],
        requirements: [
          "Degree in Business, CS, or equivalent experience.",
          "Track record in delivering tech products from conception to launch.",
        ],
        logo: "M",
        status: "Active",
      },
      {
        title: "Cloud Support Associate",
        company: "Amazon",
        employer: amazonEmployer._id,
        location: "Chennai, India",
        jobType: "Full Time",
        experience: "Fresher",
        salary: "₹10 - 16 LPA",
        skills: ["AWS", "Linux", "Networking", "Python"],
        description:
          "Deliver technical support for AWS services to customers around the globe.",
        responsibilities: [
          "Troubleshoot complex technical problems across AWS infrastructure.",
          "Write automation scripts in Python/Bash to streamline diagnostics.",
        ],
        requirements: [
          "Basic understanding of OS, networking, and cloud fundamentals.",
          "Strong communication and problem-solving skills.",
        ],
        logo: "A",
        status: "Active",
      },
      {
        title: "React Native Intern",
        company: "Google",
        employer: employerUser._id,
        location: "Bangalore, India",
        jobType: "Internship",
        experience: "Fresher",
        salary: "₹40,000 / month",
        skills: ["React Native", "JavaScript", "Mobile UI"],
        description:
          "Internship role for passionate mobile developers wanting to work on cutting edge Android and iOS products.",
        responsibilities: [
          "Assist in developing mobile features in React Native.",
          "Participate in user testing and fix bugs.",
        ],
        requirements: [
          "Current student or recent graduate in Computer Science.",
          "Familiarity with React or React Native.",
        ],
        logo: "G",
        status: "Active",
      },
    ]);

    // 5. Create a sample application
    const sampleApp = await Application.create({
      job: jobs[0]._id, // Google Software Developer
      candidate: candidateUser._id,
      fullName: candidateUser.fullName,
      email: candidateUser.email,
      phone: "+91 98765 43210",
      resumeUrl: "https://example.com/resume-rahul.pdf",
      coverLetter: "I am excited to apply for the Software Developer role at Google. With my background in full-stack development and passion for algorithms, I believe I can make a meaningful impact.",
      status: "Shortlisted",
      notes: "Strong candidate with full-stack background.",
    });

    // 6. Create Notification for candidate
    await Notification.create({
      recipient: candidateUser._id,
      sender: employerUser._id,
      title: "Application Status Update",
      message: "Your application for Software Developer at Google has been Shortlisted!",
      type: "application_status",
      link: "/dashboard",
    });

    console.log("Database seeded successfully!");
    console.log("------------------------------------------");
    console.log("Candidate Login : jobseeker@example.com / password123");
    console.log("Employer Login  : employer@example.com  / password123");
    console.log("Admin Login     : admin@example.com     / password123");
    console.log(`Jobs created    : ${jobs.length}`);
    console.log(`Applications    : 1`);
    console.log("------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
