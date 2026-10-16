const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg =
        data.message ||
        (Array.isArray(data.errors) ? data.errors.join(", ") : null) ||
        `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      const connErr = new Error("Unable to connect to the backend server. Please check your connection.");
      connErr.status = 0;
      throw connErr;
    }
    throw error;
  }
};

// ================= AUTH API =================
export const authAPI = {
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getMe: () => apiRequest("/auth/me"),
};

// ================= JOBS API =================
export const jobAPI = {
  getAllJobs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/jobs${queryString}`);
  },

  getJobById: (id) => apiRequest(`/jobs/${id}`),

  createJob: (jobData) =>
    apiRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    }),

  updateJob: (id, jobData) =>
    apiRequest(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    }),

  deleteJob: (id) =>
    apiRequest(`/jobs/${id}`, {
      method: "DELETE",
    }),

  updateJobStatus: (id, status) =>
    apiRequest(`/jobs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getMyJobs: () => apiRequest("/jobs/my-jobs"),
};

// ================= APPLICATIONS API =================
export const applicationAPI = {
  apply: (jobId, applicationData) =>
    apiRequest(`/applications/apply/${jobId}`, {
      method: "POST",
      body: JSON.stringify(applicationData || {}),
    }),

  checkStatus: (jobId) => apiRequest(`/applications/check/${jobId}`),

  getMyApplications: () => apiRequest("/applications/my-applications"),

  getEmployerApplications: () => apiRequest("/applications/employer-applications"),

  updateStatus: (id, status, notes = "") =>
    apiRequest(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    }),
};

// ================= PROFILE API =================
export const profileAPI = {
  getCandidateProfile: () => apiRequest("/profiles/candidate/me"),

  updateCandidateProfile: (profileData) =>
    apiRequest("/profiles/candidate/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  getEmployerProfile: () => apiRequest("/profiles/employer/me"),

  updateEmployerProfile: (profileData) =>
    apiRequest("/profiles/employer/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  getAllCompanies: (search = "") => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`/profiles/companies${qs}`);
  },

  getCompanyDetails: (id) => apiRequest(`/profiles/companies/${id}`),

  getCandidateResume: () => apiRequest("/profiles/candidate/resume"),

  uploadCandidateResume: (resumeData) =>
    apiRequest("/profiles/candidate/resume", {
      method: "POST",
      body: JSON.stringify(resumeData),
    }),
};

// ================= NOTIFICATIONS API =================
export const notificationAPI = {
  getNotifications: () => apiRequest("/profiles/notifications"),

  markAsRead: (id) =>
    apiRequest(`/profiles/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiRequest("/profiles/notifications/read-all", {
      method: "PATCH",
    }),
};

// ================= CONTACT API =================
export const contactAPI = {
  submitContactMessage: (messageData) =>
    apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),
};

// ================= ADMIN API =================
export const adminAPI = {
  getStats: () => apiRequest("/admin/stats"),
  getCandidates: () => apiRequest("/admin/candidates"),
  getCandidateDetails: (id) => apiRequest(`/admin/candidates/${id}`),
  getCompanies: () => apiRequest("/admin/companies"),
  getCompanyDetails: (id) => apiRequest(`/admin/companies/${id}`),
  toggleUserStatus: (id) =>
    apiRequest(`/admin/users/${id}/toggle-status`, {
      method: "PATCH",
    }),
  blockEmployer: (id, reason = "") =>
    apiRequest(`/admin/employers/${id}/block`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
  unblockEmployer: (id) =>
    apiRequest(`/admin/employers/${id}/unblock`, {
      method: "PATCH",
    }),
  getUsers: () => apiRequest("/admin/users"),
  deleteUser: (id) =>
    apiRequest(`/admin/users/${id}`, {
      method: "DELETE",
    }),
  getJobs: () => apiRequest("/admin/jobs"),
  getApplications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/admin/applications${qs ? `?${qs}` : ""}`);
  },
  getMessages: () => apiRequest("/admin/messages"),
  markMessageRead: (id) =>
    apiRequest(`/admin/messages/${id}/read`, {
      method: "PATCH",
    }),
  deleteMessage: (id) =>
    apiRequest(`/admin/messages/${id}`, {
      method: "DELETE",
    }),
};

export default {
  auth: authAPI,
  jobs: jobAPI,
  applications: applicationAPI,
  profiles: profileAPI,
  notifications: notificationAPI,
  contact: contactAPI,
  admin: adminAPI,
};
