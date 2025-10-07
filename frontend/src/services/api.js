// 27 - u23629810
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
    throw new Error('Unauthorized');
  }

  return response;
};

const fetchWithAuthMultipart = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
    throw new Error('Unauthorized');
  }

  return response;
};

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  updateProfile: async (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        if (Array.isArray(userData[key])) {
          formData.append(key, JSON.stringify(userData[key]));
        } else {
          formData.append(key, userData[key]);
        }
      }
    });

    const response = await fetchWithAuthMultipart(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getUserById: async (userId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  searchUsers: async (query) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  sendFriendRequest: async (userId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/friends/request`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  acceptFriendRequest: async (requestId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/friends/accept/${requestId}`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  rejectFriendRequest: async (requestId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/friends/reject/${requestId}`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  unfriend: async (friendId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/friends/${friendId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getFriends: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/friends`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getFriendRequests: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/friends/requests`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  deleteProfile: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

export const projectAPI = {
  getAllProjects: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/projects${queryParams ? `?${queryParams}` : ''}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getProjectById: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  createProject: async (projectData) => {
    const formData = projectData instanceof FormData ? projectData : (() => {
      const fd = new FormData();
      Object.keys(projectData).forEach(key => {
        if (key === 'files' && Array.isArray(projectData[key])) {
          projectData[key].forEach(file => fd.append('files', file));
        } else if (key === 'projectImage' && projectData[key]) {
          fd.append('projectImage', projectData[key]);
        } else if (key === 'hashtags' && Array.isArray(projectData[key])) {
          fd.append('hashtags', projectData[key].join(','));
        } else if (projectData[key] !== null && projectData[key] !== undefined) {
          fd.append(key, projectData[key]);
        }
      });
      return fd;
    })();

    const response = await fetchWithAuthMultipart(`${API_BASE_URL}/projects`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  updateProject: async (projectId, projectData) => {
    const formData = new FormData();
    Object.keys(projectData).forEach(key => {
      if (key === 'hashtags' && Array.isArray(projectData[key])) {
        formData.append('hashtags', projectData[key].join(','));
      } else if (projectData[key] !== null && projectData[key] !== undefined) {
        formData.append(key, projectData[key]);
      }
    });

    const response = await fetchWithAuthMultipart(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  deleteProject: async (projectId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  checkoutProject: async (projectId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/checkout`, {
      method: 'POST',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  checkinProject: async (projectId, checkinData) => {
    const formData = new FormData();
    Object.keys(checkinData).forEach(key => {
      if (key === 'files' && Array.isArray(checkinData[key])) {
        checkinData[key].forEach(file => formData.append('files', file));
      } else if (key === 'hashtags' && Array.isArray(checkinData[key])) {
        formData.append('hashtags', checkinData[key].join(','));
      } else if (checkinData[key] !== null && checkinData[key] !== undefined) {
        formData.append(key, checkinData[key]);
      }
    });

    const response = await fetchWithAuthMultipart(`${API_BASE_URL}/projects/${projectId}/checkin`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getProjectCheckins: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/checkins`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  searchProjects: async (query) => {
    const response = await fetch(`${API_BASE_URL}/projects/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getUserProjects: async (userId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/projects/user/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  addProjectMember: async (projectId, userId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  removeProjectMember: async (projectId, memberId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  deleteFile: async (projectId, fileId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

export const activityAPI = {
  getGlobalActivity: async (limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/activity/global?limit=${limit}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getLocalActivity: async (limit = 50) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/activity/local?limit=${limit}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getUserActivity: async (userId, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/activity/user/${userId}?limit=${limit}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  searchActivity: async (query) => {
    const response = await fetch(`${API_BASE_URL}/activity/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

export const notificationAPI = {
  getNotifications: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  getUnreadCount: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/unread-count`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  markAsRead: async (notificationId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  markAllAsRead: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  deleteNotification: async (notificationId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },
};

export default {
  auth: authAPI,
  user: userAPI,
  project: projectAPI,
  activity: activityAPI,
  notification: notificationAPI,
};
