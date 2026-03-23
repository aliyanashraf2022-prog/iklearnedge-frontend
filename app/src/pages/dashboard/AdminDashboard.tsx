import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  Plus,
  Settings,
  Users,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import BankDetailsPage from '@/pages/admin/BankDetailsPage';
import { adminAPI, bookingsAPI, paymentsAPI, subjectsAPI, teachersAPI } from '@/services/api';
import type { AdminStats, Booking, Student, Subject, Teacher } from '@/types';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Settings },
  { id: 'verifications', label: 'Teacher Verifications', icon: UserCheck },
  { id: 'payments', label: 'Payment Verification', icon: CreditCard },
  { id: 'subjects', label: 'Subjects & Pricing', icon: BookOpen },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'classes', label: 'Classes', icon: CalendarDays },
  { id: 'bank-details', label: 'Bank Details', icon: Building2 },
] as const;

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

const gradeLevels = [
  'Grade 1-5 (Primary)',
  'Grade 6-8 (Middle)',
  'Grade 9-10 (Secondary)',
  'O-Level',
  'A-Level',
  'University/College',
  'Adult Learning',
];

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const { formatCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<{ all: Booking[]; upcoming: Booking[]; completed: Booking[]; pending: Booking[] }>({
    all: [],
    upcoming: [],
    completed: [],
    pending: [],
  });
  const [pendingVerifications, setPendingVerifications] = useState<Teacher[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Booking[]>([]);
  const [paymentNotes, setPaymentNotes] = useState<Record<string, string>>({});
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: '',
    prices: {} as Record<string, number>,
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        subjectsData,
        teachersData,
        studentsData,
        classesData,
        verificationsData,
        pendingAdminData,
      ] = await Promise.all([
        adminAPI.getStats(),
        subjectsAPI.getAllAdmin(),
        adminAPI.getAllTeachers(),
        adminAPI.getAllStudents(),
        adminAPI.getClasses(),
        adminAPI.getPendingVerifications(),
        bookingsAPI.getPendingAdmin(),
      ]);

      setStats(statsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setStudents(studentsData);
      setClasses(classesData);
      setPendingVerifications(verificationsData);
      setPendingPayments(pendingAdminData.filter((booking) => !!booking.paymentProof?.id || !!booking.receiptUrl));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const subjectToEdit = useMemo(() => {
    if (!selectedSubject) {
      return null;
    }

    const prices = selectedSubject.pricingTiers.reduce<Record<string, number>>((accumulator, tier) => {
      accumulator[tier.gradeLevel] = tier.pricePerHour;
      return accumulator;
    }, {});

    return {
      ...selectedSubject,
      prices,
    };
  }, [selectedSubject]);

  const handleTeacherVerification = async (teacherId: string, status: 'approved' | 'rejected') => {
    try {
      setSaving(true);
      await teachersAPI.verify(teacherId, status, verificationNotes[teacherId]);
      toast.success(status === 'approved' ? 'Teacher approved' : 'Teacher rejected');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update teacher verification');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentDecision = async (booking: Booking, status: 'approved' | 'rejected') => {
  // Use the ID from the paymentProof object if it exists, otherwise fall back to booking.id
  const paymentProofId = booking.paymentProof?.id || booking.id;

  if (!paymentProofId) {
    toast.error('Receipt data is missing for this booking');
    return;
  }

  try {
    setSaving(true);
    // This will now send ID '6' instead of '22'
    await paymentsAPI.verify(paymentProofId, status, paymentNotes[booking.id] || '');
    
    toast.success(status === 'approved' ? 'Payment approved and sent to teacher' : 'Payment rejected');
    await loadDashboard();
  } catch (error: any) {
    toast.error(error.message || 'Failed to review payment');
  } finally {
    setSaving(false);
  }
};

  const handleAddSubject = async () => {
    if (!subjectForm.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (!gradeLevels.some((grade) => Number(subjectForm.prices[grade]) > 0)) {
      toast.error('Add at least one pricing tier before creating the subject');
      return;
    }

    try {
      setSaving(true);
      await subjectsAPI.create({
        name: subjectForm.name,
        description: subjectForm.description,
        pricingTiers: gradeLevels
          .filter((grade) => Number(subjectForm.prices[grade]) > 0)
          .map((grade) => ({
            gradeLevel: grade,
            pricePerHour: Number(subjectForm.prices[grade]),
          })),
      });
      toast.success('Subject created successfully');
      setIsAddingSubject(false);
      setSubjectForm({ name: '', description: '', prices: {} });
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePricing = async () => {
    if (!selectedSubject) {
      return;
    }

    try {
      setSaving(true);
      await subjectsAPI.updatePricing(
        selectedSubject.id,
        gradeLevels
          .filter((grade) => Number(subjectForm.prices[grade]) > 0)
          .map((grade) => ({
            id: '',
            subjectId: selectedSubject.id,
            gradeLevel: grade,
            pricePerHour: Number(subjectForm.prices[grade]),
          })),
      );
      toast.success('Pricing updated successfully');
      setSelectedSubject(null);
      setSubjectForm({ name: '', description: '', prices: {} });
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateSubject = async (subjectId: string) => {
    try {
      setSaving(true);
      await subjectsAPI.delete(subjectId);
      toast.success('Subject deactivated');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate subject');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
      </div>
    );
  }

  const renderOverview = () => (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Teachers" value={stats?.totalTeachers || 0} hint="All teacher accounts" />
        <StatCard label="Students" value={stats?.totalStudents || 0} hint="Registered students" />
        <StatCard label="Pending Verifications" value={pendingVerifications.length} hint="Teacher applications waiting on admin" />
        <StatCard label="Revenue" value={formatCurrency(stats?.totalRevenue || 0)} hint="Accepted and completed paid classes" />
      </div>

      <Panel title="Action Queues" description="The important operational queues are summarized here.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Teacher verifications</h3>
                <p className="text-sm text-slate-500">{pendingVerifications.length} teacher(s) waiting</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Payment verification</h3>
                <p className="text-sm text-slate-500">{pendingPayments.length} booking(s) waiting</p>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </>
  );

  const renderVerifications = () => (
    <Panel title="Teacher Verifications" description="Approve teachers to make them visible for live bookings.">
      <div className="space-y-4">
        {pendingVerifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No pending teacher applications.
          </div>
        ) : pendingVerifications.map((teacher) => (
          <article key={teacher.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <img
                  src={teacher.profilePicture || '/default-avatar.png'}
                  alt={teacher.name}
                  className="h-20 w-20 rounded-3xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-950">{teacher.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{teacher.email}</p>
                  <p className="mt-3 text-sm text-slate-600">{teacher.bio || 'No teacher bio provided.'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {teacher.subjects.map((subject) => (
                      <span key={subject.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {subject.name || 'Subject'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Optional note for approval or rejection"
                value={verificationNotes[teacher.id] || ''}
                onChange={(event) => setVerificationNotes((current) => ({
                  ...current,
                  [teacher.id]: event.target.value,
                }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleTeacherVerification(teacher.id, 'approved')}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
                >
                  Approve teacher
                </button>
                <button
                  type="button"
                  onClick={() => handleTeacherVerification(teacher.id, 'rejected')}
                  className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Reject teacher
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderPayments = () => (
    <Panel title="Payment Verification" description="Approve paid class receipts to forward the request to the teacher.">
      <div className="space-y-4">
        {pendingPayments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No payment receipts waiting for review.
          </div>
        ) : pendingPayments.map((booking) => (
          <article key={booking.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{booking.subjectName}</h3>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {booking.isDemo ? 'Demo' : 'Paid class'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Student: {booking.studentName}</p>
                  <p className="mt-1 text-sm text-slate-600">Teacher: {booking.teacherName}</p>
                  <p className="mt-1 text-sm text-slate-600">Amount: {formatCurrency(booking.totalAmount)}</p>
                  <p className="mt-1 text-sm text-slate-500">Requested time: {new Date(booking.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>

                {(booking.receiptUrl || booking.paymentProof?.fileUrl) ? (
                  <a
                    href={booking.receiptUrl || booking.paymentProof?.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#f5a623]"
                  >
                    View receipt
                  </a>
                ) : (
                  <span className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">Receipt missing</span>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Optional note for approval or rejection"
                value={paymentNotes[booking.id] || ''}
                onChange={(event) => setPaymentNotes((current) => ({
                  ...current,
                  [booking.id]: event.target.value,
                }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handlePaymentDecision(booking, 'approved')}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
                >
                  Approve payment
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentDecision(booking, 'rejected')}
                  className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Reject payment
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderSubjects = () => (
    <Panel title="Subjects & Pricing" description="Create subjects and maintain grade-based pricing tiers.">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsAddingSubject(true);
            setSelectedSubject(null);
            setSubjectForm({ name: '', description: '', prices: {} });
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
        >
          <Plus className="h-4 w-4" />
          Add subject
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {subjects.map((subject) => (
          <article key={subject.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{subject.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{subject.description || 'No description set.'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${subject.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {subject.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              {subject.pricingTiers.length === 0 && <p>No pricing tiers configured.</p>}
              {subject.pricingTiers.map((tier) => (
                <div key={tier.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>{tier.gradeLevel}</span>
                  <span className="font-medium">{formatCurrency(tier.pricePerHour)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject(subject);
                  setIsAddingSubject(false);
                  setSubjectForm({
                    name: subject.name,
                    description: subject.description,
                    prices: subject.pricingTiers.reduce<Record<string, number>>((accumulator, tier) => {
                      accumulator[tier.gradeLevel] = tier.pricePerHour;
                      return accumulator;
                    }, {}),
                  });
                }}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#f5a623]"
              >
                Edit pricing
              </button>
              <button
                type="button"
                onClick={() => handleDeactivateSubject(subject.id)}
                className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Deactivate
              </button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderTeachers = () => (
    <Panel title="Teachers" description="All teacher accounts in the system.">
      <div className="space-y-4">
        {teachers.map((teacher) => (
          <article key={teacher.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={teacher.profilePicture || '/default-avatar.png'}
                  alt={teacher.name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-950">{teacher.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{teacher.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {teacher.subjects.map((subject) => (
                      <span key={subject.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {subject.name || 'Subject'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${teacher.isLive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {teacher.isLive ? 'Live' : 'Offline'}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${teacher.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : teacher.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {teacher.verificationStatus}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderStudents = () => (
    <Panel title="Students" description="Registered student accounts.">
      <div className="space-y-4">
        {students.map((student) => (
          <article key={student.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={student.profilePicture || '/default-avatar.png'}
                  alt={student.name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-950">{student.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{student.email}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Grade: {student.gradeLevel || 'Not set'}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderClasses = () => (
    <Panel title="Classes" description="All class bookings across pending, accepted, and completed states.">
      <div className="space-y-4">
        {classes.all.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            No classes found.
          </div>
        ) : classes.all.map((booking) => (
          <article key={booking.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-950">{booking.subjectName}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    booking.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'completed'
                        ? 'bg-slate-200 text-slate-700'
                        : booking.status === 'pending_admin' || booking.status === 'pending_teacher'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {booking.studentName} with {booking.teacherName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(booking.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {formatCurrency(booking.totalAmount)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  return (
    <>
      <DashboardLayout
        title={NAV_ITEMS.find((item) => item.id === activeTab)?.label || 'Admin Dashboard'}
        subtitle="Keep payments, teachers, subjects, and bookings aligned across the whole system."
        userName={user.name}
        roleLabel="Admin"
        avatarUrl={user.profilePicture}
        navItems={[...NAV_ITEMS]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'verifications' && renderVerifications()}
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'subjects' && renderSubjects()}
        {activeTab === 'teachers' && renderTeachers()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'classes' && renderClasses()}
        {activeTab === 'bank-details' && <BankDetailsPage />}
      </DashboardLayout>

      {(isAddingSubject || selectedSubject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#d99018]">{selectedSubject ? 'Edit pricing' : 'Add subject'}</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                  {selectedSubject ? selectedSubject.name : 'Create a new subject'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubject(false);
                  setSelectedSubject(null);
                  setSubjectForm({ name: '', description: '', prices: {} });
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {!selectedSubject && (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Subject name</span>
                    <input
                      type="text"
                      value={subjectForm.name}
                      onChange={(event) => setSubjectForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Description</span>
                    <textarea
                      rows={4}
                      value={subjectForm.description}
                      onChange={(event) => setSubjectForm((current) => ({ ...current, description: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                    />
                  </label>
                </>
              )}

              <div className="grid gap-3">
                {gradeLevels.map((grade) => (
                  <label key={grade} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
                    <span className="text-sm text-slate-700">{grade}</span>
                    <input
                      type="number"
                      min="0"
                      value={subjectForm.prices[grade] || ''}
                      onChange={(event) => setSubjectForm((current) => ({
                        ...current,
                        prices: {
                          ...current.prices,
                          [grade]: Number(event.target.value),
                        },
                      }))}
                      className="w-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                      placeholder="0"
                    />
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={selectedSubject ? handleUpdatePricing : handleAddSubject}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
                disabled={saving}
              >
                {selectedSubject ? 'Save pricing' : 'Create subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
