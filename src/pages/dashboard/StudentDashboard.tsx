import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Video, 
  Settings, LogOut, Star,
  Clock, DollarSign, Upload, CheckCircle, XCircle,
  Bell, BookOpen, User, Info, Loader2, Eye, EyeOff,
  Mail, Phone, User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { teachersAPI, studentsAPI, subjectsAPI, bookingsAPI, uploadAPI, authAPI } from '@/services/api';
import type { Teacher } from '@/types';

const StudentDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('find-teachers');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedBookingSubject, setSelectedBookingSubject] = useState<string>('');
  const [bookingDuration, setBookingDuration] = useState<number>(60);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Data states
  const [student, setStudent] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    gradeLevel: '',
    profilePicture: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const sidebarItems = [
    { id: 'find-teachers', label: 'Find Teachers', icon: Search },
    { id: 'my-classes', label: 'My Classes', icon: Calendar },
    { id: 'my-teachers', label: 'My Teachers', icon: User },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch student profile
      const studentData = await studentsAPI.getProfile();
      setStudent(studentData.student);
      setSettingsForm({
        name: studentData.student?.name || '',
        email: studentData.student?.email || '',
        phoneNumber: studentData.student?.phoneNumber || '',
        gradeLevel: studentData.student?.gradeLevel || '',
        profilePicture: studentData.student?.profilePicture || ''
      });

      // Fetch teachers
      const teachersData = await teachersAPI.getAll();
      setTeachers(teachersData.teachers || []);

      // Fetch subjects
      const subjectsData = await subjectsAPI.getAll();
      setSubjects(subjectsData.subjects || []);

      // Fetch student bookings
      const bookingsData = await bookingsAPI.getAll();
      setBookings(bookingsData.bookings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teachers based on search and subject
  const filteredTeachers = teachers
    .filter(t => t.isLive && t.verificationStatus === 'approved')
    .filter(t => {
      const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.subjects?.some((s: string) => {
                             const sub = subjects.find((subj: any) => subj.id === s);
                             return sub?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                           });
      const matchesSubject = !selectedSubject || t.subjects?.includes(selectedSubject);
      return matchesSearch && matchesSubject;
    });

  // Get subject names from IDs
  const getSubjectNames = (subjectIds: string[] = []) => {
    return subjectIds.map(id => {
      const subject = subjects.find((s: any) => s.id === id);
      return { id, name: subject?.name || id };
    });
  };

  // Get price for a subject based on student's grade
  const getPriceForSubjectAndGrade = (subjectId: string, gradeLevel: string) => {
    const subject = subjects.find((s: any) => s.id === subjectId);
    if (!subject || !subject.pricingTiers) return 20;
    const tier = subject.pricingTiers.find((t: any) => t.gradeLevel === gradeLevel);
    return tier?.pricePerHour || 20;
  };

  const getPriceDisplay = (subjectId: string) => {
    return getPriceForSubjectAndGrade(subjectId, student?.gradeLevel);
  };

  const handleUpdateSettings = async () => {
    try {
      await authAPI.updateProfile({
        name: settingsForm.name,
        email: settingsForm.email,
        phoneNumber: settingsForm.phoneNumber
      });
      
      if (settingsForm.gradeLevel) {
        await studentsAPI.updateProfile({
          gradeLevel: settingsForm.gradeLevel
        });
      }
      
      setStudent({...student, ...settingsForm});
      alert('Settings updated successfully!');
    } catch (err: any) {
      alert('Failed to update settings: ' + err.message);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      alert('Password changed successfully!');
    } catch (err: any) {
      alert('Failed to change password: ' + err.message);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadAPI.uploadProfilePicture?.(formData) || { url: URL.createObjectURL(file) };
      
      await authAPI.updateProfile({
        profilePicture: result.url || URL.createObjectURL(file)
      });
      
      setStudent({...student, profilePicture: result.url});
      setSettingsForm({...settingsForm, profilePicture: result.url});
      alert('Profile picture updated!');
    } catch (err: any) {
      alert('Failed to upload profile picture: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleBookClass = async () => {
    if (!selectedTeacher || !selectedBookingSubject) return;

    try {
      const pricePerHour = getPriceDisplay(selectedBookingSubject);
      const totalAmount = Math.round((pricePerHour * bookingDuration) / 60);

      await bookingsAPI.create({
        teacherId: selectedTeacher.id,
        subjectId: selectedBookingSubject,
        duration: bookingDuration,
        pricePerHour,
        totalAmount,
        gradeLevel: student?.gradeLevel
      });

      setBookingStep(2);
      fetchData();
    } catch (err: any) {
      alert('Failed to create booking: ' + err.message);
    }
  };

  const handleUploadPayment = async (file: File) => {
    if (!selectedBooking) return;
    
    setUploadingFile(true);
    try {
      await uploadAPI.uploadPaymentProof(file, selectedBooking.id);
      await bookingsAPI.updateStatus(selectedBooking.id, 'pending_payment');
      
      alert('Payment proof uploaded successfully!');
      setShowPaymentModal(false);
      setBookingStep(1);
      setSelectedBookingSubject('');
      fetchData();
    } catch (err: any) {
      alert('Failed to upload payment: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#f5a623]" />
      </div>
    );
  }

  const renderFindTeachers = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-input md:w-56"
          >
            <option value="">All Subjects</option>
            {subjects.filter((s: any) => s.isActive).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        
        {/* Student's Grade Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-blue-700">
            <span className="font-medium">Your Grade Level:</span> {student?.gradeLevel || 'Not set'} 
            <span className="text-blue-600 ml-2">(Prices shown are for your grade)</span>
          </p>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => {
          const teacherSubjects = getSubjectNames(teacher.subjects);
          const firstSubjectPrice = teacherSubjects.length > 0 
            ? getPriceDisplay(teacherSubjects[0].id) 
            : 20;
          
          return (
            <div 
              key={teacher.id} 
              className="teacher-card bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedTeacher(teacher)}
            >
              <div className="relative h-48 bg-gradient-to-br from-[#f5a623]/20 to-[#f5a623]/5">
                <img 
                  src={teacher.profilePicture} 
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                    ● Live
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#4a4a4a] font-['Poppins']">{teacher.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{teacher.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {teacherSubjects.slice(0, 3).map((sub: any) => (
                    <span key={sub.id} className="px-2 py-1 bg-[#f5a623]/10 text-[#f5a623] text-xs rounded-full">
                      {sub.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#f5a623] font-['Poppins']">${firstSubjectPrice}</span>
                    <span className="text-sm text-gray-500">/hour</span>
                    <p className="text-xs text-gray-400">for {student?.gradeLevel}</p>
                  </div>
                  <button className="btn-primary text-sm py-2 px-4">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No teachers found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );

  const renderMyClasses = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Bookings</p>
              <p className="stat-value">{bookings.length}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Upcoming Classes</p>
              <p className="stat-value text-[#f5a623]">{bookings.filter((b: any) => b.status === 'confirmed').length}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-[#f5a623]" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Completed Classes</p>
              <p className="stat-value text-green-600">{bookings.filter((b: any) => b.status === 'completed').length}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Upcoming Classes</h3>
        <div className="space-y-3">
          {bookings
            .filter((b: any) => b.status === 'confirmed')
            .map((booking: any) => {
              const teacher = teachers.find(t => t.id === booking.teacherId);
              return (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={teacher?.profilePicture} 
                      alt={teacher?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-[#4a4a4a]">{booking.subjectName} with {teacher?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-[#f5a623]">${booking.pricePerHour}/hour • {booking.gradeLevel}</p>
                    </div>
                  </div>
                  <a 
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join</span>
                  </a>
                </div>
              );
            })}
          {bookings.filter((b: any) => b.status === 'confirmed').length === 0 && (
            <p className="text-center text-gray-500 py-4">No upcoming classes</p>
          )}
        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Booking History</h3>
        <div className="data-table">
          <table className="w-full">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Grade</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking: any) => {
                const teacher = teachers.find(t => t.id === booking.teacherId);
                return (
                  <tr key={booking.id}>
                    <td>{booking.subjectName}</td>
                    <td>{teacher?.name}</td>
                    <td>{booking.gradeLevel}</td>
                    <td>{new Date(booking.scheduledDate).toLocaleDateString()}</td>
                    <td>${booking.totalAmount}</td>
                    <td>
                      <span className={`badge ${
                        booking.status === 'confirmed' ? 'badge-approved' :
                        booking.status === 'pending_payment' ? 'badge-pending' :
                        booking.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                        'badge-rejected'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">My Payments</h3>
      
      {/* Pending Payments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-semibold text-[#4a4a4a] mb-4">Pending Payments</h4>
        <div className="space-y-3">
          {bookings
            .filter((b: any) => b.status === 'pending_payment')
            .map((booking: any) => {
              const teacher = teachers.find(t => t.id === booking.teacherId);
              return (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-[#4a4a4a]">{booking.subjectName} with {teacher?.name}</p>
                    <p className="text-sm text-gray-500">{booking.gradeLevel}</p>
                    <p className="text-sm font-medium text-[#f5a623]">Amount: ${booking.totalAmount}</p>
                  </div>
                  <button 
                    onClick={() => { 
                      setSelectedBooking(booking); 
                      setSelectedBookingSubject(booking.subjectId);
                      setShowPaymentModal(true); 
                    }}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Upload Payment
                  </button>
                </div>
              );
            })}
          {bookings.filter((b: any) => b.status === 'pending_payment').length === 0 && (
            <p className="text-center text-gray-500 py-4">No pending payments</p>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-semibold text-[#4a4a4a] mb-4">Payment History</h4>
        <div className="data-table">
          <table className="w-full">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Subject</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
                .map((booking: any) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.subjectName}</td>
                  <td>${booking.totalAmount}</td>
                  <td>
                    <span className="badge badge-approved">Paid</span>
                  </td>
                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Picture */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Profile Picture</h3>
          <div className="flex flex-col items-center">
            <img 
              src={settingsForm.profilePicture || '/default-avatar.png'} 
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#f5a623] mb-4"
            />
            <label className="btn-primary py-2 px-6 flex items-center space-x-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploadingFile ? 'Uploading...' : 'Change Picture'}</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleProfilePictureUpload(e.target.files[0])}
                disabled={uploadingFile}
              />
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label flex items-center space-x-2">
                <UserIcon className="w-4 h-4" />
                <span>Full Name</span>
              </label>
              <input 
                type="text" 
                className="form-input"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="form-label flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </label>
              <input 
                type="email" 
                className="form-input"
                value={settingsForm.email}
                onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="form-label flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </label>
              <input 
                type="tel" 
                className="form-input"
                value={settingsForm.phoneNumber}
                onChange={(e) => setSettingsForm({...settingsForm, phoneNumber: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <button 
              onClick={handleUpdateSettings}
              className="btn-primary w-full mt-6"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Grade Level & Password */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Grade Level */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Education Details</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Current Grade/Level</label>
              <select 
                className="form-input"
                value={settingsForm.gradeLevel}
                onChange={(e) => setSettingsForm({...settingsForm, gradeLevel: e.target.value})}
              >
                <option value="">Select Grade Level</option>
                <option value="Grade 1-5">Primary (Grade 1-5)</option>
                <option value="Grade 6-8">Middle (Grade 6-8)</option>
                <option value="Grade 9-10">Secondary (Grade 9-10)</option>
                <option value="O-Level">O-Level</option>
                <option value="A-Level">A-Level</option>
                <option value="University/College">University/College</option>
              </select>
            </div>
            <button 
              onClick={handleUpdateSettings}
              className="btn-primary w-full"
            >
              Update Grade
            </button>
          </div>
        </div>

        {/* Password & Security */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#4a4a4a] font-['Poppins']">Password & Security</h3>
            <button 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="text-[#f5a623] text-sm hover:underline"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="form-label">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="form-input pr-10"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input pr-10"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input pr-10"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Password must be at least 6 characters long.
                </p>
              </div>

              <button 
                onClick={handleChangePassword}
                className="btn-primary w-full"
              >
                Update Password
              </button>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Your password is secure. Change it periodically for better security.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Account Status</span>
            <span className="badge badge-approved">Active</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Member Since</span>
            <span className="text-gray-900">{student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Account ID</span>
            <span className="text-gray-900 font-mono text-sm">{student?.id}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <img 
              src={student?.profilePicture || '/default-avatar.png'} 
              alt={student?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#f5a623]"
            />
            <div>
              <p className="font-semibold text-white">{student?.name}</p>
              <p className="text-xs text-white/60">Student</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`sidebar-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={logout}
            className="sidebar-nav-item w-full text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="text-2xl font-bold text-[#4a4a4a] font-['Poppins']">
            {sidebarItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          {activeTab === 'find-teachers' && renderFindTeachers()}
          {activeTab === 'my-classes' && renderMyClasses()}
          {activeTab === 'my-teachers' && (
            <div className="text-center py-12 text-gray-500">
              My Teachers list coming soon...
            </div>
          )}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="modal-overlay" onClick={() => setSelectedTeacher(null)}>
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48 bg-gradient-to-br from-[#f5a623]/20 to-[#f5a623]/5 rounded-t-2xl -mx-8 -mt-8 mb-6">
              <img 
                src={selectedTeacher.profilePicture} 
                alt={selectedTeacher.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-[#4a4a4a] font-['Poppins']">{selectedTeacher.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">4.9</span>
                  <span className="text-gray-500">(128 reviews)</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-[#4a4a4a] mb-2">About</h4>
              <p className="text-gray-600">{selectedTeacher.bio}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-[#4a4a4a] mb-2">Subjects & Pricing</h4>
              <p className="text-sm text-gray-500 mb-3">
                Prices shown are for your grade level: <span className="font-medium">{student?.gradeLevel}</span>
              </p>
              <div className="space-y-2">
                {getSubjectNames(selectedTeacher.subjects).map((sub: any) => {
                  const price = getPriceDisplay(sub.id);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-[#4a4a4a]">{sub.name}</span>
                      <span className="text-lg font-bold text-[#f5a623]">${price}/hour</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-[#4a4a4a] mb-2">Availability</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedTeacher.availability?.map((slot: any) => (
                  <div key={slot.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-[#f5a623]" />
                    <span className="text-sm capitalize">{slot.day}: {slot.startTime}-{slot.endTime}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedTeacher(null);
                setShowPaymentModal(true);
              }}
              className="btn-primary w-full py-3 text-lg"
            >
              Book a Class
            </button>
          </div>
        </div>
      )}

      {/* Payment Upload Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">
                {bookingStep === 1 ? 'Upload Payment Proof' : 'Booking Confirmed'}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {bookingStep === 1 ? (
              <div className="space-y-6">
                {/* Subject Selection */}
                <div>
                  <label className="form-label">Select Subject</label>
                  <select 
                    className="form-input"
                    value={selectedBookingSubject}
                    onChange={(e) => setSelectedBookingSubject(e.target.value)}
                  >
                    <option value="">Choose a subject</option>
                    {selectedTeacher && getSubjectNames(selectedTeacher.subjects).map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="form-label">Class Duration</label>
                  <select 
                    className="form-input"
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value))}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                {/* Price Calculation */}
                {selectedBookingSubject && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="font-medium">${getPriceForSubjectAndGrade(selectedBookingSubject, student?.gradeLevel)}/hr</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{bookingDuration} minutes</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-[#f5a623] text-xl">
                        ${Math.round((getPriceForSubjectAndGrade(selectedBookingSubject, student?.gradeLevel) * bookingDuration) / 60)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-[#4a4a4a] mb-3">Bank Transfer Details</h4>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm"><span className="font-medium">Bank:</span> Dubai Islamic Bank</p>
                    <p className="text-sm"><span className="font-medium">Account:</span> 1234567890</p>
                    <p className="text-sm"><span className="font-medium">IBAN:</span> AE123456789012345678901</p>
                    <p className="text-sm"><span className="font-medium">Reference:</span> IKL{Date.now()}</p>
                  </div>
                </div>

                <div>
                  <label className="form-label">Upload Payment Receipt</label>
                  <label className="file-upload-zone cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF up to 5MB</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleUploadPayment(e.target.files[0])}
                      disabled={uploadingFile || !selectedBookingSubject}
                    />
                  </label>
                </div>

                <button 
                  onClick={handleBookClass}
                  className="btn-primary w-full"
                  disabled={!selectedBookingSubject}
                >
                  Submit for Verification
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-[#4a4a4a] mb-2">Payment Submitted!</h4>
                <p className="text-gray-600 mb-6">
                  Your payment proof has been uploaded and is under review. You will be notified once confirmed.
                </p>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setBookingStep(1);
                    setSelectedBookingSubject('');
                  }}
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
