import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  FileText,
  Loader2,
  Save,
  Settings,
  Upload,
  Users,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import SchedulesPage from '@/pages/teacher-dashboard/SchedulesPage';
import { authAPI, bookingsAPI, teachersAPI, uploadAPI } from '@/services/api';
import type { Booking, Teacher } from '@/types';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'profile', label: 'Profile', icon: Settings },
] as const;

const getStatusClasses = (status: Booking['status']) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-700';
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

const TeacherDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [teacherProfile, teacherBookings] = await Promise.all([
        teachersAPI.getProfile(),
        bookingsAPI.getByTeacher(),
      ]);

      setTeacher(teacherProfile);
      setBookings(teacherBookings);
      setProfileForm({
        name: teacherProfile.name || '',
        bio: teacherProfile.bio || '',
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to load teacher dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingRequests = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending_teacher'),
    [bookings],
  );

  const upcomingClasses = useMemo(
    () => bookings
      .filter((booking) => booking.status === 'accepted')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
    [bookings],
  );

  const completedClasses = useMemo(
    () => bookings.filter((booking) => booking.status === 'completed'),
    [bookings],
  );

  const students = useMemo(() => {
    const map = new Map<string, { name: string; email: string; bookings: number; nextClass?: string; subjectName?: string }>();

    bookings
      .filter((booking) => booking.status === 'accepted' || booking.status === 'completed')
      .forEach((booking) => {
        const current = map.get(booking.studentId) || {
          name: booking.studentName || 'Student',
          email: booking.studentEmail || '',
          bookings: 0,
          nextClass: undefined,
          subjectName: booking.subjectName,
        };

        current.bookings += 1;
        if (!current.nextClass || new Date(booking.scheduledDate).getTime() < new Date(current.nextClass).getTime()) {
          current.nextClass = booking.scheduledDate;
          current.subjectName = booking.subjectName;
        }

        map.set(booking.studentId, current);
      });

    return Array.from(map.entries()).map(([id, value]) => ({ id, ...value }));
  }, [bookings]);

  const totalEarnings = useMemo(
    () => bookings
      .filter((booking) => !booking.isDemo && (booking.status === 'accepted' || booking.status === 'completed'))
      .reduce((sum, booking) => sum + booking.totalAmount, 0),
    [bookings],
  );

  const handleRespond = async (booking: Booking, decision: 'accept' | 'reject') => {
    if (decision === 'accept' && !meetingLinks[booking.id]?.trim()) {
      toast.error('Paste the class link before accepting');
      return;
    }

    try {
      setSaving(true);
      await bookingsAPI.respond(
        booking.id,
        decision,
        decision === 'accept' ? meetingLinks[booking.id] : undefined,
      );
      toast.success(decision === 'accept' ? 'Class accepted and link shared' : 'Request rejected');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    try {
      setSaving(true);
      await uploadAPI.uploadDocument(file, type);
      toast.success('Document uploaded successfully');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
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
      setTeacher((current) => current ? { ...current, profilePicture: updatedUser.profilePicture || uploaded.url } : current);
      toast.success('Profile picture updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleProfileSave = async () => {
    if (!teacher) {
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await authAPI.updateProfile({ name: profileForm.name });
      const updatedTeacher = await teachersAPI.updateProfile({ bio: profileForm.bio });
      updateUser(updatedUser);
      setTeacher({
        ...updatedTeacher,
        profilePicture: updatedUser.profilePicture || updatedTeacher.profilePicture,
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

  if (loading || !teacher || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#f5a623]" />
      </div>
    );
  }

  const renderOverview = () => (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pending Requests" value={pendingRequests.length} hint="Demo and paid classes waiting for your decision" />
        <StatCard label="Upcoming Classes" value={upcomingClasses.length} hint="Accepted classes visible to students" />
        <StatCard label="Students" value={students.length} hint="Active students in your schedule" />
        <StatCard label="Earnings" value={`$${totalEarnings.toFixed(2)}`} hint="Accepted and completed paid classes" />
      </div>

      <Panel title="Incoming Requests" description="Accept requests with a class link or reject them right here.">
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
              No pending requests right now.
            </div>
          ) : pendingRequests.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950">{booking.subjectName}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}>
                        {booking.isDemo ? 'Demo request' : 'Paid request'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{booking.studentName} on {new Date(booking.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.isDemo ? 'Free demo class' : `$${booking.totalAmount.toFixed(2)} confirmed by admin once approved`}
                    </p>
                  </div>
                  {booking.receiptUrl && (
                    <a
                      href={booking.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#d99018]"
                    >
                      View receipt
                    </a>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <input
                    type="url"
                    value={meetingLinks[booking.id] || booking.meetingLink || ''}
                    onChange={(event) => setMeetingLinks((current) => ({
                      ...current,
                      [booking.id]: event.target.value,
                    }))}
                    placeholder="Paste Zoom, Meet, or Teams link"
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleRespond(booking, 'accept')}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
                    >
                      Accept & Create Class
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(booking, 'reject')}
                      className="rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Upcoming Classes" description="Accepted classes already visible to students.">
        <div className="space-y-4">
          {upcomingClasses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
              No upcoming classes yet.
            </div>
          ) : upcomingClasses.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{booking.subjectName}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{booking.studentName} on {new Date(booking.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                {booking.meetingLink ? (
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
                  >
                    <Video className="h-4 w-4" />
                    Open class link
                  </a>
                ) : (
                  <span className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">Link missing</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );

  const renderStudents = () => (
    <Panel title="Students" description="Students with accepted or completed classes.">
      <div className="space-y-4">
        {students.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            Your student list will populate once classes are accepted.
          </div>
        ) : students.map((studentItem) => (
          <article key={studentItem.id} className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-semibold text-slate-950">{studentItem.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{studentItem.email || 'No email available'}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {studentItem.bookings} class request{studentItem.bookings === 1 ? '' : 's'} tracked
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {studentItem.nextClass
                  ? `Next ${studentItem.subjectName || 'class'} on ${new Date(studentItem.nextClass).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
                  : 'No upcoming class'}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderDocuments = () => (
    <Panel title="Documents" description="Upload and review your verification documents.">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { key: 'degree', label: 'Degree', item: teacher.highestDegree },
          { key: 'identity', label: 'Identity Document', item: teacher.identityDocument },
          { key: 'certificate', label: 'Certificate', item: teacher.teachingCertificates?.[0] || null },
        ].map((entry) => (
          <article key={entry.key} className="rounded-3xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-950">{entry.label}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {entry.item?.fileName || `Upload your ${entry.label.toLowerCase()}`}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {entry.item?.fileUrl && (
                <a
                  href={entry.item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#f5a623]"
                >
                  View
                </a>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950">
                <Upload className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleDocumentUpload(file, entry.key);
                    }
                  }}
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );

  const renderProfile = () => (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <Panel title="Profile" description="Update the public details students see on your dashboard card.">
        <div className="grid gap-6 md:grid-cols-[220px,1fr]">
          <div className="rounded-3xl bg-slate-50 p-5 text-center">
            <img
              src={teacher.profilePicture || '/default-avatar.png'}
              alt={teacher.name}
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

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <input
                type="text"
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={teacher.email}
                readOnly
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Bio</span>
              <textarea
                rows={6}
                value={profileForm.bio}
                onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#f5a623] focus:bg-white"
              />
            </label>
            <button
              type="button"
              onClick={handleProfileSave}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#f5a623] hover:text-slate-950"
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              Save profile
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Security" description="Keep your teacher account protected.">
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
    <DashboardLayout
      title={NAV_ITEMS.find((item) => item.id === activeTab)?.label || 'Teacher Dashboard'}
      subtitle="Manage requests, publish availability, and keep class links ready for students."
      userName={teacher.name}
      roleLabel="Teacher"
      avatarUrl={teacher.profilePicture}
      navItems={[...NAV_ITEMS]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
    >
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'schedule' && (
        <Panel title="Availability Schedule" description="Students see these time windows when booking demo or paid classes.">
          <SchedulesPage
            teacherId={teacher.id}
            currentAvailability={teacher.availability}
            onSave={(availability) => setTeacher((current) => current ? { ...current, availability } : current)}
          />
        </Panel>
      )}
      {activeTab === 'students' && renderStudents()}
      {activeTab === 'documents' && renderDocuments()}
      {activeTab === 'profile' && renderProfile()}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
