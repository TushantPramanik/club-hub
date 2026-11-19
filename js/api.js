// js/api.js - Unified Client for ClubHub REST API Backend

const API = {
  baseUrl: (function() {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol;
      const host = window.location.hostname;
      const port = window.location.port;
      // If served directly via file://, target localhost:8000
      if (protocol === "file:") {
        return "http://127.0.0.1:8000";
      }
      // If browsing from any separate local dev server (Live Server, Vite, etc.) on any port other than 8000
      if ((host === "localhost" || host === "127.0.0.1" || host === "::1") && port !== "8000") {
        return "http://127.0.0.1:8000";
      }
    }
    return "";
  })(),

  getToken() {
    return localStorage.getItem("clubhub_token") || null;
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem("clubhub_user");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setAuth(token, user) {
    if (token) localStorage.setItem("clubhub_token", token);
    if (user) localStorage.setItem("clubhub_user", JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem("clubhub_token");
    localStorage.removeItem("clubhub_user");
  },

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === "object" && (typeof FormData === "undefined" || !(options.body instanceof FormData))) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }

    try {
      const res = await fetch(url, { ...options, headers });
      
      if (res.status === 401) {
        // If unauthorized and not hitting login, clear invalid session
        if (!endpoint.includes("/auth/login")) {
          this.clearAuth();
        }
      }

      const contentType = res.headers.get("content-type");
      let data = null;
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          data = null;
        }
      } else {
        try {
          data = await res.text();
        } catch (e) {
          data = null;
        }
      }

      if (!res.ok) {
        let errorMsg = (data && data.detail) || (data && data.message);
        if (!errorMsg && typeof data === "string" && data.trim() && !data.trim().startsWith("<")) {
          errorMsg = data;
        }
        if (!errorMsg) {
          if (res.status === 401) {
            errorMsg = "Invalid email address or password. Please verify your credentials.";
          } else if (res.status === 403) {
            errorMsg = "Access forbidden. You do not have permission for this action.";
          } else if (res.status === 404) {
            errorMsg = "Requested resource not found.";
          } else if (res.status >= 500) {
            errorMsg = "Server error occurred. Please try again shortly.";
          } else {
            errorMsg = res.statusText || "Request failed";
          }
        }
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  // ---------------- AUTHENTICATION ----------------
  async register(payload) {
    const res = await this.request("/auth/register", {
      method: "POST",
      body: payload
    });
    this.setAuth(res.access_token, res.user);
    return res;
  },

  async login(email, password, section = null) {
    const payload = { email, password };
    if (section) payload.section = section;
    const res = await this.request("/auth/login", {
      method: "POST",
      body: payload
    });
    this.setAuth(res.access_token, res.user);
    return res;
  },

  async getMe() {
    const user = await this.request("/auth/me");
    if (user) {
      localStorage.setItem("clubhub_user", JSON.stringify(user));
    }
    return user;
  },

  async getProfile() {
    const user = await this.request("/students/profile");
    if (user) {
      localStorage.setItem("clubhub_user", JSON.stringify(user));
    }
    return user;
  },

  async updateProfile(payload) {
    const updated = await this.request("/students/profile", {
      method: "PATCH",
      body: payload
    });
    if (updated) {
      localStorage.setItem("clubhub_user", JSON.stringify(updated));
    }
    return updated;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.request("/upload", {
      method: "POST",
      body: formData
    });
  },

  logout() {
    this.clearAuth();
  },

  // ---------------- DASHBOARD & STATS ----------------
  async getPublicStats() {
    try {
      return await this.request("/dashboard/public");
    } catch (e) {
      return {
        total_clubs: 0,
        total_students: 0,
        total_events: 0,
        total_memberships: 0
      };
    }
  },

  async getStudentDashboardStats() {
    return await this.request("/dashboard/student");
  },

  async getCoordinatedClubs() {
    return await this.request("/dashboard/coordinator-clubs");
  },

  async getMyClubs() {
    return await this.request("/students/my-clubs");
  },

  // ---------------- CLUBS ----------------
  async getClubs(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== "all") query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    if (params.recruitment_open !== undefined && params.recruitment_open !== "ALL") {
      query.set("recruitment_open", params.recruitment_open === "OPEN" || params.recruitment_open === true);
    }
    if (params.sort) query.set("sort", params.sort);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await this.request(`/clubs${qs}`);
  },

  async getClub(id) {
    return await this.request(`/clubs/${id}`);
  },

  async createClub(payload) {
    return await this.request("/clubs", {
      method: "POST",
      body: payload
    });
  },

  async updateClub(id, payload) {
    return await this.request(`/clubs/${id}`, {
      method: "PATCH",
      body: payload
    });
  },

  async toggleClubRecruitment(id, recruitment_open) {
    return await this.request(`/clubs/${id}/recruitment`, {
      method: "PATCH",
      body: { recruitment_open }
    });
  },

  async deleteClub(id) {
    return await this.request(`/clubs/${id}`, {
      method: "DELETE"
    });
  },

  async getClubMembers(id) {
    return await this.request(`/clubs/${id}/members`);
  },

  async removeClubMember(clubId, studentId) {
    return await this.request(`/clubs/${clubId}/members/${studentId}`, {
      method: "DELETE"
    });
  },

  async getIncomingRequests(clubId = null, statusFilter = null) {
    const params = new URLSearchParams();
    if (clubId && clubId !== "all") params.set("club_id", clubId);
    if (statusFilter) params.set("status_filter", statusFilter);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await this.request(`/applications/incoming${qs}`);
  },

  async getClubRequests(id, statusFilter = null) {
    if (!id || id === "all") {
      return await this.getIncomingRequests(null, statusFilter);
    }
    const qs = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : "";
    return await this.request(`/clubs/${id}/requests${qs}`);
  },

  // ---------------- APPLICATIONS / JOIN REQUESTS ----------------
  async submitJoinRequest(clubId, reason = "", skills = "") {
    const payload = {
      club_id: Number(clubId),
      reason_for_joining: reason || "Interested in participating in society events and projects",
      skills: skills || "General"
    };
    return await this.request("/applications", {
      method: "POST",
      body: payload
    });
  },

  async getMyApplications() {
    return await this.request("/applications/my");
  },

  async updateApplicationStatus(applicationId, status) {
    return await this.request(`/applications/${applicationId}/status`, {
      method: "PATCH",
      body: { status }
    });
  },

  // ---------------- EVENTS ----------------
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== "all") query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    if (params.club_id) query.set("club_id", params.club_id);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await this.request(`/events${qs}`);
  },

  async getEvent(id) {
    return await this.request(`/events/${id}`);
  },

  async createEvent(payload) {
    return await this.request("/events", {
      method: "POST",
      body: payload
    });
  },

  async updateEvent(id, payload) {
    return await this.request(`/events/${id}`, {
      method: "PATCH",
      body: payload
    });
  },

  async deleteEvent(id) {
    return await this.request(`/events/${id}`, {
      method: "DELETE"
    });
  },

  async registerForEvent(eventId) {
    return await this.request(`/events/${eventId}/register`, {
      method: "POST"
    });
  },

  async getMyEventRegistrations() {
    return await this.request("/events/my-registrations");
  },

  // ---------------- NETWORK & COLLAB FEED ----------------
  async getNetworkPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.tag && params.tag !== "all") query.set("tag", params.tag);
    if (params.search) query.set("search", params.search);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return await this.request(`/network/posts${qs}`);
  },

  async createNetworkPost(payload) {
    return await this.request("/network/posts", {
      method: "POST",
      body: payload
    });
  },

  async updateNetworkPost(postId, payload) {
    return await this.request(`/network/posts/${postId}`, {
      method: "PATCH",
      body: payload
    });
  },

  async deleteNetworkPost(postId) {
    return await this.request(`/network/posts/${postId}`, {
      method: "DELETE"
    });
  },

  async toggleUpvote(postId) {
    return await this.request(`/network/posts/${postId}/upvote`, {
      method: "POST"
    });
  },

  async getComments(postId) {
    return await this.request(`/network/posts/${postId}/comments`);
  },

  async addComment(postId, content) {
    return await this.request(`/network/posts/${postId}/comments`, {
      method: "POST",
      body: { content }
    });
  },

  // ---------------- BADGES ----------------
  async getMyBadges() {
    return await this.request("/badges/my");
  },

  async issueBadge(payload) {
    return await this.request("/badges", {
      method: "POST",
      body: payload
    });
  }
};
