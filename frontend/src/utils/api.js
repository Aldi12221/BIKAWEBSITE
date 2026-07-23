const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('bika_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const getAdminAuthHeader = () => {
  const token = localStorage.getItem('bika_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const api = {
  // ===== Auth =====
  loginGoogle: (data) =>
    fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateProfile: (id, data) =>
    fetch(`${API_BASE}/user/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // ===== Contents =====
  getContents: (kategori) =>
    fetch(`${API_BASE}/contents/${kategori}`).then(r => r.json()),

  getLoginStats: () =>
    fetch(`${API_BASE}/stats/login`).then(r => r.json()),

  getPublicStats: () =>
    fetch(`${API_BASE}/stats/public`).then(r => r.json()),

  createContent: (data) =>
    fetch(`${API_BASE}/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateContent: (id, data) =>
    fetch(`${API_BASE}/contents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteContent: (id, kategori) =>
    fetch(`${API_BASE}/contents/${id}?kategori=${kategori}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  // ===== Quizzes =====
  getQuizzes: () =>
    fetch(`${API_BASE}/quizzes`).then(r => r.json()),

  getQuizDetail: (id) =>
    fetch(`${API_BASE}/quizzes/${id}`).then(r => r.json()),

  createQuiz: (data) =>
    fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateQuiz: (id, data) =>
    fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteQuiz: (id) =>
    fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  // ===== Admin =====
  adminLogin: (data) =>
    fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  adminVerify: (token) =>
    fetch(`${API_BASE}/admin/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  adminStats: () =>
    fetch(`${API_BASE}/admin/stats`, {
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  adminUsers: () =>
    fetch(`${API_BASE}/admin/users`, {
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  deleteAdminUser: (id) =>
    fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  adminRegister: (data) =>
    fetch(`${API_BASE}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // ===== Admin CRUD =====
  getAdmins: () =>
    fetch(`${API_BASE}/admin/admins`, {
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  getAdminById: (id) =>
    fetch(`${API_BASE}/admin/admins/${id}`, {
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  updateAdminUser: (id, data) =>
    fetch(`${API_BASE}/admin/admins/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteAdminAccount: (id) =>
    fetch(`${API_BASE}/admin/admins/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    }).then(r => r.json()),

  // Templates
  getTemplates: () =>
    fetch(`${API_BASE}/templates`).then(r => r.json()),

  uploadTemplate: (data) =>
    fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // ===== Video Tutorials =====
  getVideoTutorials: () =>
    fetch(`${API_BASE}/video-tutorials`).then(r => r.json()),

  createVideoTutorial: (data) =>
    fetch(`${API_BASE}/video-tutorials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  updateVideoTutorial: (id, data) =>
    fetch(`${API_BASE}/video-tutorials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteVideoTutorial: (id) =>
    fetch(`${API_BASE}/video-tutorials/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    }).then(r => r.json()),
};

export default api;
