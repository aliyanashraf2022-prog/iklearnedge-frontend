import type {
  AdminStats,
  Booking,
  Notification,
  PaymentProof,
  PricingTier,
  Student,
  StudentStats,
  Subject,
  Teacher,
  User,
} from '@/types';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  unread?: number;
};

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

const rawBaseUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const API_BASE_URL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`)
  : '/api';

const normalizeId = (value: unknown) => String(value ?? '');
const ensureArray = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

const clearSession = () => {
  localStorage.removeItem('token');
};

async function requestEnvelope<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  const { skipAuth, ...fetchOptions } = options;

  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`,
    {
      ...fetchOptions,
      headers,
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    if (response.status === 401 || response.status === 403) {
      clearSession();
    }

    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

async function requestData<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const payload = await requestEnvelope<T>(endpoint, options);
  return payload.data;
}

const mapUser = (raw: any): User => ({
  id: normalizeId(raw.id),
  email: raw.email || '',
  name: raw.name || '',
  role: raw.role,
  profilePicture: raw.profilePicture || raw.profile_picture || '',
  createdAt: raw.createdAt || raw.created_at || '',
  updatedAt: raw.updatedAt || raw.updated_at || '',
});

const mapPricingTier = (raw: any): PricingTier => ({
  id: normalizeId(raw.id),
  subjectId: normalizeId(raw.subjectId || raw.subject_id),
  gradeLevel: raw.gradeLevel || raw.grade_level || '',
  pricePerHour: Number(raw.pricePerHour || raw.price_per_hour || 0),
  description: raw.description,
});

const mapAvailability = (raw: any) => ({
  id: normalizeId(raw.id),
  day: raw.day,
  startTime: raw.startTime || raw.start_time || '',
  endTime: raw.endTime || raw.end_time || '',
  isAvailable: raw.isAvailable ?? raw.is_available ?? true,
});

const mapDocument = (raw: any) => ({
  id: normalizeId(raw.id),
  type: raw.type,
  fileName: raw.fileName || raw.file_name || '',
  fileUrl: raw.fileUrl || raw.file_url || '',
  uploadedAt: raw.uploadedAt || raw.uploaded_at || '',
});

const mapSubject = (raw: any): Subject => ({
  id: normalizeId(raw.id),
  name: raw.name || '',
  description: raw.description || '',
  image: raw.image || '',
  tutorCount: Number(raw.tutorCount || raw.tutor_count || 0),
  isActive: raw.isActive ?? raw.is_active ?? false,
  pricingTiers: ensureArray<any>(raw.pricingTiers).map(mapPricingTier),
});

const mapTeacher = (raw: any): Teacher => {
  const documents = ensureArray<any>(raw.documents).map(mapDocument);
  const highestDegree = raw.highestDegree ? mapDocument(raw.highestDegree) : documents.find((item) => item.type === 'degree');
  const identityDocument = raw.identityDocument ? mapDocument(raw.identityDocument) : documents.find((item) => item.type === 'identity');
  const teachingCertificates = raw.teachingCertificates
    ? ensureArray<any>(raw.teachingCertificates).map(mapDocument)
    : documents.filter((item) => item.type === 'certificate');

  return {
    id: normalizeId(raw.id),
    userId: normalizeId(raw.userId || raw.user_id),
    name: raw.name || '',
    email: raw.email || '',
    bio: raw.bio || '',
    subjects: ensureArray<any>(raw.subjects).map((subject) => {
      if (typeof subject === 'object' && subject !== null) {
        return {
          id: normalizeId(subject.id),
          name: subject.name || '',
        };
      }
      return {
        id: normalizeId(subject),
        name: '',
      };
    }),
    profilePicture: raw.profilePicture || raw.profile_picture || '',
    qualifications: raw.qualifications || raw.qualification || '',
    yearsOfExperience: Number(raw.yearsOfExperience || raw.years_of_experience || 0) || undefined,
    highestDegree: highestDegree || null,
    teachingCertificates,
    identityDocument: identityDocument || null,
    verificationStatus: raw.verificationStatus || raw.verification_status || 'pending',
    verificationNotes: raw.verificationNotes || raw.verification_notes || '',
    isLive: raw.isLive ?? raw.is_live ?? false,
    availability: ensureArray<any>(raw.availability).map(mapAvailability),
    meetingLink: raw.meetingLink || raw.meeting_link || '',
    documents,
    createdAt: raw.createdAt || raw.created_at || '',
    updatedAt: raw.updatedAt || raw.updated_at || '',
  } as Teacher;
};

const mapStudent = (raw: any): Student => ({
  id: normalizeId(raw.id),
  userId: normalizeId(raw.userId || raw.user_id),
  name: raw.name || '',
  email: raw.email || '',
  gradeLevel: raw.gradeLevel || raw.grade_level || '',
  profilePicture: raw.profilePicture || raw.profile_picture || '',
  parentContact: raw.parentContact || raw.parent_contact || '',
  location: raw.location || '',
  createdAt: raw.createdAt || raw.created_at || '',
  updatedAt: raw.updatedAt || raw.updated_at || '',
});

const mapPaymentProof = (raw: any): PaymentProof => ({
 id: normalizeId(raw.id || raw.payment_proof_id),
  bookingId: normalizeId(raw.bookingId || raw.booking_id),
  fileName: raw.fileName || raw.file_name || raw.paymentProofName || '',
  fileUrl: raw.fileUrl || raw.file_url || raw.paymentProofUrl || '',
  uploadedAt: raw.uploadedAt || raw.uploaded_at || raw.paymentUploadedAt || '',
  status: raw.status || raw.paymentStatus || 'pending',
  reviewedAt: raw.reviewedAt || raw.reviewed_at || raw.paymentReviewedAt || '',
  reviewNotes: raw.reviewNotes || raw.review_notes || raw.paymentReviewNotes || '',
  totalAmount: Number(raw.totalAmount || raw.total_amount || 0),
  bookingStatus: raw.bookingStatus || raw.booking_status || '',
  subjectId: normalizeId(raw.subjectId || raw.subject_id),
  subjectName: raw.subjectName || raw.subject_name || '',
  studentName: raw.studentName || raw.student_name || '',
  teacherName: raw.teacherName || raw.teacher_name || '',
});

const mapBooking = (raw: any): Booking => ({
  id: normalizeId(raw.id),
  studentId: normalizeId(raw.studentId || raw.student_id),
  teacherId: normalizeId(raw.teacherId || raw.teacher_id),
  subjectId: normalizeId(raw.subjectId || raw.subject_id),
  subjectName: raw.subjectName || raw.subject_name || '',
  studentName: raw.studentName || raw.student_name || '',
  studentEmail: raw.studentEmail || raw.student_email || '',
  teacherName: raw.teacherName || raw.teacher_name || '',
  teacherEmail: raw.teacherEmail || raw.teacher_email || '',
  gradeLevel: raw.gradeLevel || raw.grade_level || '',
  status: raw.status,
  scheduledDate: raw.scheduledDate || raw.scheduled_date || '',
  duration: Number(raw.duration || 0),
  pricePerHour: Number(raw.pricePerHour || raw.price_per_hour || 0),
  totalAmount: Number(raw.totalAmount || raw.total_amount || 0),
  meetingLink: raw.meetingLink || raw.meeting_link || '',
  notes: raw.notes || '',
  isDemo: raw.isDemo ?? raw.is_demo ?? false,
  receiptUrl: raw.receiptUrl || raw.receipt_url || '',
  createdAt: raw.createdAt || raw.created_at || '',
  updatedAt: raw.updatedAt || raw.updated_at || '',
  paymentProof: raw.paymentProofId || raw.paymentProofUrl ? mapPaymentProof(raw) : undefined,
});

const mapNotification = (raw: any): Notification => ({
  id: normalizeId(raw.id),
  userId: normalizeId(raw.userId || raw.user_id),
  title: raw.title || '',
  message: raw.message || '',
  type: raw.type || 'info',
  isRead: raw.isRead ?? raw.is_read ?? false,
  createdAt: raw.createdAt || raw.created_at || '',
});

const mapAdminStats = (raw: any): AdminStats => ({
  totalTeachers: Number(raw.totalTeachers || 0),
  pendingVerifications: Number(raw.pendingVerifications || 0),
  totalStudents: Number(raw.totalStudents || 0),
  pendingPayments: Number(raw.pendingPayments || 0),
  totalBookings: Number(raw.totalBookings || 0),
  completedClasses: Number(raw.completedClasses || 0),
  totalSubjects: Number(raw.totalSubjects || 0),
  activeSubjects: Number(raw.activeSubjects || 0),
  totalRevenue: Number(raw.totalRevenue || 0),
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await requestData<{ user: any; token: string }>('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    return {
      user: mapUser(data.user),
      token: data.token,
    };
  },

  register: async (userData: Record<string, unknown>) => {
    const data = await requestData<{ user: any; token: string }>('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true,
    });

    return {
      user: mapUser(data.user),
      token: data.token,
    };
  },

  getMe: async () => {
    const data = await requestData<{ user: any }>('auth/me');
    return mapUser(data.user);
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const response = await requestData<{ user: any }>('auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapUser(response.user);
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    requestEnvelope<null>('auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export const subjectsAPI = {
  getAll: async () => ensureArray<any>(await requestData<any[]>('subjects')).map(mapSubject),
  getById: async (id: string) => mapSubject(await requestData<any>(`subjects/${id}`)),
  getPrice: (id: string, gradeLevel: string) =>
    requestData<{ pricePerHour: number }>(`subjects/${id}/price?gradeLevel=${encodeURIComponent(gradeLevel)}`),
  getAllAdmin: async () => ensureArray<any>(await requestData<any[]>('subjects/all')).map(mapSubject),
  create: async (data: Record<string, unknown>) => mapSubject(await requestData<any>('subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  })),
  update: async (id: string, data: Record<string, unknown>) => mapSubject(await requestData<any>(`subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })),
  updatePricing: async (id: string, pricingTiers: PricingTier[]) =>
    ensureArray<any>(await requestData<any[]>(`subjects/${id}/pricing`, {
      method: 'PUT',
      body: JSON.stringify({ pricingTiers }),
    })).map(mapPricingTier),
  delete: (id: string) => requestEnvelope<null>(`subjects/${id}`, { method: 'DELETE' }),
};

export const teachersAPI = {
  getAll: async (filters?: { subject?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.subject) params.set('subject', filters.subject);
    if (filters?.search) params.set('search', filters.search);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return ensureArray<any>(await requestData<any[]>(`teachers${suffix}`)).map(mapTeacher);
  },

  getById: async (id: string) => mapTeacher(await requestData<any>(`teachers/${id}`)),
  getProfile: async () => mapTeacher(await requestData<any>('teachers/profile')),
  updateProfile: async (data: Record<string, unknown>) => mapTeacher(await requestData<any>('teachers/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })),
  updateAvailability: async (availability: Array<Record<string, unknown>>) =>
    ensureArray<any>(await requestData<any>('teachers/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    })).map(mapAvailability),
  getAvailability: async () => ensureArray<any>(await requestData<any[]>('teachers/availability')).map(mapAvailability),
  getAllAdmin: async () => ensureArray<any>(await requestData<any[]>('teachers/all')).map(mapTeacher),
  verify: async (id: string, status: string, notes?: string) =>
    mapTeacher(await requestData<any>(`teachers/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    })),
  getDocuments: async (id: string) => ensureArray<any>(await requestData<any[]>(`teachers/${id}/documents`)).map(mapDocument),
};

export const studentsAPI = {
  getProfile: async () => mapStudent(await requestData<any>('students/profile')),
  updateProfile: async (data: Record<string, unknown>) => mapStudent(await requestData<any>('students/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })),
  getMyTeachers: async () => ensureArray<any>(await requestData<any[]>('students/my-teachers')).map(mapTeacher),
  getStats: async () => requestData<StudentStats>('students/stats'),
  getAll: async () => ensureArray<any>(await requestData<any[]>('students/all')).map(mapStudent),
};

export const bookingsAPI = {
  getAll: async () => ensureArray<any>(await requestData<any[]>('bookings')).map(mapBooking),
  getById: async (id: string) => mapBooking(await requestData<any>(`bookings/${id}`)),
  create: async (data: Record<string, unknown>) => mapBooking(await requestData<any>('bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  })),
  createDemo: async (data: Record<string, unknown>) => mapBooking(await requestData<any>('bookings/demo', {
    method: 'POST',
    body: JSON.stringify(data),
  })),
  respond: async (id: string, decision: 'accept' | 'reject', meetingLink?: string) =>
    mapBooking(await requestData<any>(`bookings/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ decision, meetingLink }),
    })),
  updateStatus: async (id: string, status: string) => mapBooking(await requestData<any>(`bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })),
  getUpcoming: async () => ensureArray<any>(await requestData<any[]>('bookings/upcoming/classes')).map(mapBooking),
  getDemoRequests: async () => ensureArray<any>(await requestData<any[]>('bookings/demo/requests')).map(mapBooking),
  cancelDemo: (id: string) => requestEnvelope<null>(`bookings/${id}/demo`, { method: 'DELETE' }),
  getPendingAdmin: async () => ensureArray<any>(await requestData<any[]>('bookings/pending-admin')).map(mapBooking),
  getByTeacher: async () => ensureArray<any>(await requestData<any[]>('bookings/teacher')).map(mapBooking),
};

export const paymentsAPI = {
  getAll: async () => ensureArray<any>(await requestData<any[]>('payments')).map(mapPaymentProof),
  getPending: async () => ensureArray<any>(await requestData<any[]>('payments/pending')).map(mapPaymentProof),
  uploadProof: async (data: { bookingId: string; fileUrl: string; fileName?: string }) =>
    mapPaymentProof(await requestData<any>('payments', {
      method: 'POST',
      body: JSON.stringify(data),
    })),
  verify: async (id: string, status: 'approved' | 'rejected', notes?: string) =>
    mapPaymentProof(await requestData<any>(`payments/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    })),
};

export const adminAPI = {
  getStats: async () => mapAdminStats(await requestData<any>('admin/stats')),
  getRecentActivity: () => requestData<any[]>('admin/recent-activity'),
  getAllUsers: async () => ensureArray<any>(await requestData<any[]>('admin/users')).map(mapUser),
  getAllTeachers: async () => ensureArray<any>(await requestData<any[]>('admin/teachers')).map(mapTeacher),
  getAllStudents: async () => ensureArray<any>(await requestData<any[]>('admin/students')).map(mapStudent),
  getClasses: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    const data = await requestData<any>(`admin/classes${suffix}`);
    return {
      all: ensureArray<any>(data.all).map(mapBooking),
      upcoming: ensureArray<any>(data.upcoming).map(mapBooking),
      completed: ensureArray<any>(data.completed).map(mapBooking),
      pending: ensureArray<any>(data.pending).map(mapBooking),
    };
  },
  getSettings: () => requestData<Record<string, string | number | boolean>>('admin/settings'),
  updateSettings: (settings: Record<string, string | number | boolean>) =>
    requestEnvelope<null>('admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  updateUser: async (id: string, data: Record<string, unknown>) =>
    mapUser(await requestData<any>(`admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })),
  deleteUser: (id: string) => requestEnvelope<null>(`admin/users/${id}`, { method: 'DELETE' }),
  getRevenue: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return requestData<any>(`admin/revenue${suffix}`);
  },
  getPendingVerifications: async () => ensureArray<any>(await requestData<any[]>('admin/verifications/pending')).map(mapTeacher),
};

export const settingsAPI = {
  getAll: () => requestData<Record<string, string | number | boolean>>('settings'),
  getBankDetails: () => requestData<{
    bankName: string;
    accountNumber: string;
    iban: string;
    accountHolderName: string;
    swiftCode: string;
    branchAddress: string;
    isActive: boolean;
  }>('settings/bank-details'),
  updateBankDetails: (data: Record<string, unknown>) =>
    requestEnvelope<any>('settings/bank-details', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const uploadAPI = {
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return requestData<{ url: string }>('upload/profile-picture', {
      method: 'POST',
      body: formData,
    });
  },

  uploadDocument: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return requestData<any>('upload/document', {
      method: 'POST',
      body: formData,
    });
  },

  uploadPaymentProof: async (file: File, bookingId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);

    return requestData<{ url: string; fileName: string; publicId: string }>('upload/payment-proof', {
      method: 'POST',
      body: formData,
    });
  },
};

export const notificationsAPI = {
  getAll: async () => ensureArray<any>(await requestData<any[]>('notifications')).map(mapNotification),
  getUnreadCount: async () => {
    const payload = await requestEnvelope<never>('notifications/unread/count');
    return Number(payload.count || 0);
  },
  markAsRead: (id: string) => requestEnvelope<null>(`notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => requestEnvelope<null>('notifications/read/all', { method: 'PUT' }),
  delete: (id: string) => requestEnvelope<null>(`notifications/${id}`, { method: 'DELETE' }),
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
  notifications: notificationsAPI,
};
