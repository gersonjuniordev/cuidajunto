export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const TOKEN_KEY = "cuidajunto_token";

export function setAuthToken(token) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  const token = getAuthToken();
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    me: () => request("/api/me"),
    updateProfile: (data) =>
      request("/api/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    register: (data) =>
      request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data) =>
      request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request("/api/auth/logout", { method: "POST" }),
  },
  billing: {
    plans: () => request("/api/billing/plans"),
    status: () => request("/api/billing/status"),
    createSubscription: (plan) =>
      request("/api/billing/create-subscription", {
        method: "POST",
        body: JSON.stringify({ plan }),
      }),
    refresh: () =>
      request("/api/billing/refresh", {
        method: "POST",
      }),
  },
  children: {
    list: () => request("/api/children"),
    create: (data) =>
      request("/api/children", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/api/children/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/api/children/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: (limit) =>
      request(`/api/tasks${limit ? `?limit=${limit}` : ""}`),
    create: (data) =>
      request("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  events: {
    list: (limit) =>
      request(`/api/events${limit ? `?limit=${limit}` : ""}`),
    create: (data) =>
      request("/api/events", { method: "POST", body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/api/events/${id}`, { method: "DELETE" }),
  },
  dailyReports: {
    get: (childId, date) =>
      request(
        `/api/daily-reports?${[
          childId ? `child_id=${encodeURIComponent(childId)}` : "",
          date ? `date=${encodeURIComponent(date)}` : "",
        ]
          .filter(Boolean)
          .join("&")}`
      ),
    upsert: (data) =>
      request("/api/daily-reports/upsert", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  medications: {
    list: (limit, active) =>
      request(
        `/api/medications${limit || active ? `?${[
          limit ? `limit=${limit}` : "",
          active ? `active=${active}` : "",
        ]
          .filter(Boolean)
          .join("&")}` : ""}`
      ),
    create: (data) =>
      request("/api/medications", { method: "POST", body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/api/medications/${id}`, { method: "DELETE" }),
  },
  medicationLogs: {
    list: (limit) =>
      request(`/api/medication-logs${limit ? `?limit=${limit}` : ""}`),
    create: (data) =>
      request("/api/medication-logs", { method: "POST", body: JSON.stringify(data) }),
  },
  documents: {
    list: (limit) =>
      request(`/api/documents${limit ? `?limit=${limit}` : ""}`),
    create: (data) =>
      request("/api/documents", { method: "POST", body: JSON.stringify(data) }),
    delete: (id) =>
      request(`/api/documents/${id}`, { method: "DELETE" }),
  },
  conversations: {
    list: (limit) =>
      request(`/api/conversations${limit ? `?limit=${limit}` : ""}`),
    create: (data) =>
      request("/api/conversations", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/api/conversations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  messages: {
    listByConversation: (conversationId, limit) =>
      request(
        `/api/messages?conversationId=${conversationId}${
          limit ? `&limit=${limit}` : ""
        }`
      ),
    create: (data) =>
      request("/api/messages", { method: "POST", body: JSON.stringify(data) }),
  },
  files: {
    upload: async (file) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Upload failed with status ${res.status}`);
      }
      return res.json();
    },
  },
  emails: {
    send: (data) =>
      request("/api/send-email", { method: "POST", body: JSON.stringify(data) }),
  },
};

