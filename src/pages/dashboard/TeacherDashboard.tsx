import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, FileText, 
  Settings, LogOut, Video, Clock, DollarSign,
  CheckCircle, XCircle, Edit, Upload, Bell,
  ChevronRight, Star, Info, Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { teachersAPI, subjectsAPI, uploadAPI } from '@/services/api';

const TeacherDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  
  // Data states
  const [teacher, setTeacher] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [bio, setBio] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

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
      setTeacher(teacherData.teacher);
      setBio(teacherData.teacher?.bio || '');

      // Fetch subjects
      const subjectsData = await subjectsAPI.getAll();
      setSubjects(subjectsData.subjects || []);

      // Fetch bookings will be implemented when we have the endpoint
      // For now, use mock data or empty array
      setBookings([]);
      
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

  // Get subject names from IDs
  const getSubjectNames = (subjectIds: string[] = []) => {
    return subjectIds.map(id => {
      const subject = subjects.find(s => s.id === id);
      return subject?.name || id;
    });
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
      await uploadAPI.uploadDocument(file, type);
      alert('Document uploaded successfully!');
      fetchData();
    } catch (err: any) {
      alert('Failed to upload document: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUpdateSchedule = async () => {
    // Schedule update logic will be implemented
    alert('Schedule updated!');
    setIsEditingSchedule(false);
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
              {teacher?.verificationStatus === 'approved' 
                ? 'You are live and accepting new students.' 
                : 'Your profile is under review. You will be notified once approved.'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className={`px-4 py-2 rounded-full ${
              teacher?.isLive 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {teacher?.isLive ? '● Live' : '⏳ Pending'}
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
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
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
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
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
              {getSubjectNames(teacher?.subjects).map((subjectName) => (
                <span key={subjectName} className="px-3 py-1 bg-[#f5a623]/10 text-[#f5a623] rounded-full text-sm">
                  {subjectName}
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
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700">Pricing Information</p>
                <p className="text-xs text-blue-600 mt-1">
                  Class prices are set by the admin based on subject and grade level. 
                  You'll see the rate for each booking in your class details.
                </p>
              </div>
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
        >
          <Edit className="w-4 h-4" />
          <span>Edit Schedule</span>
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

  const renderStudents = () => (
    <div className="space-y-6">
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
            <button className="flex-1 btn-secondary text-sm py-2">View</button>
            <label className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploadingFile ? 'Uploading...' : 'Update'}</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0], 'degree')}
                disabled={uploadingFile}
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
            <button className="flex-1 btn-secondary text-sm py-2">View</button>
            <label className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploadingFile ? 'Uploading...' : 'Update'}</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0], 'identity')}
                disabled={uploadingFile}
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
          <label className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-1 mt-4 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{uploadingFile ? 'Uploading...' : 'Add Certificate'}</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files?.[0] && handleUploadDocument(e.target.files[0], 'certificate')}
              disabled={uploadingFile}
            />
          </label>
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
              src={teacher?.profilePicture || '/default-avatar.png'} 
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
          {activeTab === 'settings' && (
            <div className="text-center py-12 text-gray-500">
              Settings coming soon...
            </div>
          )}
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Note about Pricing</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Class prices are set by the admin based on subject and grade level. 
                      You cannot change your hourly rate.
                    </p>
                  </div>
                </div>
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
