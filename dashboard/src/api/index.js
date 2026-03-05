/**
 * Latch API Client
 * Centralized fetch wrappers for all backend endpoints.
 * All URLs go through apiBase — no scattered /api/... strings elsewhere.
 */

const SESSION_KEY = 'drift-sentinel-api-base'

let apiBase = sessionStorage.getItem(SESSION_KEY)
  || import.meta.env.VITE_API_BASE_URL
  || ''

export function getApiBase() {
  return apiBase
}

export function setApiBase(url) {
  apiBase = url
  if (url) {
    sessionStorage.setItem(SESSION_KEY, url)
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Internal helper — calls `fetch`, checks `response.ok`, returns parsed JSON.
 * @param {string} path - e.g. "/api/status"
 * @param {RequestInit} [opts]
 * @returns {Promise<any>}
 */
async function request(path, opts) {
  const res = await fetch(`${apiBase}${path}`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Endpoints ──────────────────────────────────────────

/**
 * GET /api/status
 * @returns {Promise<Object>}
 */
export async function fetchStatus() {
  return request('/api/status')
}

/**
 * GET /api/events
 * @returns {Promise<Array>}
 */
export async function fetchEvents() {
  return request('/api/events')
}

/**
 * GET /api/events/:id
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function fetchEventById(id) {
  return request(`/api/events/${encodeURIComponent(id)}`)
}

/**
 * GET /api/audit-trail
 * @returns {Promise<Object>}
 */
export async function fetchAuditTrail() {
  return request('/api/audit-trail')
}

/**
 * POST /api/trigger-drift
 * @param {"allowed"|"suspicious"|"critical"} scenario
 * @returns {Promise<Object>}
 */
export async function triggerDrift(scenario) {
  return request('/api/trigger-drift', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario }),
  })
}

// Legacy aliases used by existing imports (AppContext imports * as api)
export const getStatus = fetchStatus
export const getEvents = fetchEvents
