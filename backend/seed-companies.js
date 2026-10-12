const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const User = require("./models/User");
const Job = require("./models/Job");
const EmployerProfile = require("./models/EmployerProfile");

const COMPANIES_DATA = [
  {
    name: "Google",
    email: "google@jobportal.demo",
    password: "Google#26",
    location: "Bangalore / Hyderabad, India",
    industry: "Internet & Technology",
    website: "https://about.google",
    companySize: "10,000+ Employees",
    description: "Google is an American multinational technology company focusing on search, cloud computing, software, and hardware.",
    jobs: [
      {
        title: "Senior Cloud Solutions Architect",
        description: "Design and implement scalable enterprise cloud architectures on Google Cloud Platform (GCP).",
        requirements: ["5+ years experience in GCP", "Kubernetes", "Distributed systems architecture"],
        skills: ["GCP", "Kubernetes", "Go", "Java", "Cloud Architecture"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "35 - 50 LPA",
        experience: "5+ Years",
      },
      {
        title: "Frontend Software Engineer (React / TypeScript)",
        description: "Build accessible, ultra-responsive user interfaces for next-generation Google Web platforms.",
        requirements: ["3+ years React", "TypeScript", "Web performance optimization"],
        skills: ["React", "TypeScript", "CSS3", "Redux", "Jest"],
        location: "Hyderabad, India",
        jobType: "Full Time",
        salary: "24 - 36 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Amazon",
    email: "amazon@jobportal.demo",
    password: "Amazon#26",
    location: "Hyderabad / Bangalore, India",
    industry: "E-Commerce & Cloud Computing",
    website: "https://amazon.jobs",
    companySize: "10,000+ Employees",
    description: "Amazon is an American technology company focusing on e-commerce, cloud computing (AWS), and AI.",
    jobs: [
      {
        title: "Software Development Engineer II (SDE II)",
        description: "Design and deliver scalable web-scale backend microservices powering AWS retail ordering workflows.",
        requirements: ["4+ years in Java/Spring Boot", "AWS (DynamoDB, SQS, ECS)", "Microservices"],
        skills: ["Java", "Spring Boot", "AWS", "DynamoDB", "Microservices"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "28 - 42 LPA",
        experience: "3+ Years",
      },
      {
        title: "AWS DevOps Engineer",
        description: "Automate CI/CD pipelines and infrastructure as code across multi-region AWS environments.",
        requirements: ["Terraform", "Docker & Kubernetes", "AWS CDK & Python"],
        skills: ["AWS", "Terraform", "Docker", "Kubernetes", "CI/CD"],
        location: "Hyderabad, India",
        jobType: "Full Time",
        salary: "20 - 32 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Mindtree",
    email: "mindtree@jobportal.demo",
    password: "Mindtree#26",
    location: "Bangalore / Chennai, India",
    industry: "IT Services & Consulting",
    website: "https://www.ltimindtree.com",
    companySize: "5,000-10,000 Employees",
    description: "Mindtree delivers digital transformation and technology services from ideation to execution for global clients.",
    jobs: [
      {
        title: "Full Stack Java Developer",
        description: "Develop enterprise fintech web applications using Java Spring Boot and React.",
        requirements: ["Java 17", "Spring Boot", "React", "PostgreSQL"],
        skills: ["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "12 - 18 LPA",
        experience: "1-3 Years",
      },
    ],
  },
  {
    name: "Cognizant",
    email: "cognizant@jobportal.demo",
    password: "Cognizant#26",
    location: "Chennai / Hyderabad, India",
    industry: "IT Services & Consulting",
    website: "https://www.cognizant.com",
    companySize: "10,000+ Employees",
    description: "Cognizant engineers modern businesses to improve everyday life through digital transformation and consulting.",
    jobs: [
      {
        title: "Senior React / Node.js Developer",
        description: "Build robust full-stack enterprise portals for international healthcare and banking clients.",
        requirements: ["Node.js & Express", "React & Redux", "MongoDB or SQL"],
        skills: ["Node.js", "React", "MongoDB", "Express", "REST APIs"],
        location: "Chennai, India",
        jobType: "Full Time",
        salary: "14 - 22 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Capgemini",
    email: "capgemini@jobportal.demo",
    password: "Capgemini#26",
    location: "Mumbai / Pune, India",
    industry: "Consulting & IT Services",
    website: "https://www.capgemini.com",
    companySize: "10,000+ Employees",
    description: "Capgemini is a global leader in partnering with companies to transform and manage their business through technology.",
    jobs: [
      {
        title: "Cloud Infrastructure Specialist",
        description: "Design Azure and AWS hybrid cloud hosting architectures for multinational enterprise customers.",
        requirements: ["Azure", "Terraform", "Kubernetes", "Linux"],
        skills: ["Azure", "Terraform", "Docker", "Kubernetes", "CI/CD"],
        location: "Pune, India",
        jobType: "Full Time",
        salary: "15 - 24 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Tata Consultancy Services (TCS)",
    email: "tcs@jobportal.demo",
    password: "Tcs#2026",
    location: "Mumbai / Chennai / Bangalore, India",
    industry: "IT Services & Consulting",
    website: "https://www.tcs.com",
    companySize: "10,000+ Employees",
    description: "Tata Consultancy Services is an Indian multinational IT services and consulting company, part of the Tata group.",
    jobs: [
      {
        title: "Systems Engineer (Full Stack)",
        description: "Develop enterprise web portals, microservices, and automated testing frameworks.",
        requirements: ["Java or Python", "React or Angular", "Relational Databases"],
        skills: ["Java", "React", "SQL", "Git", "Agile"],
        location: "Mumbai, India",
        jobType: "Full Time",
        salary: "8 - 14 LPA",
        experience: "1-3 Years",
      },
      {
        title: "Data Analyst & BI Developer",
        description: "Analyze large business datasets and develop interactive Power BI / Tableau dashboards.",
        requirements: ["SQL", "Python", "Power BI", "Data Modeling"],
        skills: ["SQL", "Power BI", "Python", "Tableau", "Analytics"],
        location: "Chennai, India",
        jobType: "Full Time",
        salary: "10 - 16 LPA",
        experience: "1-3 Years",
      },
    ],
  },
  {
    name: "Microsoft",
    email: "microsoft@jobportal.demo",
    password: "Microsoft#26",
    location: "Hyderabad / Bangalore / Noida, India",
    industry: "Software & Cloud Computing",
    website: "https://careers.microsoft.com",
    companySize: "10,000+ Employees",
    description: "Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.",
    jobs: [
      {
        title: "Azure Cloud Solutions Architect",
        description: "Partner with enterprise customers to design resilient, secure cloud architectures on Microsoft Azure.",
        requirements: ["Azure Architecture", "C# / .NET or Node.js", "Kubernetes"],
        skills: ["Azure", "C#", ".NET Core", "Kubernetes", "Microservices"],
        location: "Hyderabad, India",
        jobType: "Full Time",
        salary: "32 - 48 LPA",
        experience: "5+ Years",
      },
      {
        title: "Full Stack Software Engineer",
        description: "Contribute to core developer tooling and Microsoft 365 collaborative experiences.",
        requirements: ["TypeScript", "React", "Node.js or C#"],
        skills: ["TypeScript", "React", "Node.js", "Git", "REST APIs"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "25 - 38 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Tata",
    email: "tata@jobportal.demo",
    password: "TataGroup#26",
    location: "Mumbai, India",
    industry: "Conglomerate & Technology",
    website: "https://www.tata.com",
    companySize: "10,000+ Employees",
    description: "Tata Group is a global enterprise headquartered in India, comprising 30 companies across 10 verticals.",
    jobs: [
      {
        title: "Digital Business Transformation Analyst",
        description: "Drive digital modernization programs across group companies utilizing modern cloud platforms.",
        requirements: ["Business analysis", "Agile frameworks", "Technical architecture"],
        skills: ["Business Analysis", "Agile", "Cloud", "Project Management"],
        location: "Mumbai, India",
        jobType: "Full Time",
        salary: "16 - 25 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Infosys",
    email: "infosys@jobportal.demo",
    password: "Infosys#26",
    location: "Bangalore / Pune / Hyderabad, India",
    industry: "IT Services & Consulting",
    website: "https://www.infosys.com",
    companySize: "10,000+ Employees",
    description: "Infosys is a global leader in next-generation digital services and consulting.",
    jobs: [
      {
        title: "Associate Software Engineer",
        description: "Build robust, scalable software components in modern JavaScript and Java stacks.",
        requirements: ["JavaScript", "React or Node.js", "SQL & Git"],
        skills: ["JavaScript", "Node.js", "React", "SQL", "Git"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "8 - 12 LPA",
        experience: "1-3 Years",
      },
    ],
  },
  {
    name: "Accenture",
    email: "accenture@jobportal.demo",
    password: "Accenture#26",
    location: "Bangalore / Gurgaon / Mumbai, India",
    industry: "Professional Services & IT",
    website: "https://www.accenture.com",
    companySize: "10,000+ Employees",
    description: "Accenture is a leading global professional services company providing consulting and technology services.",
    jobs: [
      {
        title: "Senior Technology Consultant",
        description: "Advise Fortune 500 clients on cloud modernization, system integrations, and agile workflows.",
        requirements: ["5+ years full stack engineering", "Cloud technologies", "Microservices"],
        skills: ["Consulting", "Architecture", "Cloud", "Java", "React"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "20 - 30 LPA",
        experience: "5+ Years",
      },
    ],
  },
  {
    name: "IBM",
    email: "ibm@jobportal.demo",
    password: "IbmCorp#26",
    location: "Bangalore / Kochi / Hyderabad, India",
    industry: "Information Technology & AI",
    website: "https://www.ibm.com",
    companySize: "10,000+ Employees",
    description: "IBM produces computer hardware and software, and offers hybrid cloud, quantum computing, and AI services.",
    jobs: [
      {
        title: "AI / ML Solutions Engineer",
        description: "Deploy generative AI and machine learning models using IBM watsonx and open source AI toolkits.",
        requirements: ["Python", "PyTorch", "LangChain", "Vector databases"],
        skills: ["Python", "Machine Learning", "AI", "PyTorch", "Docker"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "22 - 35 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Oracle",
    email: "oracle@jobportal.demo",
    password: "Oracle#26",
    location: "Bangalore / Hyderabad / Noida, India",
    industry: "Database & Cloud Infrastructure",
    website: "https://www.oracle.com",
    companySize: "10,000+ Employees",
    description: "Oracle offers integrated suites of applications plus secure, autonomous infrastructure in Oracle Cloud.",
    jobs: [
      {
        title: "Database Infrastructure Engineer",
        description: "Optimize high-availability Oracle Database clusters and autonomous cloud database instances.",
        requirements: ["Oracle Database 19c", "PL/SQL", "Linux performance tuning"],
        skills: ["Oracle DB", "SQL", "PL/SQL", "Linux", "Cloud"],
        location: "Hyderabad, India",
        jobType: "Full Time",
        salary: "18 - 28 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "HCLTech",
    email: "hcltech@jobportal.demo",
    password: "Hcltech#26",
    location: "Noida / Chennai / Bangalore, India",
    industry: "IT Services & Digital Products",
    website: "https://www.hcltech.com",
    companySize: "10,000+ Employees",
    description: "HCLTech is a global technology company home to 220,000+ people delivering industry-leading digital engineering.",
    jobs: [
      {
        title: "Network Security Engineer",
        description: "Maintain enterprise network security posture, firewalls, and zero-trust remote access architecture.",
        requirements: ["CCNA / CCNP", "Firewalls", "VPNs & zero-trust"],
        skills: ["Networking", "Firewalls", "Security", "Linux", "VPN"],
        location: "Noida, India",
        jobType: "Full Time",
        salary: "12 - 20 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Tech Mahindra",
    email: "techmahindra@jobportal.demo",
    password: "TechMah#26",
    location: "Pune / Hyderabad / Bangalore, India",
    industry: "Telecommunications & IT Services",
    website: "https://www.techmahindra.com",
    companySize: "10,000+ Employees",
    description: "Tech Mahindra delivers customer-centric digital experiences enabling 5G and enterprise transformation.",
    jobs: [
      {
        title: "Telecom 5G Software Engineer",
        description: "Develop 5G core network protocol handlers and real-time telecommunications billing components.",
        requirements: ["C++", "Linux systems", "Socket programming", "Multi-threading"],
        skills: ["C++", "Linux", "Telecom", "5G Protocols", "Sockets"],
        location: "Pune, India",
        jobType: "Full Time",
        salary: "14 - 22 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "LTIMindtree",
    email: "ltimindtree@jobportal.demo",
    password: "LtiMind#26",
    location: "Mumbai / Bangalore / Chennai, India",
    industry: "Digital Solutions & IT Services",
    website: "https://www.ltimindtree.com",
    companySize: "10,000+ Employees",
    description: "LTIMindtree enables businesses to reimagine customer journeys and accelerate business growth.",
    jobs: [
      {
        title: "Full Stack Engineer (Node & React)",
        description: "Develop modern web interfaces and secure backend API gateways for global enterprise clients.",
        requirements: ["Node.js & Express", "React", "MongoDB / SQL"],
        skills: ["Node.js", "React", "Express", "MongoDB", "JavaScript"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "13 - 21 LPA",
        experience: "1-3 Years",
      },
    ],
  },
  {
    name: "Deloitte",
    email: "deloitte@jobportal.demo",
    password: "Deloitte#26",
    location: "Hyderabad / Bangalore / Mumbai, India",
    industry: "Consulting & Technology Advisory",
    website: "https://www.deloitte.com",
    companySize: "10,000+ Employees",
    description: "Deloitte provides audit, consulting, tax, and advisory services to premier multinational brands.",
    jobs: [
      {
        title: "Technology Advisory Consultant",
        description: "Lead enterprise architecture reviews and evaluate cloud adoption strategies for clients.",
        requirements: ["IT strategy", "Enterprise architecture", "Agile transformation"],
        skills: ["Advisory", "IT Strategy", "Cloud", "Architecture", "Consulting"],
        location: "Hyderabad, India",
        jobType: "Full Time",
        salary: "18 - 28 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "NVIDIA",
    email: "nvidia@jobportal.demo",
    password: "Nvidia#26",
    location: "Bangalore / Pune / Hyderabad, India",
    industry: "Semiconductors & AI Computing",
    website: "https://www.nvidia.com",
    companySize: "10,000+ Employees",
    description: "NVIDIA invented the GPU and leads the global computing landscape in artificial intelligence and graphics.",
    jobs: [
      {
        title: "Deep Learning Systems Engineer",
        description: "Optimize tensor execution, deep learning inference pipelines, and CUDA kernels for AI clusters.",
        requirements: ["CUDA & C++", "Python & PyTorch", "GPU architecture"],
        skills: ["CUDA", "C++", "PyTorch", "Deep Learning", "GPU"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "35 - 55 LPA",
        experience: "5+ Years",
      },
    ],
  },
  {
    name: "Flipkart",
    email: "flipkart@jobportal.demo",
    password: "Flipkart#26",
    location: "Bangalore, India",
    industry: "E-Commerce & Supply Chain",
    website: "https://www.flipkartcareers.com",
    companySize: "10,000+ Employees",
    description: "Flipkart is India's premier digital commerce marketplace empowering millions of merchants and consumers.",
    jobs: [
      {
        title: "Backend Platform Engineer",
        description: "Build ultra high-throughput microservices handling millions of concurrent orders during Big Billion Days.",
        requirements: ["Java & Spring Boot", "Kafka & Redis", "Distributed systems"],
        skills: ["Java", "Spring Boot", "Kafka", "Redis", "Microservices"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "25 - 40 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Adobe",
    email: "adobe@jobportal.demo",
    password: "AdobeSys#26",
    location: "Noida / Bangalore, India",
    industry: "Creative Software & Cloud",
    website: "https://www.adobe.com",
    companySize: "10,000+ Employees",
    description: "Adobe is the global leader in digital media and digital marketing software applications.",
    jobs: [
      {
        title: "UI / UX Frontend Developer",
        description: "Develop seamless vector editing and creative canvas tools for Adobe Creative Cloud on the web.",
        requirements: ["JavaScript ES6+", "HTML5 Canvas or WebGL", "React & modern CSS"],
        skills: ["JavaScript", "React", "Canvas", "CSS3", "WebGL"],
        location: "Noida, India",
        jobType: "Full Time",
        salary: "22 - 34 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Cisco",
    email: "cisco@jobportal.demo",
    password: "CiscoNet#26",
    location: "Bangalore, India",
    industry: "Networking Hardware & Security",
    website: "https://www.cisco.com",
    companySize: "10,000+ Employees",
    description: "Cisco designs and sells networking, cloud, and security products and services.",
    jobs: [
      {
        title: "Cloud Security Software Engineer",
        description: "Develop automated vulnerability scanning and security telemetry pipelines for Cisco Secure cloud.",
        requirements: ["Go or Python", "Docker & Kubernetes", "Linux security & cryptography"],
        skills: ["Go", "Python", "Kubernetes", "Security", "Linux"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "20 - 32 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Intel",
    email: "intel@jobportal.demo",
    password: "IntelChip#26",
    location: "Bangalore, India",
    industry: "Semiconductors & Hardware",
    website: "https://www.intel.com",
    companySize: "10,000+ Employees",
    description: "Intel creates world-changing technology that enables global progress through advanced semiconductor computing.",
    jobs: [
      {
        title: "Firmware / Embedded Software Engineer",
        description: "Develop low-level BIOS/UEFI firmware and driver interfaces for next-generation Intel processor architectures.",
        requirements: ["C & Assembly", "UEFI / BIOS", "Device drivers & hardware debugging"],
        skills: ["C", "Assembly", "Firmware", "Embedded", "Linux"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "18 - 30 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "SAP",
    email: "sap@jobportal.demo",
    password: "SapLabs#26",
    location: "Bangalore / Gurgaon, India",
    industry: "Enterprise Software & ERP",
    website: "https://www.sap.com",
    companySize: "10,000+ Employees",
    description: "SAP is a global leader in enterprise software, helping companies run intelligent enterprise resource planning.",
    jobs: [
      {
        title: "Cloud Application Developer (SAP BTP)",
        description: "Develop enterprise cloud extensions on SAP Business Technology Platform using Node.js and TypeScript.",
        requirements: ["Node.js", "SAP CAP / CDS", "SAP HANA & REST APIs"],
        skills: ["Node.js", "TypeScript", "SAP BTP", "HANA", "Cloud"],
        location: "Bangalore, India",
        jobType: "Full Time",
        salary: "17 - 27 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Salesforce",
    email: "salesforce@jobportal.demo",
    password: "Salesforce#26",
    location: "Hyderabad / Bangalore / Mumbai, India",
    industry: "CRM & Cloud Platforms",
    website: "https://www.salesforce.com",
    companySize: "10,000+ Employees",
    description: "Salesforce is the world's leading CRM software provider empowering companies to connect with customers.",
    jobs: [
      {
        title: "Lightning Web Component (LWC) Developer",
        description: "Develop responsive, modular customer experience components on Salesforce Service Cloud.",
        requirements: ["Apex & SOQL", "JavaScript (LWC)", "Salesforce configuration"],
        skills: ["Apex", "LWC", "Salesforce", "JavaScript", "CRM"],
        location: "Hyderabad, India",
        jobType: "Full Time",
        salary: "18 - 28 LPA",
        experience: "3+ Years",
      },
    ],
  },
  {
    name: "Zoho",
    email: "zoho@jobportal.demo",
    password: "ZohoCorp#26",
    location: "Chennai / Tenkasi, India",
    industry: "SaaS & Business Software",
    website: "https://www.zoho.com",
    companySize: "10,000+ Employees",
    description: "Zoho offers 55+ SaaS applications powering over 100 million users worldwide.",
    jobs: [
      {
        title: "Frontend Engineer (Modern Web)",
        description: "Craft high-performance, lightweight UI components for Zoho suite with clean engineering.",
        requirements: ["Vanilla JavaScript", "HTML5 & CSS Grid", "Data structures & algorithms"],
        skills: ["JavaScript", "HTML5", "CSS3", "DOM", "Performance"],
        location: "Chennai, India",
        jobType: "Full Time",
        salary: "12 - 20 LPA",
        experience: "1-3 Years",
      },
    ],
  },
  {
    name: "Samsung",
    email: "samsung@jobportal.demo",
    password: "Samsung#26",
    location: "Noida / Bangalore, India",
    industry: "Consumer Electronics & Research",
    website: "https://www.samsung.com",
    companySize: "10,000+ Employees",
    description: "Samsung R&D Institute India builds next-generation AI and mobile software for Galaxy devices worldwide.",
    jobs: [
      {
        title: "Android Framework Software Engineer",
        description: "Develop core OS frameworks, multimedia pipelines, and One UI optimizations for flagship Galaxy devices.",
        requirements: ["Android SDK / NDK", "Kotlin & Java", "OS architecture & multi-threading"],
        skills: ["Android", "Kotlin", "Java", "C++", "Mobile"],
        location: "Noida, India",
        jobType: "Full Time",
        salary: "18 - 30 LPA",
        experience: "3+ Years",
      },
    ],
  },
];

async function seedCompaniesAndAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/JobPortalData";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for company & admin seeding.");

    // 1. SUPER ADMIN CONFIGURATION
    const adminEmail = "admin@jobportal.demo";
    const adminPasswordPlain = "Admin@26";
    const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 10);

    let adminUser = await User.findOne({
      $or: [{ email: adminEmail }, { email: "admin@example.com" }, { role: "admin" }],
    });

    if (adminUser) {
      adminUser.fullName = "Super Administrator";
      adminUser.email = adminEmail;
      adminUser.password = adminPasswordHash;
      adminUser.role = "admin";
      adminUser.isActive = true;
      adminUser.isBlocked = false;
      await adminUser.save();
      console.log(`Updated existing admin to: ${adminEmail}`);
    } else {
      adminUser = await User.create({
        fullName: "Super Administrator",
        email: adminEmail,
        password: adminPasswordHash,
        role: "admin",
        isActive: true,
        isBlocked: false,
      });
      console.log(`Created new admin: ${adminEmail}`);
    }

    // 2. CLEANUP UNWANTED TEST RECORDS (Shivani S, Wipro, Aditi, and old duplicate careers@ accounts)
    const testEmails = [
      "shivani24@gmail.com",
      "wipro@gmail.com",
      "aditi@gmail.com",
      "careers@google.com",
      "careers@microsoft.com",
      "careers@amazon.com",
      "careers@accenture.com",
      "careers@infosys.com",
      "careers@tcs.com",
    ];

    const testUsers = await User.find({
      $or: [
        { email: { $in: testEmails } },
        { fullName: { $regex: /^(Shivani|Wipro|Aditi)/i } },
      ],
      role: "employer",
    });

    for (const tu of testUsers) {
      console.log(`Removing test employer: ${tu.fullName} (${tu.email})`);
      await EmployerProfile.deleteOne({ user: tu._id });
      await Job.deleteMany({ employer: tu._id });
      await User.findByIdAndDelete(tu._id);
    }

    await EmployerProfile.deleteMany({
      $or: [
        { companyName: { $regex: /^(Shivani|Wipro|Aditi)/i } },
        { email: { $in: testEmails } },
      ],
    });
    await Job.deleteMany({
      company: { $regex: /^(Shivani|Wipro|Aditi)/i },
    });

    // 3. SEED 25 PREMIER ENTERPRISE COMPANIES
    const demoCredentials = [
      {
        role: "admin",
        company: "Platform Administration",
        email: adminEmail,
        password: adminPasswordPlain,
        description: "Super Administrator Portal Account",
      },
    ];

    for (const c of COMPANIES_DATA) {
      const passwordHash = await bcrypt.hash(c.password, 10);

      let employer = await User.findOne({
        $or: [{ email: c.email.toLowerCase() }, { fullName: c.name }],
        role: "employer",
      });

      if (employer) {
        employer.fullName = c.name;
        employer.email = c.email.toLowerCase();
        employer.password = passwordHash;
        employer.role = "employer";
        employer.isActive = true;
        employer.isBlocked = false;
        await employer.save();
      } else {
        employer = await User.create({
          fullName: c.name,
          email: c.email.toLowerCase(),
          password: passwordHash,
          role: "employer",
          isActive: true,
          isBlocked: false,
        });
      }

      await EmployerProfile.findOneAndUpdate(
        { user: employer._id },
        {
          $set: {
            user: employer._id,
            companyName: c.name,
            email: c.email.toLowerCase(),
            location: c.location,
            industry: c.industry,
            website: c.website,
            companySize: c.companySize,
            description: c.description,
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      for (const j of c.jobs) {
        const existingJob = await Job.findOne({
          employer: employer._id,
          title: j.title,
        });

        if (!existingJob) {
          await Job.create({
            employer: employer._id,
            title: j.title,
            company: c.name,
            location: j.location,
            jobType: j.jobType || "Full Time",
            experience: j.experience || "3+ Years",
            salary: j.salary || "Competitive",
            skills: j.skills || ["Software Development"],
            description: j.description,
            requirements: j.requirements || ["Degree in CS or related field"],
            status: "Active",
          });
        }
      }

      demoCredentials.push({
        role: "employer",
        company: c.name,
        email: c.email.toLowerCase(),
        password: c.password,
        location: c.location,
      });

      console.log(`✓ Seeded company: ${c.name} (${c.email})`);
    }

    // 4. WRITE LOCAL CREDENTIALS FILE (.credentials-demo.json)
    const credsPath = path.join(__dirname, ".credentials-demo.json");
    fs.writeFileSync(credsPath, JSON.stringify(demoCredentials, null, 2), "utf8");
    console.log(`\n✓ Saved ${demoCredentials.length} demo credentials to ${credsPath}`);

    const totalCompanies = await EmployerProfile.countDocuments();
    const totalJobs = await Job.countDocuments();
    console.log(`\n=== SEEDING SUMMARY ===`);
    console.log(`Total Companies in DB: ${totalCompanies}`);
    console.log(`Total Jobs in DB: ${totalJobs}`);
    console.log(`Admin email: ${adminEmail} (password: ${adminPasswordPlain})`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedCompaniesAndAdmin();
