// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
     apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (userData: any) =>
     apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getMe: () =>
     apiCall('/api/auth/me'),
  
  updateProfile: (data: any) =>
     apiCall('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
     apiCall('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Subjects API
export const subjectsAPI = {
  getAll: () =>
    apiCall('/api/subjects'),
  
  getById: (id: string) =>
    apiCall(`/api/subjects/${id}`),
  
  getPrice: (id: string, gradeLevel: string) =>
    apiCall(`/api/subjects/${id}/price?gradeLevel=${encodeURIComponent(gradeLevel)}`),
  
  // Admin only
  getAllAdmin: () =>
    apiCall('/api/subjects/all'),
  
  create: (data: any) =>
    apiCall('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiCall(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updatePricing: (id: string, pricingTiers: any[]) =>
    apiCall(`/api/subjects/${id}/pricing`, {
      method: 'PUT',
      body: JSON.stringify({ pricingTiers }),
    }),
  
  delete: (id: string) =>
    apiCall(`/api/subjects/${id}`, {
      method: 'DELETE',
    }),
};

// Teachers API
export const teachersAPI = {
  getAll: (filters?: { subject?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.search) params.append('search', filters.search);
    return apiCall(`/api/teachers?${params.toString()}`);
  },
  
  getTop: (limit: number = 5) =>
    apiCall(`/api/teachers/top?limit=${limit}`),
  
  getById: (id: string) =>
    apiCall(`/api/teachers/${id}`),
  
  getProfile: () =>
    apiCall('/api/teachers/profile'),
  
  updateProfile: (data: any) =>
    apiCall('/api/teachers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateAvailability: (availability: any[]) =>
    apiCall('/api/teachers/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    }),
  
  // Admin only
  getAllAdmin: () =>
    apiCall('/api/teachers/all'),
  
  verify: (id: string, status: string, notes?: string) =>
    apiCall(`/api/teachers/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  
  getDocuments: (id: string) =>
    apiCall(`/api/teachers/${id}/documents`),
};

// Students API
export const studentsAPI = {
  getProfile: () =>
    apiCall('/api/students/profile'),
  
  updateProfile: (data: any) =>
    apiCall('/api/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  getMyTeachers: () =>
    apiCall('/api/students/my-teachers'),
  
  getStats: () =>
    apiCall('/api/students/stats'),
  
  // Admin only
  getAll: () =>
    apiCall('/api/students/all'),
};

// Bookings API
export const bookingsAPI = {
  getAll: () =>
    apiCall('/api/bookings'),
  
  getById: (id: string) =>
    apiCall(`/api/bookings/${id}`),
  
  create: (data: any) =>
    apiCall('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: string) =>
    apiCall(`/api/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  getUpcoming: () =>
    apiCall('/api/bookings/upcoming/classes'),
};

// Payments API
export const paymentsAPI = {
  getAll: () =>
    apiCall('/api/payments'),
  
  getPending: () =>
    apiCall('/api/payments/pending'),
  
  uploadProof: (data: { bookingId: string; fileUrl: string; fileName?: string }) =>
    apiCall('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  verify: (id: string, status: string, notes?: string) =>
    apiCall(`/api/payments/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
};

// Admin API
export const adminAPI = {
  getStats: () =>
    apiCall('/api/admin/stats'),
  
  getRecentActivity: () =>
    apiCall('/api/admin/recent-activity'),
  
  getAllUsers: () =>
    apiCall('/api/admin/users'),
  
  getAllTeachers: () =>
    apiCall('/api/admin/teachers'),
  
  getAllStudents: () =>
    apiCall('/api/admin/students'),
  
  getClasses: (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiCall(`/api/admin/classes?${params.toString()}`);
  },
  
  getSettings: () =>
    apiCall('/api/admin/settings'),
  
  updateSettings: (settings: any) =>
    apiCall('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  
  addTopTeacher: (teacherId: string, position?: number) =>
    apiCall(`/api/admin/teachers/top/${teacherId}`, {
      method: 'POST',
      body: JSON.stringify({ position }),
    }),
  
  removeTopTeacher: (teacherId: string) =>
    apiCall(`/api/admin/teachers/top/${teacherId}`, {
      method: 'DELETE',
    }),
  
  updateUser: (id: string, data: any) =>
    apiCall(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteUser: (id: string) =>
    apiCall(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),
  
  getRevenue: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiCall(`/api/admin/revenue?${params.toString()}`);
  },
};

// Public Settings API
export const settingsAPI = {
  getAll: () =>
    apiCall('/api/settings'),
};

// Upload API
export const uploadAPI = {
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/upload/profile-picture`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },
  
  uploadDocument: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/upload/document`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },
  
  uploadPaymentProof: async (file: File, bookingId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/upload/payment-proof`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },
};

export default {
  auth: authAPI,
  subjects: subjectsAPI,
  teachers: teachersAPI,
  students: studentsAPI,
  bookings: bookingsAPI,
  payments: paymentsAPI,
  admin: adminAPI,
  upload: uploadAPI,
  settings: settingsAPI,
};
