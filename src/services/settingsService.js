/**
 * Settings Service
 * Connects to the TenantSettingsController backend APIs.
 *
 * Backend endpoints:
 *   GET    /api/v1/settings                 → getAllSettings
 *   PUT    /api/v1/settings/platform        → updatePlatformSettings
 *   PUT    /api/v1/settings/security        → updateSecuritySettings
 *   PUT    /api/v1/settings/communication   → updateCommunicationSettings
 *   PUT    /api/v1/settings/general         → updateGeneralSettings
 *   PUT    /api/v1/settings/custom-fields   → replaceCustomFields
 */

const BASE = '/api/v1/settings';

/**
 * Returns the auth token from localStorage.
 */
const getToken = () => localStorage.getItem('authToken') || '';

/**
 * Shared headers for every request.
 */
const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

/**
 * Generic response handler – throws on non-2xx.
 */
const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    console.error(`[settingsService] ${res.status}:`, text);
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
};

// ────────────────────────────────────────────────────────────────
//  GET  all settings
// ────────────────────────────────────────────────────────────────
export const fetchAllSettings = async () => {
  const res = await fetch(BASE, { headers: headers() });
  return handleResponse(res);
};

// ────────────────────────────────────────────────────────────────
//  PUT  platform (domain + payment + tax‑invoice)
// ────────────────────────────────────────────────────────────────
export const updatePlatformSettings = async (payload) => {
  const res = await fetch(`${BASE}/platform`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// ────────────────────────────────────────────────────────────────
//  PUT  security (content security + auth config)
// ────────────────────────────────────────────────────────────────
export const updateSecuritySettings = async (payload) => {
  const res = await fetch(`${BASE}/security`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// ────────────────────────────────────────────────────────────────
//  PUT  communication (email + UX settings)
// ────────────────────────────────────────────────────────────────
export const updateCommunicationSettings = async (payload) => {
  const res = await fetch(`${BASE}/communication`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// ────────────────────────────────────────────────────────────────
//  PUT  general (logo, site name, language, timezone)
// ────────────────────────────────────────────────────────────────
export const updateGeneralSettings = async (payload) => {
  const res = await fetch(`${BASE}/general`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// ────────────────────────────────────────────────────────────────
//  PUT  custom‑fields (replace all)
// ────────────────────────────────────────────────────────────────
export const replaceCustomFields = async (fieldsArray) => {
  const res = await fetch(`${BASE}/custom-fields`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(fieldsArray)
  });
  return handleResponse(res);
};

const settingsService = {
  fetchAllSettings,
  updatePlatformSettings,
  updateSecuritySettings,
  updateCommunicationSettings,
  updateGeneralSettings,
  replaceCustomFields
};

export default settingsService;
