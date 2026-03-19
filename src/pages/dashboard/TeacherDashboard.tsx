import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, FileText, 
  Settings, LogOut, Video, Clock, DollarSign,
  CheckCircle, XCircle, Edit, Upload, Bell,
  ChevronRight, Star, Loader2, Eye, EyeOff,
  Mail, Phone, User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { teachersAPI, subjectsAPI, uploadAPI, authAPI } from '@/services/api';

const TeacherDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Data states
  const [teacher, setTeacher] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [demoRequests, setDemoRequests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [bio, setBio] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profilePicture: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch teacher profile
      const teacherData = await teachersAPI.getProfile();
      const teacherInfo = teacherData.data || teacherData;
      setTeacher(teacherInfo);
      setBio(teacherInfo?.bio || '');
      setSettingsForm({
        name: teacherInfo?.name || '',
        email: teacherInfo?.email || '',
        phoneNumber: teacherInfo?.phoneNumber || '',
        profilePicture: teacherInfo?.profile_picture || teacherInfo?.profilePicture || ''
      });

      // Fetch subjects
      const subjectsData = await subjectsAPI.getAll();
      setSubjects(subjectsData.data || subjectsData.subjects || []);

      // Fetch bookings will be implemented when we have the endpoint
      // For now, use mock data or empty array
      setBookings([]);
      
      // Fetch demo requests
      try {
        const demoData = await bookingsAPI.getDemoRequests();
        setDemoRequests(demoData.data || demoData || []);
      } catch (_demoErr) {
        setDemoRequests([]);
      }
      
      // Stats
      setStats({
        totalStudents: 0,
        upcomingClasses: 0,
        completedClasses: 0,
        totalEarnings: 0
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectNames = (items: any[] = []): Array<{id: string, name: string}> => {
    return items
      .map((it) => {
        const id = typeof it === 'object' && it !== null ? (it.id ?? it) : it;
        const nameFromObj = typeof it === 'object' && it !== null ? it.name : undefined;
        const subject = subjects.find((s: any) => s.id === id);
        return { id: String(id), name: nameFromObj || subject?.name || (typeof id === 'string' ? id : String(id)) };
      })
      .filter((x: any) => x.name);
  };

  const handleUpdateProfile = async () => {
    try {
      await teachersAPI.updateProfile({ bio });
      alert('Profile updated successfully!');
      setIsEditingProfile(false);
      fetchData();
    } catch (err: any) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const handleUploadDocument = async (file: File, type: string) => {
    setUploadingFile(true);
    try {
      const result = await uploadAPI.uploadDocument(file, type);
      
      if (result.success && result.data) {
        alert('Document uploaded successfully!');
        fetchData();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Document upload error:', err);
      alert('Failed to upload document: ' + (err.message || 'Please try again'));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUpdateSchedule = async (availability: any[]) => {
    try {
      await teachersAPI.updateAvailability(availability);
      alert('Schedule updated successfully!');
      setIsEditingSchedule(false);
      fetchData();
    } catch (err: any) {
      console.error('Schedule update error:', err);
      alert('Failed to update schedule: ' + (err.message || 'Please try again'));
    }
  };

  const handleAcceptDemo = async (demoId: string, meetingLink: string) => {
    try {
      await bookingsAPI.acceptDemo(demoId, meetingLink);
      alert('Demo confirmed! Meeting link has been shared with the student.');
      fetchData();
    } catch (err: any) {
      alert('Failed to accept demo: ' + err.message);
    }
  };

  const handleDeclineDemo = async (demoId: string) => {
    try {
      await bookingsAPI.cancelDemo(demoId);
      alert('Demo request declined.');
      fetchData();
    } catch (err: any) {
      alert('Failed to decline demo: ' + err.message);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await authAPI.updateProfile({
        name: settingsForm.name,
        email: settingsForm.email,
        phoneNumber: settingsForm.phoneNumber
      });
      setTeacher({...teacher, ...settingsForm});
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
      const result = await uploadAPI.uploadProfilePicture(file);
      
      const newProfilePicture = result.data?.url || result.url;
      if (!newProfilePicture) {
        throw new Error('No URL returned from upload');
      }
      
      await authAPI.updateProfile({
        profilePicture: newProfilePicture
      });
      
      setTeacher({...teacher, profilePicture: newProfilePicture});
      setSettingsForm({...settingsForm, profilePicture: newProfilePicture});
      alert('Profile picture updated!');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Failed to upload profile picture: ' + (err.message || 'Please try again'));
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#f5a623] to-[#e09513] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 font-['Poppins']">
              Welcome back, {teacher?.name || 'Teacher'}!
            </h2>
            <p className="text-white/80">
              {teacher?.verification_status === 'approved' || teacher?.verificationStatus === 'approved'
                ? 'You are live and accepting new students.' 
                : 'Your profile is under review. You will be notified once approved.'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className={`px-4 py-2 rounded-full ${
              teacher?.is_live || teacher?.isLive
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {teacher?.is_live || teacher?.isLive ? '● Live' : '⏳ Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Students</p>
              <p className="stat-value">{stats?.totalStudents || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Upcoming Classes</p>
              <p className="stat-value text-[#f5a623]">{stats?.upcomingClasses || 0}</p>
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
              <p className="stat-value text-green-600">{stats?.completedClasses || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Earnings</p>
              <p className="stat-value text-purple-600">${stats?.totalEarnings || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#4a4a4a] font-['Poppins']">Upcoming Classes</h3>
          <button 
            onClick={() => setActiveTab('schedule')}
            className="text-[#f5a623] text-sm hover:underline flex items-center space-x-1"
            title="View All Schedule"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">View All Schedule</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {bookings
            .filter((b: any) => b.status === 'confirmed')
            .slice(0, 3)
            .map((booking: any) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-[#f5a623]" />
                </div>
                <div>
                  <p className="font-medium text-[#4a4a4a]">{booking.subjectName} Class</p>
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
                className="btn-primary text-sm py-2 px-4"
              >
                Join
              </a>
            </div>
          ))}
          {bookings.filter((b: any) => b.status === 'confirmed').length === 0 && (
            <p className="text-center text-gray-500 py-4">No upcoming classes</p>
          )}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#4a4a4a] font-['Poppins']">Profile Summary</h3>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="text-[#f5a623] text-sm hover:underline flex items-center space-x-1"
            title="Edit Profile"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
            <span className="sr-only">Edit Profile</span>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Bio</p>
            <p className="text-[#4a4a4a]">{teacher?.bio || 'No bio added yet.'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Subjects I Teach</p>
            <div className="flex flex-wrap gap-2">
              {getSubjectNames(teacher?.subjects).map((sub: any) => (
                <span key={sub.id} className="px-3 py-1 bg-[#f5a623]/10 text-[#f5a623] rounded-full text-sm">
                  {sub.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Rating</p>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600">(4.9)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">My Schedule</h3>
        <button 
          onClick={() => setIsEditingSchedule(true)}
          className="btn-primary flex items-center space-x-2"
          title="Edit Schedule"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Schedule</span>
          <span className="sr-only">Edit Schedule</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {days.map((day) => (
            <div key={day} className="p-4 text-center border-r last:border-r-0 bg-gray-50">
              <p className="font-semibold text-[#4a4a4a] capitalize">{day}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[300px]">
          {days.map((day) => {
            const slots = teacher?.availability?.filter((s: any) => s.day === day) || [];
            return (
              <div key={day} className="p-4 border-r last:border-r-0">
                {slots.length > 0 ? (
                  <div className="space-y-2">
                    {slots.map((slot: any) => (
                      <div 
                        key={slot.id} 
                        className={`p-2 rounded-lg text-center text-sm ${
                          slot.isAvailable 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <p>{slot.startTime} - {slot.endTime}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No slots
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Availability Legend */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded" />
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <span className="text-sm text-gray-600">Unavailable</span>
        </div>
      </div>
    </div>
  );

  const DemoRequestCard: React.FC<{
    demo: any;
    onAccept: (id: string, meetingLink: string) => void;
    onDecline: (id: string) => void;
  }> = ({ demo, onAccept, onDecline }) => {
    const [meetingLink, setMeetingLink] = useState('');
    const [showAcceptForm, setShowAcceptForm] = useState(false);

    return (
      <div className="bg-white rounded-lg p-4 border border-yellow-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-medium text-[#4a4a4a]">{demo.student_name || 'New Student'}</p>
            <p className="text-sm text-gray-600">{demo.student_email}</p>
            <p className="text-sm text-gray-500">{demo.subject_name}</p>
            <p className="text-sm font-medium text-[#f5a623]">
              {new Date(demo.scheduled_date).toLocaleDateString()} at{' '}
              {new Date(demo.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            Pending
          </span>
        </div>

        {showAcceptForm ? (
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Paste Zoom or Google Meet link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="form-input text-sm"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onAccept(demo.id, meetingLink);
                  setShowAcceptForm(false);
                }}
                disabled={!meetingLink.trim()}
                className="flex-1 btn-primary text-sm py-2"
              >
                Confirm & Send Link
              </button>
              <button
                onClick={() => setShowAcceptForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAcceptForm(true)}
              className="flex-1 btn-primary text-sm py-2"
            >
              Accept
            </button>
            <button
              onClick={() => onDecline(demo.id)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStudents = () => {
    const pendingDemos = demoRequests.filter((d: any) => d.status === 'demo_pending');
    const confirmedDemos = demoRequests.filter((d: any) => d.status === 'demo_confirmed');
    
    return (
    <div className="space-y-6">
      {/* Demo Requests Section */}
      {(pendingDemos.length > 0 || confirmedDemos.length > 0) && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins'] mb-4">Demo Class Requests</h3>
          
          {pendingDemos.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Pending Requests ({pendingDemos.length})
              </h4>
              <div className="space-y-3">
                {pendingDemos.map((demo: any) => (
                  <DemoRequestCard 
                    key={demo.id} 
                    demo={demo} 
                    onAccept={handleAcceptDemo}
                    onDecline={handleDeclineDemo}
                  />
                ))}
              </div>
            </div>
          )}
          
          {confirmedDemos.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Upcoming Demo Classes ({confirmedDemos.length})
              </h4>
              <div className="space-y-3">
                {confirmedDemos.map((demo: any) => (
                  <div key={demo.id} className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#4a4a4a]">{demo.student_name || 'Student'}</p>
                        <p className="text-sm text-gray-600">{demo.subject_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(demo.scheduled_date).toLocaleDateString()} at {new Date(demo.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {demo.meeting_link && (
                          <a href={demo.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            Join Meeting
                          </a>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">My Students</h3>
      
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Grade Level</th>
              <th>Classes Taken</th>
              <th>Next Class</th>
            </tr>
          </thead>
          <tbody>
            {bookings
              .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
              .map((booking: any) => (
              <tr key={booking.id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
                      <span className="text-[#f5a623] font-bold">S</span>
                    </div>
                    <span className="font-medium text-[#4a4a4a]">Student #{booking.studentId}</span>
                  </div>
                </td>
                <td>{booking.subjectName}</td>
                <td>{booking.gradeLevel}</td>
                <td>5</td>
                <td>{new Date(booking.scheduledDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No students yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  };

  const renderDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">My Documents</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#4a4a4a]">Highest Degree</h4>
            <span className={`badge ${teacher?.highestDegree ? 'badge-approved' : 'badge-pending'}`}>
              {teacher?.highestDegree ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="w-10 h-10 text-[#f5a623]" />
            <div>
              <p className="font-medium text-[#4a4a4a]">{teacher?.highestDegree?.fileName || 'No document uploaded'}</p>
              {teacher?.highestDegree && (
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(teacher.highestDegree.uploadedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="flex-1 btn-secondary text-sm py-2" title="View Document">View</button>
            <label className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1 cursor-pointer" title="Update Degree Document">
              <Upload className="w-4 h-4" />
              <span>{uploadingFile ? 'Uploading...' : 'Update'}</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0], 'degree')}
                disabled={uploadingFile}
                aria-label="Upload Degree Document"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#4a4a4a]">Identity Document</h4>
            <span className={`badge ${teacher?.identityDocument ? 'badge-approved' : 'badge-pending'}`}>
              {teacher?.identityDocument ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="w-10 h-10 text-[#f5a623]" />
            <div>
              <p className="font-medium text-[#4a4a4a]">{teacher?.identityDocument?.fileName || 'No document uploaded'}</p>
              {teacher?.identityDocument && (
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(teacher.identityDocument.uploadedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="flex-1 btn-secondary text-sm py-2" title="View Document">View</button>
            <label className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1 cursor-pointer" title="Update Identity Document">
              <Upload className="w-4 h-4" />
              <span>{uploadingFile ? 'Uploading...' : 'Update'}</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0], 'identity')}
                disabled={uploadingFile}
                aria-label="Upload Identity Document"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#4a4a4a]">Teaching Certificates</h4>
            <span className="badge badge-approved">Verified</span>
          </div>
          {teacher?.teachingCertificates?.map((cert: any, index: number) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-2">
              <FileText className="w-10 h-10 text-[#f5a623]" />
              <div>
                <p className="font-medium text-[#4a4a4a]">{cert.fileName}</p>
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(cert.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          <label className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-1 mt-4 cursor-pointer" title="Add Teaching Certificate">
            <Upload className="w-4 h-4" />
            <span>{uploadingFile ? 'Uploading...' : 'Add Certificate'}</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0], 'certificate')}
              disabled={uploadingFile}
              aria-label="Upload Teaching Certificate"
            />
          </label>
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
              src={teacher?.profile_picture || teacher?.profilePicture || settingsForm.profilePicture || '/default-avatar.png'} 
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

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Account Status</span>
            <span className={`badge ${teacher?.verification_status === 'approved' || teacher?.verificationStatus === 'approved' ? 'badge-approved' : 'badge-pending'}`}>
              {teacher?.verification_status === 'approved' || teacher?.verificationStatus === 'approved' ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Member Since</span>
            <span className="text-gray-900">{teacher?.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Account ID</span>
            <span className="text-gray-900 font-mono text-sm">{teacher?.id}</span>
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
              src={teacher?.profile_picture || teacher?.profilePicture || '/default-avatar.png'} 
              alt={teacher?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#f5a623]"
            />
            <div>
              <p className="font-semibold text-white">{teacher?.name}</p>
              <p className="text-xs text-white/60">Teacher</p>
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
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'documents' && renderDocuments()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}>
              <div>
                <label className="form-label">Bio</label>
                <textarea 
                  className="form-input min-h-[100px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about your teaching experience..."
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {isEditingSchedule && (
        <div className="modal-overlay" onClick={() => setIsEditingSchedule(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Edit Schedule</h3>
              <button onClick={() => setIsEditingSchedule(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {days.map((day) => (
                <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <span className="w-24 font-medium capitalize">{day}</span>
                  <input type="time" className="form-input w-32" defaultValue="09:00" />
                  <span>to</span>
                  <input type="time" className="form-input w-32" defaultValue="17:00" />
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-[#f5a623]" />
                    <span className="text-sm">Available</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex space-x-4">
              <button 
                onClick={() => setIsEditingSchedule(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateSchedule}
                className="flex-1 btn-primary"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
