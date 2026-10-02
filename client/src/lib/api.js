const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiRequestError extends Error {
  // Carries the HTTP status, error code and per-field messages from the API.
  constructor({ status, code, message, fields = {} }) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// Sends one JSON request and unwraps the shared response envelope.
async function request(path, { method = 'GET', body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Cannot reach the RESOLVR API. Is the server running?',
    });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;

    // A non-JSON body means something other than the API answered, for example
    // the Vite proxy returning its own 500 page.
    if (!error) {
      throw new ApiRequestError({
        status: response.status,
        code: 'UNEXPECTED_RESPONSE',
        message: `The API returned an unexpected response (status ${response.status}). Is the server running?`,
      });
    }

    throw new ApiRequestError({
      status: response.status,
      code: error.code ?? 'UNKNOWN_ERROR',
      message: error.message ?? 'Request failed',
      fields: error.fields ?? {},
    });
  }

  return payload.data;
}

// Serialises defined values only, keeping the URL readable and shareable.
function toQuery(params) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

export const api = {
  listTickets: (params) => request(`/tickets${toQuery(params)}`),
  getTicket: (id) => request(`/tickets/${id}`),
  createTicket: (payload) => request('/tickets', { method: 'POST', body: payload }),
  updateTicket: (id, changes) => request(`/tickets/${id}`, { method: 'PATCH', body: changes }),
  getSummary: () => request('/tickets/summary'),
  getAnalytics: () => request('/tickets/analytics'),
};