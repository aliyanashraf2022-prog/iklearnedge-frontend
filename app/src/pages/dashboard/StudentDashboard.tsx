import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Save,
  Search,
  Settings,
  Upload,
  Users,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  authAPI,
  bookingsAPI,
  paymentsAPI,
  settingsAPI,
  studentsAPI,
  subjectsAPI,
  teachersAPI,
  uploadAPI,
} from '@/services/api';
import type { Booking, Student, Subject, Teacher } from '@/types';

const NAV_ITEMS = [
  { id: 'find-teachers', label: 'Find Teachers', icon: Search },
  { id: 'my-classes', label: 'Upcoming Classes', icon: CalendarDays },
  { id: 'my-teachers', label: 'My Teachers', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: Settings },
] as const;

const dayToIndex: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const normalizeGradeLevel = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (/^grade\s*[1-5]$/.test(normalized)) {
    return 'Grade 1-5 (Primary)';
  }

  if (/^grade\s*[6-8]$/.test(normalized)) {
    return 'Grade 6-8 (Middle)';
  }

  if (normalized === 'grade 9' || normalized === 'grade 10') {
    return 'Grade 9-10 (Secondary)';
  }

  return value;
};

const toLocalInputValue = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const formatDateTime = (value: string) => new Date(value).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const getStatusClasses = (status: Booking['status']) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-700';
    case 'pending_admin':
      return 'bg-amber-100 text-amber-700';
    case 'pending_teacher':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-slate-200 text-slate-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const Panel: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <section className="rounded-3xl bg-white p-6 shadow-sm">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {children}
  </section>
);

const StatCard: React.FC<{ label: string; value: string | number; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-3xl bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
  </div>
);

const StudentDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('find-teachers');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myTeachers, setMyTeachers] = useState<Teacher[]>([]);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    iban: '',
    accountHolderName: '',
    swiftCode: '',
    branchAddress: '',
    isActive: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [bookingMode, setBookingMode] = useState<'demo' | 'paid' | null>(null);
  const [bookingForm, setBookingForm] = useState({
    subjectId: '',
    scheduledDate: '',
    duration: 60,
    notes: '',
    receiptFile: null as File | null,
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    gradeLevel: '',
    parentContact: '',
    location: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [studentProfile, teacherList, subjectList, bookingList, teacherHistory, bank] = await Promise.all([
        studentsAPI.getProfile(),
        teachersAPI.getAll(),
        subjectsAPI.getAll(),
        bookingsAPI.getAll(),
        studentsAPI.getMyTeachers(),
        settingsAPI.getBankDetails(),
      ]);

      setStudent(studentProfile);
      setTeachers(teacherList);
      setSubjects(subjectList);
      setBookings(bookingList);
      setMyTeachers(teacherHistory);
      setBankDetails(bank);
      setProfileForm({
        name: studentProfile.name || '',
        gradeLevel: normalizeGradeLevel(studentProfile.gradeLevel || ''),
        parentContact: studentProfile.parentContact || '',
        location: studentProfile.location || '',
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return teachers.filter((teacher) => {
      if (!teacher.isLive || teacher.verificationStatus !== 'approved') {
        return false;
      }

      if (!query) {
        return true;
      }

      const subjectNames = teacher.subjects.map((subject) => subject.name.toLowerCase()).join(' ');
      return teacher.name.toLowerCase().includes(query)
        || teacher.bio.toLowerCase().includes(query)
        || subjectNames.includes(query);
    });
  }, [searchQuery, teachers]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === bookingForm.subjectId) || null,
    [bookingForm.subjectId, subjects],
  );

  const selectedPrice = useMemo(() => {
    if (!selectedSubject || !student?.gradeLevel) {
      return 0;
    }

    const gradeLevel = normalizeGradeLevel(student.gradeLevel || '');
    return selectedSubject.pricingTiers.find((tier) => tier.gradeLevel === gradeLevel)?.pricePerHour || 0;
  }, [selectedSubject, student?.gradeLevel]);

  const totalAmount = Math.round((selectedPrice * bookingForm.duration) / 60);

  const upcomingBookings = useMemo(
    () => bookings
      .filter((booking) => booking.status === 'accepted')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
    [bookings],
  );

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending_admin' || booking.status === 'pending_teacher'),
    [bookings],
  );

  const paidBookings = useMemo(
    () => bookings.filter((booking) => !booking.isDemo),
    [bookings],
  );

  const resetBookingModal = () => {
    setSelectedTeacher(null);
    setBookingMode(null);
    setBookingForm({
      subjectId: '',
      scheduledDate: '',
      duration: 60,
      notes: '',
      receiptFile: null,
    });
  };

  const nextOccurrenceForSlot = (day: string, startTime: string) => {
    const target = new Date();
    const targetDay = dayToIndex[day] ?? 0;
    const dayOffset = (targetDay - target.getDay() + 7) % 7;
    target.setDate(target.getDate() + dayOffset);
    const [hours, minutes] = startTime.split(':').map(Number);
    target.setHours(hours, minutes, 0, 0);
    if (target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 7);
    }
    return toLocalInputValue(target);
  };

  const openBookingModal = (teacher: Teacher, mode: 'demo' | 'paid') => {
    const defaultSubjectId = teacher.subjects[0]?.id || '';
    const defaultSlot = teacher.availability.find((slot) => slot.isAvailable);
    setSelectedTeacher(teacher);
    setBookingMode(mode);
    setBookingForm({
      subjectId: defaultSubjectId,
      scheduledDate: defaultSlot ? nextOccurrenceForSlot(defaultSlot.day, defaultSlot.startTime) : '',
      duration: 60,
      notes: '',
      receiptFile: null,
    });
  };

  const handleProfileSave = async () => {
    if (!student) {
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await authAPI.updateProfile({ name: profileForm.name });
      const updatedStudent = await studentsAPI.updateProfile({
        gradeLevel: profileForm.gradeLevel,
        parentContact: profileForm.parentContact,
        location: profileForm.location,
      });

      updateUser(updatedUser);
      setStudent({
        ...updatedStudent,
        profilePicture: updatedUser.profilePicture || updatedStudent.profilePicture,
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      setUploadingPicture(true);
      const uploaded = await uploadAPI.uploadProfilePicture(file);
      const updatedUser = await authAPI.updateProfile({ profilePicture: uploaded.url });
      updateUser(updatedUser);
      setStudent((current) => current ? { ...current, profilePicture: updatedUser.profilePicture || uploaded.url } : current);
      toast.success('Profile picture updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDemoBooking = async () => {
    if (!selectedTeacher || !bookingForm.subjectId || !bookingForm.scheduledDate) {
      toast.error('Choose a subject and preferred time first');
      return;
    }

    try {
      setSaving(true);
      await bookingsAPI.createDemo({
        teacherId: selectedTeacher.id,
        subjectId: bookingForm.subjectId,
        scheduledDate: new Date(bookingForm.scheduledDate).toISOString(),
      });
      toast.success('Demo request sent to the teacher');
      resetBookingModal();
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to request demo class');
    } finally {
      setSaving(false);
    }
  };

  const handlePaidBooking = async () => {
    if (!selectedTeacher || !bookingForm.subjectId || !bookingForm.scheduledDate) {
      toast.error('Choose a subject and preferred time first');
      return;
    }

    if (!selectedPrice) {
      toast.error('No pricing tier is configured for your grade level and subject');
      return;
    }

    if (!bookingForm.receiptFile) {
      toast.error('Upload the payment receipt before submitting');
      return;
    }

    try {
      setSaving(true);
      const booking = await bookingsAPI.create({
        teacherId: selectedTeacher.id,
        subjectId: bookingForm.subjectId,
        scheduledDate: new Date(bookingForm.scheduledDate).toISOString(),
        duration: bookingForm.duration,
        notes: bookingForm.notes,
      });

      const upload = await uploadAPI.uploadPaymentProof(bookingForm.receiptFile, booking.id);
      await paymentsAPI.uploadProof({
        bookingId: booking.id,
        fileUrl: upload.url,
        fileName: upload.fileName,
      });

      toast.success('Class request submitted for admin verification');
      resetBookingModal();
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit class request');
    } finally {
      setSaving(false);
    }
  };

  const copyMeetingLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Class link copied');
    } catch {
      toast.error('Failed to copy class link');
    }
  };

  if (loading || !student || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
      </div>
    );
  }

  const renderFindTeachers = () => (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available Teachers" value={filteredTeachers.length} hint="Verified teachers ready for booking" />
        <StatCard label="Pending Requests" value={pendingBookings.length} hint="Awaiting admin or teacher action" />
        <StatCard label="Upcoming Classes" value={upcomingBookings.length} hint="Accepted classes with links and schedules" />
      </div>

      <Panel title="Find Teachers" description="Search by tutor name, subject, or teaching summary.">
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search teachers or subjects"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none ring-0 transition focus:border-[#f5a623] focus:bg-white"
          />
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
            No teachers matched your search.
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredTeachers.map((teacher) => (
              <article key={teacher.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-col gap-5 md:flex-row">
                  <img
                    src={teacher.profilePicture || '/default-avatar.png'}
                    alt={teacher.name}
                    className="h-24 w-24 rounded-3xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">{teacher.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{teacher.bio || 'Experienced tutor available for live classes.'}</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Live
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {teacher.subjects.map((subject) => (
                        <span key={subject.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {subject.name || 'Subject'}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Availability</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {teacher.availability.filter((slot) => slot.isAvailable).slice(0, 4).map((slot) => (
                          <span key={slot.id} className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            {slot.day.slice(0, 3)} {slot.startTime}-{slot.endTime}
                          </span>
                        ))}
                        {teacher.availability.filter((slot) => slot.isAvailable).length === 0 && (
                          <span className="text-sm text-slate-500">Teacher has not published slots yet.</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openBookingModal(teacher, 'demo')}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#f5a623] hover:text-[#d99018]"
                      >
                        Book Demo Class
                      </button>
                      <button
                        type="button"
                        onClick={() => openBookingModal(teacher, 'paid')}
                        className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
                      >
                        Book Paid Class
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </>
  );

  const renderMyClasses = () => (
    <>
      <Panel title="Upcoming Classes" description="Accepted classes appear here with the live meeting link.">
        <div className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
              No upcoming classes yet.
            </div>
          ) : upcomingBookings.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{booking.subjectName}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                    {booking.isDemo && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Demo</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">Teacher: {booking.teacherName}</p>
                  <p className="text-sm text-slate-600">Date: {formatDateTime(booking.scheduledDate)}</p>
                  <p className="text-sm text-slate-600">Duration: {booking.duration} minutes</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {booking.meetingLink ? (
                    <>
                      <button
                        type="button"
                        onClick={() => copyMeetingLink(booking.meetingLink || '')}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#f5a623]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </span>
                      </button>
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Join Class
                        </span>
                      </a>
                    </>
                  ) : (
                    <span className="rounded-2xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
                      Waiting for teacher link
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Pending Requests" description="Track requests waiting for admin verification or teacher review.">
        <div className="space-y-4">
          {pendingBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
              No pending requests.
            </div>
          ) : pendingBookings.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{booking.subjectName}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{booking.teacherName} on {formatDateTime(booking.scheduledDate)}</p>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {booking.isDemo ? 'Free demo' : `$${booking.totalAmount.toFixed(2)}`}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );

  const renderMyTeachers = () => (
    <Panel title="My Teachers" description="Teachers from your accepted or completed class history.">
      <div className="grid gap-4 md:grid-cols-2">
        {myTeachers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 md:col-span-2">
            Your teachers will appear here after your first accepted class.
          </div>
        ) : myTeachers.map((teacher) => (
          <article key={teacher.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-4">
              <img
                src={teacher.profilePicture || '/default-avatar.png'}
                alt={teacher.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-950">{teacher.name}</h3>
                <p className="text-sm text-slate-500">{teacher.bio || 'Professional tutor'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {teacher.subjects.map((subject) => (
                    <span key={subject.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {subject.name || 'Subject'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderPayments = () => (
    <Panel title="Payment Requests" description="Paid class requests, receipt status, and verification progress.">
      <div className="space-y-4">
        {paidBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No paid class requests yet.
          </div>
        ) : paidBookings.map((booking) => (
          <article key={booking.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-950">{booking.subjectName}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{booking.teacherName} on {formatDateTime(booking.scheduledDate)}</p>
                <p className="mt-1 text-sm text-slate-600">Amount: ${booking.totalAmount.toFixed(2)}</p>
                {booking.receiptUrl && (
                  <a
                    href={booking.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#d99018]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View uploaded receipt
                  </a>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {booking.status === 'pending_admin' && 'Waiting for admin payment verification'}
                {booking.status === 'pending_teacher' && 'Payment approved. Waiting for teacher acceptance'}
                {booking.status === 'accepted' && 'Accepted by teacher'}
                {booking.status === 'rejected' && 'Request rejected'}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderProfile = () => (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <Panel title="Profile" description="Manage your student details and profile picture.">
        <div className="grid gap-6 md:grid-cols-[220px,1fr]">
          <div className="rounded-3xl bg-slate-50 p-5 text-center">
            <img
              src={student.profilePicture || '/default-avatar.png'}
              alt={student.name}
              className="mx-auto h-32 w-32 rounded-3xl object-cover"
            />
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#f5a623]">
              <Upload className="h-4 w-4" />
              {uploadingPicture ? 'Uploading...' : 'Change picture'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleProfilePictureUpload(file);
                  }
                }}
                disabled={uploadingPicture}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <input
                type="text"
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={student.email}
                readOnly
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Grade level</span>
              <select
                value={profileForm.gradeLevel}
                onChange={(event) => setProfileForm((current) => ({ ...current, gradeLevel: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              >
                <option value="">Select your grade level</option>
                {[
                  'Grade 1-5 (Primary)',
                  'Grade 6-8 (Middle)',
                  'Grade 9-10 (Secondary)',
                  'O-Level',
                  'A-Level',
                  'University/College',
                  'Adult Learning',
                ].map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Parent contact</span>
              <input
                type="text"
                value={profileForm.parentContact}
                onChange={(event) => setProfileForm((current) => ({ ...current, parentContact: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input
                type="text"
                value={profileForm.location}
                onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              />
            </label>
            <button
              type="button"
              onClick={handleProfileSave}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950 md:col-span-2"
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              Save profile
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Security" description="Change your password and keep your account secure.">
        <div className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Current password</span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Confirm new password</span>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
            />
          </label>
          <button
            type="button"
            onClick={handlePasswordChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#f5a623] hover:text-[#d99018]"
            disabled={saving}
          >
            Update password
          </button>
        </div>
      </Panel>
    </div>
  );

  return (
    <>
      <DashboardLayout
        title={NAV_ITEMS.find((item) => item.id === activeTab)?.label || 'Student Dashboard'}
        subtitle="Book demo classes, upload receipts, and manage your class schedule."
        userName={student.name}
        roleLabel="Student"
        avatarUrl={student.profilePicture}
        navItems={[...NAV_ITEMS]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      >
        {activeTab === 'find-teachers' && renderFindTeachers()}
        {activeTab === 'my-classes' && renderMyClasses()}
        {activeTab === 'my-teachers' && renderMyTeachers()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'profile' && renderProfile()}
      </DashboardLayout>

      {selectedTeacher && bookingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#d99018]">
                  {bookingMode === 'demo' ? 'Book Demo Class' : 'Book Paid Class'}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">{selectedTeacher.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{selectedTeacher.bio || 'Professional tutor ready for your next class.'}</p>
              </div>
              <button
                type="button"
                onClick={resetBookingModal}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Subject</span>
                  <select
                    value={bookingForm.subjectId}
                    onChange={(event) => setBookingForm((current) => ({ ...current, subjectId: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                  >
                    <option value="">Select subject</option>
                    {selectedTeacher.subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name || 'Subject'}</option>
                    ))}
                  </select>
                </label>

                <div>
                  <p className="text-sm font-medium text-slate-700">Teacher availability</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTeacher.availability.filter((slot) => slot.isAvailable).map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setBookingForm((current) => ({
                          ...current,
                          scheduledDate: nextOccurrenceForSlot(slot.day, slot.startTime),
                        }))}
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-[#f5a623] hover:text-[#d99018]"
                      >
                        {slot.day.slice(0, 3)} {slot.startTime}-{slot.endTime}
                      </button>
                    ))}
                    {selectedTeacher.availability.filter((slot) => slot.isAvailable).length === 0 && (
                      <p className="text-sm text-slate-500">No availability slots published yet. Pick a custom time below.</p>
                    )}
                  </div>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Preferred date and time</span>
                  <input
                    type="datetime-local"
                    value={bookingForm.scheduledDate}
                    onChange={(event) => setBookingForm((current) => ({ ...current, scheduledDate: event.target.value }))}
                    min={toLocalInputValue(new Date())}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                  />
                </label>

                {bookingMode === 'paid' && (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Duration</span>
                      <select
                        value={bookingForm.duration}
                        onChange={(event) => setBookingForm((current) => ({ ...current, duration: Number(event.target.value) }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                        <option value={120}>120 minutes</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Receipt upload</span>
                      <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          {bookingForm.receiptFile ? bookingForm.receiptFile.name : 'Choose receipt image or PDF'}
                        </span>
                        <span className="font-medium text-[#d99018]">Browse</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={(event) => setBookingForm((current) => ({
                            ...current,
                            receiptFile: event.target.files?.[0] || null,
                          }))}
                        />
                      </label>
                    </label>
                  </>
                )}

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Notes</span>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                    placeholder="Share anything the teacher should know before the class."
                  />
                </label>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-white/70">{bookingMode === 'demo' ? 'Demo booking' : 'Pricing summary'}</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {bookingMode === 'demo' ? 'Free' : `$${totalAmount.toFixed(2)}`}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-white/80">
                    <p>Subject: {selectedTeacher.subjects.find((subject) => subject.id === bookingForm.subjectId)?.name || 'Choose a subject'}</p>
                    <p>Grade level: {student.gradeLevel || 'Not set'}</p>
                    {bookingMode === 'paid' && (
                      <>
                        <p>Hourly rate: ${selectedPrice.toFixed(2)}</p>
                        <p>Duration: {bookingForm.duration} minutes</p>
                      </>
                    )}
                  </div>
                </div>

                {bookingMode === 'paid' && (
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h4 className="font-semibold text-slate-950">Bank details</h4>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-800">Bank:</span> {bankDetails.bankName || 'Not configured'}</p>
                      <p><span className="font-medium text-slate-800">Account:</span> {bankDetails.accountNumber || 'Not configured'}</p>
                      <p><span className="font-medium text-slate-800">IBAN:</span> {bankDetails.iban || 'Not configured'}</p>
                      <p><span className="font-medium text-slate-800">Holder:</span> {bankDetails.accountHolderName || 'Not configured'}</p>
                      {bankDetails.swiftCode && <p><span className="font-medium text-slate-800">SWIFT:</span> {bankDetails.swiftCode}</p>}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={bookingMode === 'demo' ? handleDemoBooking : handlePaidBooking}
                  disabled={saving || (bookingMode === 'paid' && !selectedPrice)}
                  className="w-full rounded-2xl bg-[#f5a623] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d99018] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Submitting...'
                    : bookingMode === 'demo'
                      ? 'Send demo request'
                      : 'Submit paid booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentDashboard;
