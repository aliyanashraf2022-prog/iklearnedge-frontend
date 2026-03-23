export type UserRole = 'admin' | 'teacher' | 'student';

export type BookingStatus =
  | 'pending_admin'
  | 'pending_teacher'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingTier {
  id: string;
  subjectId: string;
  gradeLevel: string;
  pricePerHour: number;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  image: string;
  tutorCount: number;
  isActive: boolean;
  pricingTiers: PricingTier[];
}

export const GRADE_LEVELS = [
  'Grade 1-5 (Primary)',
  'Grade 6-8 (Middle)',
  'Grade 9-10 (Secondary)',
  'O-Level',
  'A-Level',
  'University/College',
  'Adult Learning',
] as const;

export type GradeLevel = typeof GRADE_LEVELS[number];

export interface AvailabilitySlot {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TeacherDocument {
  id: string;
  type: 'degree' | 'certificate' | 'identity' | string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface TeacherSubject {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio: string;
  subjects: TeacherSubject[];
  profilePicture: string;
  qualifications?: string;
  yearsOfExperience?: number;
  highestDegree?: TeacherDocument | null;
  teachingCertificates?: TeacherDocument[];
  identityDocument?: TeacherDocument | null;
  documents?: TeacherDocument[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
  isLive: boolean;
  availability: AvailabilitySlot[];
  meetingLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  gradeLevel: string;
  profilePicture: string;
  parentContact?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentProof {
  id: string | null;
  bookingId: string;
  fileName: string;
  fileUrl: string | null;
  uploadedAt: string;
  status: PaymentStatus;
  reviewedAt?: string;
  reviewNotes?: string;
  totalAmount?: number;
  bookingStatus?: string;
  subjectId?: string;
  subjectName?: string;
  studentName?: string;
  teacherName?: string;
}

export interface Booking {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subjectName: string;
  studentName?: string;
  studentEmail?: string;
  teacherName?: string;
  teacherEmail?: string;
  gradeLevel: string;
  status: BookingStatus;
  scheduledDate: string;
  duration: number;
  pricePerHour: number;
  totalAmount: number;
  paymentProof?: PaymentProof;
  meetingLink?: string;
  notes?: string;
  isDemo: boolean;
  receiptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

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

export interface TeacherFilter {
  subjects?: string[];
  gradeLevel?: string;
  availability?: string;
  searchQuery?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  gradeLevel?: string;
  bio?: string;
  subjects?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PriceCalculation {
  subjectId: string;
  gradeLevel: string;
  duration: number;
  pricePerHour: number;
  totalAmount: number;
}
