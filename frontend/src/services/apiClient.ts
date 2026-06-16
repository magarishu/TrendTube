// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = {
  async request(endpoint, options: RequestInit = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Videos endpoints
  videos: {
    getAll: () => apiClient.request('/videos'),
    getById: (id) => apiClient.request(`/videos/${id}`),
    analyze: (id, data) => 
      apiClient.request(`/videos/${id}/analyze`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    search: (query) => apiClient.request(`/videos/search?query=${query}`),
  },

  // Creators endpoints
  creators: {
    getAll: () => apiClient.request('/creators'),
    getById: (id) => apiClient.request(`/creators/${id}`),
    getAnalytics: (id) => apiClient.request(`/creators/${id}/analytics`),
    search: (query) => apiClient.request(`/creators/search?query=${query}`),
  },

  // Categories endpoints
  categories: {
    getAll: () => apiClient.request('/categories'),
    getById: (id) => apiClient.request(`/categories/${id}`),
    getVideos: (id) => apiClient.request(`/categories/${id}/videos`),
  },

  // Analytics endpoints
  analytics: {
    getDashboard: () => apiClient.request('/analytics/dashboard'),
    getVideoAnalytics: (id) => apiClient.request(`/analytics/video/${id}`),
    getCreatorAnalytics: (id) => apiClient.request(`/analytics/creator/${id}`),
    getTrends: () => apiClient.request('/analytics/trends'),
  },

  // YouTube endpoints
  youtube: {
    search: (query, maxResults = 50, pageToken?: string) => {
      let url = `/youtube/search?query=${query}&maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      return apiClient.request(url);
    },
    getVideo: (videoId) => apiClient.request(`/youtube/video/${videoId}`),
    getChannel: (channelId) => apiClient.request(`/youtube/channel/${channelId}`),
    getChannelVideos: (channelId, maxResults = 50, pageToken?: string) => {
      let url = `/youtube/channel/${channelId}/videos?maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      return apiClient.request(url);
    },
    getTrending: (regionCode = 'US', maxResults = 50, pageToken?: string) => {
      let url = `/youtube/trending?regionCode=${regionCode}&maxResults=${maxResults}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      return apiClient.request(url);
    },
  },

  // Gemini AI endpoints
  gemini: {
    analyzeTitle: (title) =>
      apiClient.request('/gemini/analyze-title', {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    generateDescription: (title, keywords = [], topic = '') =>
      apiClient.request('/gemini/generate-description', {
        method: 'POST',
        body: JSON.stringify({ title, keywords, topic }),
      }),
    generateIdeas: (topic, count = 5, style = 'engaging') =>
      apiClient.request('/gemini/generate-ideas', {
        method: 'POST',
        body: JSON.stringify({ topic, count, style }),
      }),
    analyzeThumbnail: (text, context = '') =>
      apiClient.request('/gemini/analyze-thumbnail', {
        method: 'POST',
        body: JSON.stringify({ text, context }),
      }),
    chat: (message, context = '') =>
      apiClient.request('/gemini/chat', {
        method: 'POST',
        body: JSON.stringify({ message, context }),
      }),
    summarize: (content, length = 'medium') =>
      apiClient.request('/gemini/summarize', {
        method: 'POST',
        body: JSON.stringify({ content, length }),
      }),
  },

  // Health check
  health: () => apiClient.request('/health'),
  // Saved Ideas endpoints
  savedIdeas: {
    save: (data) => apiClient.request('/saved-ideas/save-idea', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getAll: (type?: string) => apiClient.request(`/saved-ideas/saved-ideas${type ? `?type=${type}` : ''}`),
    delete: (id) => apiClient.request(`/saved-ideas/saved-idea/${id}`, { method: 'DELETE' }),
  },

  // Favorites endpoints
  favorites: {
    add: (data) => apiClient.request('/auth/favorites/add', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    remove: (videoId) => apiClient.request('/auth/favorites/remove', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    }),
    getAll: () => apiClient.request('/auth/favorites'),
    check: (videoId) => apiClient.request(`/auth/favorites/check/${videoId}`),
  },
};

export default apiClient;
