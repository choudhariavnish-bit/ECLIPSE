import axios from "axios";

// Base API URL: Defaults to local Next.js API routes or backend URL if configured
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const apiClient = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api` : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eclipse_access_token") || localStorage.getItem("inkloom_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Authentication APIs
  auth: {
    async login(email: string, password = "password123") {
      const res = await apiClient.post("/auth/login", { email, password });
      if (res.data.accessToken && typeof window !== "undefined") {
        localStorage.setItem("eclipse_access_token", res.data.accessToken);
        localStorage.setItem("eclipse_user", JSON.stringify(res.data.user));
        localStorage.setItem("inkloom_access_token", res.data.accessToken);
        localStorage.setItem("inkloom_user", JSON.stringify(res.data.user));
      }
      return res.data;
    },
    async register(data: { name: string; email: string; password: string; role?: string; department?: string }) {
      const res = await apiClient.post("/auth/register", data);
      return res.data;
    },
    async getMe() {
      const res = await apiClient.get("/auth/me");
      return res.data;
    },
    logout() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("eclipse_access_token");
        localStorage.removeItem("eclipse_user");
        localStorage.removeItem("inkloom_access_token");
        localStorage.removeItem("inkloom_user");
      }
    },
  },

  // Content APIs
  drafts: {
    async list() {
      const res = await apiClient.get("/drafts");
      return res.data.drafts;
    },
    async get(id: string) {
      const res = await apiClient.get(`/drafts/${id}`);
      return res.data;
    },
    async create(draft: { title: string; content: string; channel?: string; format?: string }) {
      const res = await apiClient.post("/drafts", draft);
      return res.data;
    },
    async update(id: string, updates: any) {
      const res = await apiClient.put(`/drafts/${id}`, updates);
      return res.data;
    },
    async delete(id: string) {
      const res = await apiClient.delete(`/drafts/${id}`);
      return res.data;
    },
  },

  // AI Review APIs
  review: {
    async start(payload: { draftId?: string; text: string; channel?: string }) {
      const res = await apiClient.post("/review/start", payload);
      return res.data;
    },
    async getFindings(draftId: string) {
      const res = await apiClient.get(`/review/${draftId}/findings`);
      return res.data;
    },
    async suggest(payload: { flaggedPhrase: string; ruleType?: string; context?: string }) {
      const res = await apiClient.post("/review/suggest", payload);
      return res.data;
    },
  },

  // ECLIPSE Blog Review & Correction APIs
  blog: {
    async analyze(payload: { title?: string; content: string; brand_id?: string; content_type?: string; target_audience?: string }) {
      const res = await apiClient.post("/blog/analyze", payload);
      return res.data;
    },
    async correct(payload: { original_content: string; title?: string; brand_id?: string; selected_corrections?: string[]; analysis_results?: any }) {
      const res = await apiClient.post("/blog/correct", payload);
      return res.data;
    },
    async review(payload: { title?: string; content: string; brand_id?: string; content_type?: string; target_audience?: string }) {
      const res = await apiClient.post("/blog/review", payload);
      return res.data;
    },
  },

  // ECLIPSE Multimodal Image & Poster Scanning APIs
  image: {
    async scan(payload: { image_base64?: string; image_filename?: string; mime_type?: string; brand_id?: string; target_audience?: string }) {
      const res = await apiClient.post("/image/scan", payload);
      return res.data;
    },
    async correct(payload: { audit_id?: string; selected_corrections?: string[]; audit_report?: any }) {
      const res = await apiClient.post("/image/correct", payload);
      return res.data;
    },
  },

  // Guideline APIs
  guidelines: {
    async list() {
      const res = await apiClient.get("/guidelines");
      return res.data.guidelines;
    },
    async create(guideline: { title: string; content: string; version?: string }) {
      const res = await apiClient.post("/guidelines", guideline);
      return res.data;
    },
    async listRules() {
      const res = await apiClient.get("/rules");
      return res.data.rules;
    },
  },

  // Workflow APIs
  workflow: {
    async submit(draftId: string, notes?: string) {
      const res = await apiClient.post("/workflow/submit", { draftId, notes });
      return res.data;
    },
    async approve(draftId: string, notes?: string) {
      const res = await apiClient.post("/workflow/approve", { draftId, notes });
      return res.data;
    },
    async reject(draftId: string, notes?: string, action: "changes_requested" | "reject" = "changes_requested") {
      const res = await apiClient.post("/workflow/reject", { draftId, notes, action });
      return res.data;
    },
    async addComment(draftId: string, comment: string) {
      const res = await apiClient.post("/workflow/comments", { draftId, comment });
      return res.data;
    },
    async getComments(draftId: string) {
      const res = await apiClient.get(`/workflow/comments?draftId=${draftId}`);
      return res.data.comments;
    },
  },

  // Analytics APIs
  analytics: {
    async getStats() {
      const res = await apiClient.get("/analytics/stats");
      return res.data.statistics;
    },
    async getCommonMistakes() {
      const res = await apiClient.get("/analytics/common-mistakes");
      return res.data.commonMistakes;
    },
    async getDashboard() {
      const res = await apiClient.get("/analytics/dashboard");
      return res.data;
    },
  },

  // System Health
  async checkHealth() {
    const res = await apiClient.get("/health");
    return res.data;
  },
};

