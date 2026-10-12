# JobPortal – Full-Stack MERN Application

A modern, responsive, full-stack Job Portal built using React 19, Vite, React Router, Node.js, Express, and MongoDB with Mongoose and JWT authentication.

---

## Features

### 1. Authentication & Security
- **Secure Registration & Login**: Real-time validation, password hashing with bcryptjs (10 rounds), and JSON Web Token (JWT) issuing.
- **Registration Success Modal**: Clean, animated success popup confirming account creation in MongoDB before redirection.
- **Duplicate Protection**: User-friendly validation preventing duplicate email registrations.
- **Role-Based Authorization**: Independent views, permissions, and dashboards for Candidates, Employers, and Administrators.

### 2. Candidate (Jobseeker) Features
- **Job Search & Filters**: Search jobs in real-time by keywords/skills, location, job type (Full Time, Part Time, Internship), and experience level (Fresher, 1-3 Years, 3+ Years).
- **Job Details View**: Full job descriptions, key responsibilities, required skills, and salary overviews.
- **One-Click Application**: Direct modal application submission with resume link and cover letter.
- **Duplicate Application Prevention**: Indexed MongoDB constraints preventing duplicate applications to the same job.
- **Candidate Dashboard**:
  - **My Applications**: Track all submitted applications with dynamic status badges (`Applied`, `Shortlisted`, `Accepted`, `Rejected`).
  - **Profile & Resume**: Update headline, contact phone, location, skills, education, experience, and portfolio.
  - **Notifications**: Real-time alerts when employers update application status.

### 3. Employer Features
- **Job Management**: Post new job listings with full details, edit active postings, and delete filled roles.
- **Candidate Review**: View all candidate applications for posted jobs with contact information, cover letters, and resume links.
- **Status Updates**: Update application status (`Applied`, `Shortlisted`, `Accepted`, `Rejected`) with instant candidate notifications.
- **Company Profile**: Customize company branding, industry, location, company size, website, and description.

### 4. Administrator Features
- **Platform Analytics**: Total users, candidates, employers, active jobs, and total applications.
- **User Moderation**: View all registered users with role tags and delete accounts.
- **Job Oversight**: Review and moderate all job postings across the portal.

---

## Technology Stack

- **Frontend**: React 19, Vite, React Router 7, Native Fetch with JWT interceptor
- **Backend**: Node.js, Express.js 5, Mongoose 9, JWT (jsonwebtoken), bcryptjs, CORS, dotenv
- **Database**: MongoDB (Local or Atlas)

---

## Test Accounts (Ready for Live Demonstration)

| Role | Email | Password |
|---|---|---|
| **Candidate** | `jobseeker@example.com` | `password123` |
| **Employer** | `employer@example.com` | `password123` |
| **Admin** | `admin@example.com` | `password123` |

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
node seed.js    # Seeds database with test accounts, jobs, and companies
npm start       # Starts backend server at http://localhost:5000
```

Backend Environment (`backend/.env`):
```env
MONGO_URI=mongodb://127.0.0.1:27017/JobPortalData
PORT=5000
JWT_SECRET=jobportal_secret_key_123
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server at http://localhost:5173
```

Frontend Environment (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /register` – Register a new candidate or employer
- `POST /login` – Authenticate user and receive JWT
- `GET /me` – Retrieve current authenticated user profile

### Jobs (`/api/jobs`)
- `GET /` – Get all jobs with query filters (`keyword`, `location`, `jobType`, `experience`)
- `GET /:id` – Get job by ID
- `GET /my-jobs` – Get jobs posted by logged-in employer
- `POST /` – Create a new job listing (Employer/Admin)
- `PUT /:id` – Update job listing (Owner/Admin)
- `DELETE /:id` – Delete job listing (Owner/Admin)

### Applications (`/api/applications`)
- `POST /apply/:jobId` – Apply for a job (Candidate)
- `GET /check/:jobId` – Check if current candidate has applied
- `GET /my-applications` – List candidate's submitted applications
- `GET /employer-applications` – List applications for employer's jobs
- `PATCH /:id/status` – Update application status (Employer/Admin)

### Profiles & Companies (`/api/profiles`)
- `GET /candidate/me` – Get candidate profile
- `PUT /candidate/me` – Update candidate profile
- `GET /employer/me` – Get employer profile
- `PUT /employer/me` – Update employer profile
- `GET /companies` – Directory of companies with active job counts
- `GET /companies/:id` – Company details and active jobs
- `GET /notifications` – User notifications
- `PATCH /notifications/read-all` – Mark all notifications read

### Administration (`/api/admin`)
- `GET /stats` – Platform analytics and KPI counts
- `GET /users` – List all users
- `DELETE /users/:id` – Delete user
- `GET /jobs` – List all jobs
- `GET /applications` – List all applications
