const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
export function getToken() { return localStorage.getItem("token") || ""; }
export function setToken(t) { localStorage.setItem("token", t); }
export function clearToken() { localStorage.removeItem("token"); }

async function req(path, { method = "GET", body } = {}) {
  const headers = { "Accept": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { method, headers };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(`${API_BASE}${path}`, opts);
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || `${r.status}`);
  }
  return r.json();
}

export const api = {
  companies: () => req("/companies"),
  registerCompany: (p) => req("/companies/register", { method: "POST", body: p }),
  signup: (p) => req("/auth/signup", { method: "POST", body: p }),
  login: (p) => req("/auth/login", { method: "POST", body: p }),
  me: () => req("/auth/me"),
  sites: () => req("/sites"),
  companySettings: () => req("/company/settings"),
  updateCompanySettings: (p) => req("/company/settings", { method: "PUT", body: p }),
  syncHolidays: (year) => req(`/company/holidays/sync?year=${year}`, { method: "POST" }),
  listHolidays: (year) => req(`/company/holidays?year=${year}`),
  addHoliday: (date, name) => req(`/company/holidays?date=${encodeURIComponent(date)}&name=${encodeURIComponent(name)}`, { method: "POST" }),
  deleteHoliday: (date) => req(`/company/holidays?date=${encodeURIComponent(date)}`, { method: "DELETE" }),
  pending: () => req("/admin/pending"),
  approve: (p) => req("/admin/approve", { method: "POST", body: p }),
  createUserManual: (p) => req("/admin/users", { method: "POST", body: p }),
  createSiteManual: (p) => req("/admin/sites", { method: "POST", body: p }),
  createCheckinManual: (p) => req("/admin/checkin", { method: "POST", body: p }),
  startCheckin: (p) => req("/checkin/start", { method: "POST", body: p }),
  // mobile scan flow
  createPeerToken: () => req("/peer/token", { method: "POST", body: {} }),
  startMobileCheckin: (p) => req("/checkin/start_mobile", { method: "POST", body: p }),
  heartbeat: (sessionId, p) => req(`/sessions/${sessionId}/heartbeat`, { method: "POST", body: p }),
  session: (id) => req(`/sessions/${id}`),
  anomalies: () => req("/anomalies"),
  issueChallenge: (p) => req("/challenge/issue", { method: "POST", body: p }),
  resolveChallenge: (p) => req("/challenge/resolve", { method: "POST", body: p }),
  reportAgents: (from, to) => req(`/reports/agents?date_from=${from}&date_to=${to}`),
}
