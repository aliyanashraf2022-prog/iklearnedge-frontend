import type { 
  User, Teacher, Student, Booking, Subject, 
  ClassSession, Notification, AdminStats, 
  TeacherStats, StudentStats, PaymentProof, PricingTier 
} from '@/types';

// Current User (Mock logged in user)
export const currentUser: User = {
  id: '1',
  email: 'admin@iklearnedge.com',
  name: 'Admin User',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Users
export const users: User[] = [
  {
    id: '1',
    email: 'admin@iklearnedge.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'teacher1@iklearnedge.com',
    name: 'Ahmed Khan',
    role: 'teacher',
    profilePicture: '/testimonial-ahmed.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    email: 'teacher2@iklearnedge.com',
    name: 'Fatima Ali',
    role: 'teacher',
    profilePicture: '/testimonial-sara.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    email: 'teacher3@iklearnedge.com',
    name: 'Muhammad Asif',
    role: 'teacher',
    profilePicture: '/testimonial-jackson.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    email: 'student1@iklearnedge.com',
    name: 'Omar Hassan',
    role: 'student',
    profilePicture: '/testimonial-jackson.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    email: 'student2@iklearnedge.com',
    name: 'Aisha Rahman',
    role: 'student',
    profilePicture: '/testimonial-sara.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Admin-Controlled Pricing Tiers by Subject and Grade
export const pricingTiers: PricingTier[] = [
  // Math Pricing
  { id: '1', subjectId: '1', gradeLevel: 'Grade 1-5 (Primary)', pricePerHour: 15 },
  { id: '2', subjectId: '1', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 18 },
  { id: '3', subjectId: '1', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 22 },
  { id: '4', subjectId: '1', gradeLevel: 'O-Level', pricePerHour: 28 },
  { id: '5', subjectId: '1', gradeLevel: 'A-Level', pricePerHour: 35 },
  { id: '6', subjectId: '1', gradeLevel: 'University/College', pricePerHour: 40 },
  
  // Physics Pricing
  { id: '7', subjectId: '2', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 18 },
  { id: '8', subjectId: '2', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 22 },
  { id: '9', subjectId: '2', gradeLevel: 'O-Level', pricePerHour: 28 },
  { id: '10', subjectId: '2', gradeLevel: 'A-Level', pricePerHour: 35 },
  { id: '11', subjectId: '2', gradeLevel: 'University/College', pricePerHour: 42 },
  
  // Chemistry Pricing
  { id: '12', subjectId: '3', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 18 },
  { id: '13', subjectId: '3', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 22 },
  { id: '14', subjectId: '3', gradeLevel: 'O-Level', pricePerHour: 28 },
  { id: '15', subjectId: '3', gradeLevel: 'A-Level', pricePerHour: 35 },
  { id: '16', subjectId: '3', gradeLevel: 'University/College', pricePerHour: 42 },
  
  // English Pricing
  { id: '17', subjectId: '4', gradeLevel: 'Grade 1-5 (Primary)', pricePerHour: 14 },
  { id: '18', subjectId: '4', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 17 },
  { id: '19', subjectId: '4', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 20 },
  { id: '20', subjectId: '4', gradeLevel: 'O-Level', pricePerHour: 25 },
  { id: '21', subjectId: '4', gradeLevel: 'A-Level', pricePerHour: 30 },
  { id: '22', subjectId: '4', gradeLevel: 'University/College', pricePerHour: 35 },
  { id: '23', subjectId: '4', gradeLevel: 'Adult Learning', pricePerHour: 28 },
  
  // Science Pricing
  { id: '24', subjectId: '5', gradeLevel: 'Grade 1-5 (Primary)', pricePerHour: 14 },
  { id: '25', subjectId: '5', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 17 },
  { id: '26', subjectId: '5', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 20 },
  
  // IELTS Pricing
  { id: '27', subjectId: '6', gradeLevel: 'Adult Learning', pricePerHour: 35 },
  
  // SAT Pricing
  { id: '28', subjectId: '7', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 38 },
  { id: '29', subjectId: '7', gradeLevel: 'A-Level', pricePerHour: 42 },
  
  // Biology Pricing
  { id: '30', subjectId: '8', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 17 },
  { id: '31', subjectId: '8', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 21 },
  { id: '32', subjectId: '8', gradeLevel: 'O-Level', pricePerHour: 27 },
  { id: '33', subjectId: '8', gradeLevel: 'A-Level', pricePerHour: 34 },
  
  // Computer Science Pricing
  { id: '34', subjectId: '9', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 20 },
  { id: '35', subjectId: '9', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 25 },
  { id: '36', subjectId: '9', gradeLevel: 'O-Level', pricePerHour: 30 },
  { id: '37', subjectId: '9', gradeLevel: 'A-Level', pricePerHour: 38 },
  { id: '38', subjectId: '9', gradeLevel: 'University/College', pricePerHour: 45 },
];

// Subjects - Admin Controlled
export const subjects: Subject[] = [
  {
    id: '1',
    name: 'Math',
    description: 'From basic arithmetic to advanced calculus, our math tutors make numbers make sense.',
    image: '/subject-math.jpg',
    tutorCount: 52,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '1')
  },
  {
    id: '2',
    name: 'Physics',
    description: 'Understand the laws of the universe with our expert Physics tutors.',
    image: '/subject-physics.jpg',
    tutorCount: 28,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '2')
  },
  {
    id: '3',
    name: 'Chemistry',
    description: 'Learn Chemistry from qualified professionals. Organic, inorganic, and physical chemistry.',
    image: '/subject-chemistry.jpg',
    tutorCount: 32,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '3')
  },
  {
    id: '4',
    name: 'English',
    description: 'Master English language skills with expert tutors. Grammar, literature, and communication.',
    image: '/subject-english.jpg',
    tutorCount: 45,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '4')
  },
  {
    id: '5',
    name: 'Science',
    description: 'Comprehensive science tutoring covering biology, earth science, and general science.',
    image: '/subject-science.jpg',
    tutorCount: 38,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '5')
  },
  {
    id: '6',
    name: 'IELTS',
    description: 'Prepare for your IELTS exam with certified trainers. Achieve your target band score.',
    image: '/subject-ielts.jpg',
    tutorCount: 24,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '6')
  },
  {
    id: '7',
    name: 'SAT',
    description: 'Comprehensive SAT preparation to help you get into your dream university.',
    image: '/subject-sat.jpg',
    tutorCount: 19,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '7')
  },
  {
    id: '8',
    name: 'Biology',
    description: 'Learn about living organisms, from cells to ecosystems.',
    image: '/subject-science.jpg',
    tutorCount: 22,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '8')
  },
  {
    id: '9',
    name: 'Computer Science',
    description: 'Programming, algorithms, and computer fundamentals.',
    image: '/subject-physics.jpg',
    tutorCount: 30,
    isActive: true,
    pricingTiers: pricingTiers.filter(p => p.subjectId === '9')
  }
];

// Teachers - No longer set their own prices
export const teachers: Teacher[] = [
  {
    id: '1',
    userId: '2',
    name: 'Ahmed Khan',
    email: 'teacher1@iklearnedge.com',
    bio: 'Experienced Mathematics teacher with 8+ years of teaching O-Level and A-Level students. Specialized in Algebra, Calculus, and Statistics.',
    subjects: ['1', '2'], // Math and Physics (IDs)
    profilePicture: '/testimonial-ahmed.jpg',
    highestDegree: {
      fileName: 'masters_degree.pdf',
      fileUrl: '/documents/degree1.pdf',
      uploadedAt: new Date('2024-01-15')
    },
    teachingCertificates: [
      {
        fileName: 'teaching_certificate.pdf',
        fileUrl: '/documents/cert1.pdf',
        uploadedAt: new Date('2024-01-15')
      }
    ],
    identityDocument: {
      type: 'cnic',
      fileName: 'cnic_front.jpg',
      fileUrl: '/documents/cnic1.jpg',
      uploadedAt: new Date('2024-01-15')
    },
    verificationStatus: 'approved',
    isLive: true,
    meetingLink: 'https://zoom.us/j/1234567890',
    availability: [
      { id: '1', day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { id: '2', day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { id: '3', day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    userId: '3',
    name: 'Fatima Ali',
    email: 'teacher2@iklearnedge.com',
    bio: 'English Language expert with Cambridge certification. 5 years of experience teaching IELTS and SAT preparation courses.',
    subjects: ['4', '6', '7'], // English, IELTS, SAT
    profilePicture: '/testimonial-sara.jpg',
    highestDegree: {
      fileName: 'bachelors_degree.pdf',
      fileUrl: '/documents/degree2.pdf',
      uploadedAt: new Date('2024-02-01')
    },
    teachingCertificates: [
      {
        fileName: 'ielts_trainer_cert.pdf',
        fileUrl: '/documents/cert2.pdf',
        uploadedAt: new Date('2024-02-01')
      }
    ],
    identityDocument: {
      type: 'passport',
      fileName: 'passport.jpg',
      fileUrl: '/documents/passport2.jpg',
      uploadedAt: new Date('2024-02-01')
    },
    verificationStatus: 'pending',
    isLive: false,
    availability: [
      { id: '4', day: 'tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
      { id: '5', day: 'thursday', startTime: '10:00', endTime: '18:00', isAvailable: true }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '3',
    userId: '4',
    name: 'Muhammad Asif',
    email: 'teacher3@iklearnedge.com',
    bio: 'Chemistry PhD with 10 years of teaching experience. Specializing in Organic Chemistry and preparing students for medical college entrance exams.',
    subjects: ['3', '5', '8'], // Chemistry, Science, Biology
    profilePicture: '/testimonial-jackson.jpg',
    highestDegree: {
      fileName: 'phd_chemistry.pdf',
      fileUrl: '/documents/degree3.pdf',
      uploadedAt: new Date('2024-02-10')
    },
    teachingCertificates: [
      {
        fileName: 'chemistry_teacher_cert.pdf',
        fileUrl: '/documents/cert3.pdf',
        uploadedAt: new Date('2024-02-10')
      }
    ],
    identityDocument: {
      type: 'cnic',
      fileName: 'cnic_front.jpg',
      fileUrl: '/documents/cnic3.jpg',
      uploadedAt: new Date('2024-02-10')
    },
    verificationStatus: 'approved',
    isLive: true,
    meetingLink: 'https://zoom.us/j/0987654321',
    availability: [
      { id: '6', day: 'monday', startTime: '14:00', endTime: '20:00', isAvailable: true },
      { id: '7', day: 'saturday', startTime: '09:00', endTime: '15:00', isAvailable: true }
    ],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12')
  }
];

// Students
export const students: Student[] = [
  {
    id: '1',
    userId: '5',
    name: 'Omar Hassan',
    email: 'student1@iklearnedge.com',
    gradeLevel: 'Grade 9-10 (Secondary)',
    profilePicture: '/testimonial-jackson.jpg',
    parentContact: '+971501234567',
    location: 'Dubai, UAE',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    userId: '6',
    name: 'Aisha Rahman',
    email: 'student2@iklearnedge.com',
    gradeLevel: 'O-Level',
    profilePicture: '/testimonial-sara.jpg',
    parentContact: '+971502345678',
    location: 'Dubai, UAE',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '3',
    userId: '7',
    name: 'Zaid Malik',
    email: 'student3@iklearnedge.com',
    gradeLevel: 'A-Level',
    profilePicture: '/testimonial-ahmed.jpg',
    parentContact: '+971503456789',
    location: 'Sharjah, UAE',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  }
];

// Payment Proofs
export const paymentProofs: PaymentProof[] = [
  {
    id: '1',
    bookingId: '1',
    fileName: 'bank_transfer_receipt.jpg',
    fileUrl: '/documents/payment1.jpg',
    uploadedAt: new Date('2024-02-20'),
    status: 'pending'
  },
  {
    id: '2',
    bookingId: '2',
    fileName: 'transaction_screenshot.png',
    fileUrl: '/documents/payment2.png',
    uploadedAt: new Date('2024-02-18'),
    status: 'approved',
    reviewedAt: new Date('2024-02-19'),
    reviewNotes: 'Payment verified successfully'
  }
];

// Bookings - Now include pricePerHour from admin pricing
export const bookings: Booking[] = [
  {
    id: '1',
    studentId: '1',
    teacherId: '1',
    subjectId: '1',
    subjectName: 'Math',
    gradeLevel: 'Grade 9-10 (Secondary)',
    status: 'pending_payment',
    scheduledDate: new Date('2024-03-01T10:00:00'),
    duration: 60,
    pricePerHour: 22, // Admin set price
    totalAmount: 22,
    notes: 'Need help with calculus integration',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: '2',
    studentId: '2',
    teacherId: '1',
    subjectId: '2',
    subjectName: 'Physics',
    gradeLevel: 'O-Level',
    status: 'confirmed',
    scheduledDate: new Date('2024-02-25T14:00:00'),
    duration: 90,
    pricePerHour: 28,
    totalAmount: 42,
    paymentProof: paymentProofs[1],
    meetingLink: 'https://zoom.us/j/1234567890',
    notes: 'Preparing for O-Level exams',
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-19')
  },
  {
    id: '3',
    studentId: '3',
    teacherId: '3',
    subjectId: '3',
    subjectName: 'Chemistry',
    gradeLevel: 'A-Level',
    status: 'payment_under_review',
    scheduledDate: new Date('2024-03-05T16:00:00'),
    duration: 60,
    pricePerHour: 35,
    totalAmount: 35,
    paymentProof: paymentProofs[0],
    notes: 'Organic chemistry help needed',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  }
];

// Class Sessions
export const classSessions: ClassSession[] = [
  {
    id: '1',
    bookingId: '2',
    teacherId: '1',
    studentId: '2',
    scheduledAt: new Date('2024-02-25T14:00:00'),
    duration: 90,
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/1234567890',
    createdAt: new Date('2024-02-19')
  },
  {
    id: '2',
    bookingId: '4',
    teacherId: '1',
    studentId: '1',
    scheduledAt: new Date('2024-02-20T10:00:00'),
    duration: 60,
    status: 'completed',
    meetingLink: 'https://zoom.us/j/1234567890',
    recordingUrl: '/recordings/session1.mp4',
    notes: 'Covered integration by parts',
    createdAt: new Date('2024-02-15')
  }
];

// Notifications
export const notifications: Notification[] = [
  {
    id: '1',
    userId: '2',
    title: 'Verification Approved',
    message: 'Your documents have been verified. You are now live on the platform!',
    type: 'success',
    isRead: false,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '2',
    userId: '2',
    title: 'New Booking',
    message: 'You have a new booking request from Omar Hassan for Math.',
    type: 'info',
    isRead: false,
    createdAt: new Date('2024-02-20')
  },
  {
    id: '3',
    userId: '1',
    title: 'Payment Proof Uploaded',
    message: 'A new payment proof has been uploaded and requires your review.',
    type: 'warning',
    isRead: false,
    createdAt: new Date('2024-02-20')
  }
];

// Stats
export const adminStats: AdminStats = {
  totalTeachers: 45,
  pendingVerifications: 8,
  totalStudents: 219,
  pendingPayments: 12,
  totalBookings: 633,
  completedClasses: 521,
  totalSubjects: 9,
  activeSubjects: 9,
  totalRevenue: 45000
};

export const teacherStats: TeacherStats = {
  totalStudents: 24,
  upcomingClasses: 5,
  completedClasses: 128,
  totalEarnings: 3200,
  pendingBookings: 3
};

export const studentStats: StudentStats = {
  totalBookings: 12,
  upcomingClasses: 2,
  completedClasses: 10,
  favoriteTeachers: 4,
  totalSpent: 850
};

// Helper functions
export const getTeacherById = (id: string): Teacher | undefined => {
  return teachers.find(t => t.id === id);
};

export const getStudentById = (id: string): Student | undefined => {
  return students.find(s => s.id === id);
};

export const getSubjectById = (id: string): Subject | undefined => {
  return subjects.find(s => s.id === id);
};

export const getBookingsByTeacher = (teacherId: string): Booking[] => {
  return bookings.filter(b => b.teacherId === teacherId);
};

export const getBookingsByStudent = (studentId: string): Booking[] => {
  return bookings.filter(b => b.studentId === studentId);
};

export const getPendingVerifications = (): Teacher[] => {
  return teachers.filter(t => t.verificationStatus === 'pending');
};

export const getPendingPayments = (): Booking[] => {
  return bookings.filter(b => b.status === 'payment_under_review');
};

export const getLiveTeachers = (): Teacher[] => {
  return teachers.filter(t => t.isLive);
};

// Get price for a subject and grade level (Admin controlled)
export const getPriceForSubjectAndGrade = (subjectId: string, gradeLevel: string): number => {
  const tier = pricingTiers.find(
    p => p.subjectId === subjectId && p.gradeLevel === gradeLevel
  );
  return tier?.pricePerHour || 20; // Default price if not found
};

// Calculate total price for a booking
export const calculateBookingPrice = (
  subjectId: string, 
  gradeLevel: string, 
  durationMinutes: number
): { pricePerHour: number; totalAmount: number } => {
  const pricePerHour = getPriceForSubjectAndGrade(subjectId, gradeLevel);
  const totalAmount = Math.round((pricePerHour * durationMinutes) / 60);
  return { pricePerHour, totalAmount };
};

// Get all active subjects
export const getActiveSubjects = (): Subject[] => {
  return subjects.filter(s => s.isActive);
};

// Get teachers by subject
export const getTeachersBySubject = (subjectId: string): Teacher[] => {
  return teachers.filter(t => t.subjects.includes(subjectId) && t.isLive);
};
