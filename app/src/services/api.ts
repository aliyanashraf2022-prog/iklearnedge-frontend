// API Configuration
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // Ensure single slash between base URL and endpoint
  const separator = API_BASE_URL.endsWith('/') || endpoint.startsWith('/') ? '' : '/';
  
  const response = await fetch(`${API_BASE_URL}${separator}${endpoint}`, {
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
     apiCall('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (userData: any) =>
     apiCall('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getMe: () =>
     apiCall('auth/me'),
  
  updateProfile: (data: any) =>
     apiCall('auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
     apiCall('auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Subjects API
export const subjectsAPI = {
  getAll: () =>
    apiCall('subjects'),
  
  getById: (id: string) =>
    apiCall(`subjects/${id}`),
  
  getPrice: (id: string, gradeLevel: string) =>
    apiCall(`subjects/${id}/price?gradeLevel=${encodeURIComponent(gradeLevel)}`),
  
  getAllAdmin: () =>
    apiCall('subjects/all'),
  
  create: (data: any) =>
    apiCall('subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    apiCall(`subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updatePricing: (id: string, pricingTiers: any[]) =>
    apiCall(`subjects/${id}/pricing`, {
      method: 'PUT',
      body: JSON.stringify({ pricingTiers }),
    }),
  
  delete: (id: string) =>
    apiCall(`subjects/${id}`, {
      method: 'DELETE',
    }),
};

// Teachers API
export const teachersAPI = {
  getAll: (filters?: { subject?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.search) params.append('search', filters.search);
    return apiCall(`teachers?${params.toString()}`);
  },
  
  getTop: (limit: number = 5) =>
    apiCall(`teachers/top?limit=${limit}`),
  
  getById: (id: string) =>
    apiCall(`teachers/${id}`),
  
  getProfile: () =>
    apiCall('teachers/profile'),
  
  updateProfile: (data: any) =>
    apiCall('teachers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateAvailability: (availability: any[]) =>
    apiCall('teachers/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    }),
  
  getAvailability: () =>
    apiCall('teachers/availability'),
  
  getAllAdmin: () =>
    apiCall('teachers/all'),
  
  verify: (id: string, status: string, notes?: string) =>
    apiCall(`teachers/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  
  getDocuments: (id: string) =>
    apiCall(`teachers/${id}/documents`),
};

// Students API
export const studentsAPI = {
  getProfile: () =>
    apiCall('students/profile'),
  
  updateProfile: (data: any) =>
    apiCall('students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  getMyTeachers: () =>
    apiCall('students/my-teachers'),
  
  getStats: () =>
    apiCall('students/stats'),
  
  getAll: () =>
    apiCall('students/all'),
};

// Bookings API
export const bookingsAPI = {
  getAll: () =>
    apiCall('bookings'),
  
  getById: (id: string) =>
    apiCall(`bookings/${id}`),
  
  create: (data: any) =>
    apiCall('bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: string) =>
    apiCall(`bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  getUpcoming: () =>
    apiCall('bookings/upcoming/classes'),
};

// Payments API
export const paymentsAPI = {
  getAll: () =>
    apiCall('payments'),
  
  getPending: () =>
    apiCall('payments/pending'),
  
  uploadProof: (data: { bookingId: string; fileUrl: string; fileName?: string }) =>
    apiCall('payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  verify: (id: string, status: string, notes?: string) =>
    apiCall(`payments/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
};

// Admin API
export const adminAPI = {
  getStats: () =>
    apiCall('admin/stats'),
  
  getRecentActivity: () =>
    apiCall('admin/recent-activity'),
  
  getAllUsers: () =>
    apiCall('admin/users'),
  
  getAllTeachers: () =>
    apiCall('admin/teachers'),
  
  getAllStudents: () =>
    apiCall('admin/students'),
  
  getClasses: (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiCall(`admin/classes?${params.toString()}`);
  },
  
  getSettings: () =>
    apiCall('admin/settings'),
  
  updateSettings: (settings: any) =>
    apiCall('admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  
  addTopTeacher: (teacherId: string, position?: number) =>
    apiCall(`admin/teachers/top/${teacherId}`, {
      method: 'POST',
      body: JSON.stringify({ position }),
    }),
  
  removeTopTeacher: (teacherId: string) =>
    apiCall(`admin/teachers/top/${teacherId}`, {
      method: 'DELETE',
    }),
  
  updateUser: (id: string, data: any) =>
    apiCall(`admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteUser: (id: string) =>
    apiCall(`admin/users/${id}`, {
      method: 'DELETE',
    }),
  
  getRevenue: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiCall(`admin/revenue?${params.toString()}`);
  },
};

// Public Settings API
export const settingsAPI = {
  getAll: () =>
    apiCall('settings'),
  
  getBankDetails: () =>
    apiCall('settings/bank-details'),
  
  updateBankDetails: (data: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    accountHolderName?: string;
    swiftCode?: string;
    branchAddress?: string;
  }) =>
    apiCall('settings/bank-details', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Upload API
export const uploadAPI = {
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload/profile-picture`, {
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
    const response = await fetch(`${API_BASE_URL}/upload/document`, {
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
    const response = await fetch(`${API_BASE_URL}/upload/payment-proof`, {
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
