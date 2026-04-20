// API service for Sound Empire
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Artists
  getArtists: () => fetchAPI('/artists'),
  getArtist: (id) => fetchAPI(`/artists/${id}`),
  createArtist: (data) => fetchAPI('/artists', { method: 'POST', body: JSON.stringify(data) }),
  updateArtist: (id, data) => fetchAPI(`/artists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArtist: (id) => fetchAPI(`/artists/${id}`, { method: 'DELETE' }),
  regeneratePersona: (id) => fetchAPI(`/artists/${id}/regenerate`, { method: 'POST' }),

  // Releases
  getReleases: () => fetchAPI('/releases'),
  getRelease: (id) => fetchAPI(`/releases/${id}`),
  createRelease: (data) => fetchAPI('/releases', { method: 'POST', body: JSON.stringify(data) }),
  updateRelease: (id, data) => fetchAPI(`/releases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRelease: (id) => fetchAPI(`/releases/${id}`, { method: 'DELETE' }),

  // Studio
  generateSong: (data) => fetchAPI('/studio/generate', { method: 'POST', body: JSON.stringify(data) }),
  getSongs: (artistId) => fetchAPI(`/studio/songs/${artistId}`),
  getSong: (id) => fetchAPI(`/studio/songs/detail/${id}`),
  updateSong: (id, data) => fetchAPI(`/studio/songs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  generateVideoConcept: (data) => fetchAPI('/studio/video-concept', { method: 'POST', body: JSON.stringify(data) }),

  // Marketing
  generateMarketing: (data) => fetchAPI('/marketing/generate', { method: 'POST', body: JSON.stringify(data) }),
  getMarketing: (artistId) => fetchAPI(`/marketing/${artistId}`),
  deleteMarketing: (id) => fetchAPI(`/marketing/${id}`, { method: 'DELETE' }),

  // Analytics
  getDashboard: () => fetchAPI('/analytics/dashboard'),
  getCatalog: () => fetchAPI('/analytics/catalog'),
};

export default api;
