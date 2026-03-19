// User Types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subject Types - Admin Controlled
export interface Subject {
  id: string;
  name: string;
  description: string;
  image: string;
  tutorCount: number;
  isActive: boolean;
  // Admin-controlled pricing by grade level
  pricingTiers: PricingTier[];
}

export interface PricingTier {
  id: string;
  subjectId: string;
  gradeLevel: string;
  pricePerHour: number;
  description?: string;
}

// Grade Levels
export const GRADE_LEVELS = [
  'Grade 1-5 (Primary)',
  'Grade 6-8 (Middle)',
  'Grade 9-10 (Secondary)',
  'O-Level',
  'A-Level',
  'University/College',
  'Adult Learning'
] as const;

export type GradeLevel = typeof GRADE_LEVELS[number];

// Teacher Types
export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio: string;
  subjects: string[]; // Subject IDs they teach
  // Teachers no longer set their own price - admin controls pricing
  profilePicture: string;
  highestDegree: {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  };
  teachingCertificates: {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];
  identityDocument: {
    type: 'cnic' | 'passport';
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
  isLive: boolean;
  availability: AvailabilitySlot[];
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySlot {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Student Types
export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  gradeLevel: string;
  profilePicture: string;
  parentContact?: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: string;
  status: 'pending_payment' | 'payment_under_review' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: Date;
  duration: number; // in minutes
  pricePerHour: number;
  totalAmount: number;
  paymentProof?: PaymentProof;
  meetingLink?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProof {
  id: string;
  bookingId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: Date;
  reviewNotes?: string;
}

// Class Session Types
export interface ClassSession {
  id: string;
  bookingId: string;
  teacherId: string;
  studentId: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingLink: string;
  recordingUrl?: string;
  notes?: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

// Dashboard Stats
export interface AdminStats {
  totalTeachers: number;
  pendingVerifications: number;
  totalStudents: number;
  pendingPayments: number;
  totalBookings: number;
  completedClasses: number;
  totalSubjects: number;
  activeSubjects: number;
  totalRevenue: number;
}

export interface TeacherStats {
  totalStudents: number;
  upcomingClasses: number;
  completedClasses: number;
  totalEarnings: number;
  pendingBookings: number;
}

export interface StudentStats {
  totalBookings: number;
  upcomingClasses: number;
  completedClasses: number;
  favoriteTeachers: number;
  totalSpent: number;
}

// Filter Types
export interface TeacherFilter {
  subjects?: string[];
  gradeLevel?: string;
  availability?: string;
  searchQuery?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Price Calculation Helper
export interface PriceCalculation {
  subjectId: string;
  gradeLevel: string;
  duration: number; // minutes
  pricePerHour: number;
  totalAmount: number;
}
