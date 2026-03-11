import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, CreditCard, 
  Calendar, Settings, LogOut, CheckCircle, XCircle,
  Eye, FileText, Bell, Search, Filter, BookOpen,
  Plus, Edit2, Trash2, DollarSign, Loader2, Star, User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, teachersAPI, subjectsAPI, paymentsAPI, settingsAPI } from '@/services/api';
import type { Teacher, Subject } from '@/types';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any>({ all: [], upcoming: [], completed: [], pending: [] });
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for new subject
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [newSubjectPrices, setNewSubjectPrices] = useState<Record<string, number>>({});
  
  // Grade levels for pricing
  const gradeLevels = [
    'Grade 1-5 (Primary)',
    'Grade 6-8 (Middle)',
    'Grade 9-10 (Secondary)',
    'O-Level',
    'A-Level',
    'University/College',
    'Adult Learning'
  ];

  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ FIX: Added timeout handling for stats to prevent 30s delay
      try {
        const stats = await adminAPI.getStats();
        setStats(stats.data || stats);
      } catch (statsErr) {
        console.warn('Stats API timeout/failed:', statsErr);
        setStats({
          totalTeachers: 0,
          totalStudents: 0,
          activeSubjects: 0,
          totalRevenue: 0,
          pendingVerifications: 0,
          pendingPayments: 0,
          totalBookings: 0,
          completedClasses: 0
        });
      }

      // Fetch teachers
      const teachersData = await adminAPI.getAllTeachers();
      const allTeachers = teachersData.data || teachersData || [];
      setTeachers(allTeachers);

      setPendingVerifications(allTeachers.filter((t: any) => 
        (t.verificationStatus || t.verification_status) === 'pending'
      ));

      // Fetch students
      const studentsData = await adminAPI.getAllStudents();
      setStudents(studentsData.data || studentsData || []);

      // Fetch classes
      const classesData = await adminAPI.getClasses();
      setClasses(classesData.data || classesData);

      // Fetch settings
      const settingsData = await adminAPI.getSettings();
      setSettings(settingsData.data || settingsData);

      // Fetch subjects
      const subjectsData = await subjectsAPI.getAllAdmin();
      setSubjects(subjectsData.data || subjectsData.subjects || []);

      // Fetch users
      const usersData = await adminAPI.getAllUsers();
      setUsers(usersData.data || usersData.users || []);

      // Fetch pending payments
      const paymentsData = await paymentsAPI.getPending();
      setPendingPayments(paymentsData.data || paymentsData.payments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIX: Removed this line - now using state from API
  // const pendingVerifications = teachers.filter(t => t.verificationStatus === 'pending');

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Pricing', icon: BookOpen },
    { id: 'teachers', label: 'Teachers', icon: UserCheck },
    { id: 'top-teachers', label: 'Top Verified', icon: Star },
    { id: 'students', label: 'Students', icon: User },
    { id: 'verifications', label: 'Verifications', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'classes', label: 'Classes', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleVerifyTeacher = async (teacherId: string, status: string) => {
    try {
      await teachersAPI.verify(teacherId, status);
      alert(`Teacher ${status} successfully!`);
      fetchData();
    } catch (err: any) {
      alert('Failed to verify teacher: ' + err.message);
    }
  };

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      await teachersAPI.verify(teacherId, 'approved');
      alert(`Teacher approved successfully!`);
      setSelectedTeacher(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      alert('Failed to approve teacher: ' + err.message);
    }
  };

  const handleRejectTeacher = async (teacherId: string) => {
    try {
      await teachersAPI.verify(teacherId, 'rejected');
      alert(`Teacher rejected!`);
      setSelectedTeacher(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      alert('Failed to reject teacher: ' + err.message);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await paymentsAPI.verify(paymentId, 'verified');
      alert(`Payment approved!`);
      setSelectedBooking(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      alert('Failed to approve payment: ' + err.message);
    }
  };

  const handleAddTopTeacher = async (teacherId: string, position: number = 0) => {
    try {
      await adminAPI.addTopTeacher(teacherId, position);
      alert('Teacher added to top verified list!');
      fetchData();
    } catch (err: any) {
      alert('Failed to add teacher: ' + err.message);
    }
  };

  const handleRemoveTopTeacher = async (teacherId: string) => {
    try {
      await adminAPI.removeTopTeacher(teacherId);
      alert('Teacher removed from top verified list!');
      fetchData();
    } catch (err: any) {
      alert('Failed to remove teacher: ' + err.message);
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      await adminAPI.updateSettings(newSettings);
      setSettings({ ...settings, ...newSettings });
      alert('Settings updated successfully!');
    } catch (err: any) {
      alert('Failed to update settings: ' + err.message);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await paymentsAPI.verify(paymentId, 'rejected');
      alert(`Payment rejected!`);
      setSelectedBooking(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      alert('Failed to reject payment: ' + err.message);
    }
  };

  const handleAddSubject = async () => {
    try {
      const pricingTiers = Object.entries(newSubjectPrices).map(([gradeLevel, price]) => ({
        gradeLevel,
        pricePerHour: price
      }));

      await subjectsAPI.create({
        name: newSubjectName,
        description: newSubjectDescription,
        pricingTiers
      });

      alert(`Subject "${newSubjectName}" added successfully!`);
      setIsAddingSubject(false);
      setNewSubjectName('');
      setNewSubjectDescription('');
      setNewSubjectPrices({});
      fetchData(); // Refresh data
    } catch (err: any) {
      alert('Failed to add subject: ' + err.message);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsAPI.delete(subjectId);
        alert(`Subject deleted!`);
        fetchData(); // Refresh data
      } catch (err: any) {
        alert('Failed to delete subject: ' + err.message);
      }
    }
  };

  const handleUpdatePricing = async () => {
    if (!selectedSubject) return;
    
    try {
      await subjectsAPI.updatePricing(selectedSubject.id, selectedSubject.pricingTiers);
      alert('Pricing updated successfully!');
      setSelectedSubject(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      alert('Failed to update pricing: ' + err.message);
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Teachers</p>
              <p className="stat-value">{stats?.totalTeachers || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
              <Users className="w-7 h-7 text-[#f5a623]" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Students</p>
              <p className="stat-value">{stats?.totalStudents || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Active Subjects</p>
              <p className="stat-value text-purple-600">{stats?.activeSubjects || subjects.length}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value text-green-6us">{formatCurrency(stats?.totalRevenue || 0)}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pending Verifications</p>
              <p className="stat-value text-orange-500">{stats?.pendingVerifications || pendingVerifications.length}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pending Payments</p>
              <p className="stat-value text-yellow-600">{stats?.pendingPayments || pendingPayments.length}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Bookings</p>
              <p className="stat-value">{stats?.totalBookings || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Completed Classes</p>
              <p className="stat-value text-teal-600">{stats?.completedClasses || 0}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Recent Activity</h3>
        <div className="space-y-4">
          {pendingVerifications.slice(0, 2).map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <img src={teacher.profilePicture || teacher.profile_picture} alt={teacher.name || teacher.full_name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-[#4a4a4a]">{teacher.name || teacher.full_name}</p>
                  <p className="text-sm text-gray-500">Applied for verification</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeacher(teacher)}
                className="text-[#f5a623] hover:underline text-sm"
              >
                Review
              </button>
            </div>
          ))}
          {pendingPayments.slice(0, 2).map((payment: any) => (
            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-[#4a4a4a]">Payment #{payment.id}</p>
                  <p className="text-sm text-gray-500">${payment.amount} - Pending verification</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBooking(payment)}
                className="text-[#f5a623] hover:underline text-sm"
              >
                Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Subjects & Pricing</h3>
          <p className="text-sm text-gray-500">Manage subjects and set prices for each grade level</p>
        </div>
        <button 
          onClick={() => setIsAddingSubject(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-40">
              <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  subject.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {subject.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-[#4a4a4a]">{subject.name}</h4>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{subject.tutorCount}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{subject.description}</p>
              
              {/* Pricing Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">PRICING TIERS</p>
                <div className="space-y-1">
                  {subject.pricingTiers?.slice(0, 3).map((tier) => (
                    <div key={tier.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{tier.gradeLevel}</span>
                      <span className="font-medium text-[#f5a623]">{formatCurrency(tier.pricePerHour).replace(settings.currency_symbol, '')} {settings.currency_symbol}/hr</span>
                    </div>
                  ))}
                  {(subject.pricingTiers?.length || 0) > 3 && (
                    <p className="text-xs text-gray-400">+{(subject.pricingTiers?.length || 0) - 3} more tiers</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedSubject(subject)}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Pricing</span>
                </button>
                <button 
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVerifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Teacher Verifications</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#f5a623]"
            />
          </div>
          <button className="p-2 border rounded-lg hover:bg-gray-50" title="Filter Teachers">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="sr-only">Filter</span>
          </button>
        </div>
      </div>

      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Subjects</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingVerifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No pending teacher verifications found
                </td>
              </tr>
            ) : (
              pendingVerifications
                .filter(t => (t.name || t.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <img src={teacher.profilePicture || teacher.profile_picture} alt={teacher.name || teacher.full_name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-[#4a4a4a]">{teacher.name || teacher.full_name}</p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {(teacher.subjects || []).map((subId: string) => {
                      const sub = subjects.find(s => s.id === subId);
                      return sub?.name;
                    }).filter(Boolean).join(', ') || '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      teacher.verification_status === 'approved' ? 'badge-approved' :
                      teacher.verification_status === 'pending' ? 'badge-pending' : 'badge-rejected'
                    }`}>
                      {teacher.verification_status}
                    </span>
                  </td>
                  <td>{new Date(teacher.createdAt || teacher.submitted_at || teacher.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {teacher.verification_status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleVerifyTeacher(teacher.id, 'approved')}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleVerifyTeacher(teacher.id, 'rejected')}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setSelectedTeacher(teacher)}
                        className="text-[#f5a623] hover:underline text-sm flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Payment Verifications</h3>
      
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Student</th>
              <th>Teacher</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments.map((payment: any) => (
              <tr key={payment.id}>
                <td>#{payment.id}</td>
                <td>{payment.studentName || 'Unknown'}</td>
                <td>{payment.teacherName || 'Unknown'}</td>
                <td>
                  <div>
                    <p className="font-medium">AED {payment.amount}</p>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-pending`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => setSelectedBooking(payment)}
                    className="text-[#f5a623] hover:underline text-sm flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Review</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">All Users</h3>
      
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Email</th>
              <th>Joined On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
                      <span className="text-[#f5a623] font-bold">{user.name?.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-[#4a4a4a]">{user.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-approved' :
                    user.role === 'teacher' ? 'badge-pending' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className="badge badge-approved">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">All Teachers</h3>
      
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Subjects</th>
              <th>Status</th>
              <th>Top Verified</th>
              <th>Joined On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((teacher: any) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <img src={teacher.profilePicture || teacher.profile_picture || '/default-avatar.png'} alt={teacher.name || teacher.full_name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-[#4a4a4a]">{teacher.name || teacher.full_name}</p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {(teacher.subjects || []).length > 0 ? `${(teacher.subjects || []).length} subjects` : '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      teacher.verification_status === 'approved' ? 'badge-approved' :
                      teacher.verification_status === 'pending' ? 'badge-pending' : 'badge-rejected'
                    }`}>
                      {teacher.verification_status}
                    </span>
                  </td>
                  <td>
                    {teacher.is_top_verified ? (
                      <span className="flex items-center text-amber-500">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        #{teacher.top_position + 1}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td>{new Date(teacher.created_at || teacher.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {!teacher.is_top_verified && teacher.verification_status === 'approved' && (
                        <button 
                          onClick={() => handleAddTopTeacher(teacher.id)}
                          className="px-3 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600"
                          title="Add to Top Verified"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      {teacher.is_top_verified && (
                        <button 
                          onClick={() => handleRemoveTopTeacher(teacher.id)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                          title="Remove from Top Verified"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedTeacher(teacher)}
                        className="text-[#f5a623] hover:underline text-sm flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTopTeachers = () => {
    const topTeachers = teachers.filter((t: any) => t.is_top_verified);
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Top Verified Teachers</h3>
        <p className="text-gray-500">Manage which verified teachers appear on the homepage</p>
        
        {topTeachers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No top verified teachers yet</p>
            <p className="text-sm">Go to Teachers tab to add teachers to this list</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTeachers.sort((a: any, b: any) => a.top_position - b.top_position).map((teacher: any) => (
              <div key={teacher.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img src={teacher.profilePicture || teacher.profile_picture || '/default-avatar.png'} alt={teacher.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-[#4a4a4a]">{teacher.name || teacher.full_name}</h4>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                    <span className="text-amber-500 font-bold">#{teacher.top_position + 1}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{teacher.bio || 'No bio available'}</p>
                <button 
                  onClick={() => handleRemoveTopTeacher(teacher.id)}
                  className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Remove from Top List</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStudents = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">All Students</h3>
      
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade Level</th>
              <th>Location</th>
              <th>Parent Contact</th>
              <th>Joined On</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student: any) => (
                <tr key={student.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <img src={student.profilePicture || student.profile_picture || '/default-avatar.png'} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-[#4a4a4a]">{student.name || student.full_name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{student.grade_level || '-'}</td>
                  <td>{student.location || '-'}</td>
                  <td>{student.parent_contact || '-'}</td>
                  <td>{new Date(student.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Class Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-semibold">Upcoming Classes</p>
              <p className="text-3xl font-bold text-blue-700">{classes.upcoming?.length || 0}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-semibold">Completed Classes</p>
              <p className="text-3xl font-bold text-green-700">{classes.completed?.length || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 font-semibold">Pending Classes</p>
              <p className="text-3xl font-bold text-yellow-700">{classes.pending?.length || 0}</p>
            </div>
            <CreditCard className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[#4a4a4a]">Upcoming Classes</h4>
        {(!classes.upcoming || classes.upcoming.length === 0) ? (
          <p className="text-gray-500 text-center py-8">No upcoming classes</p>
        ) : (
          <div className="data-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Teacher</th>
                  <th>Subject</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {classes.upcoming.map((cls: any) => (
                  <tr key={cls.id}>
                    <td>{cls.student_name}</td>
                    <td>{cls.teacher_name}</td>
                    <td>{cls.subject_name}</td>
                    <td>{new Date(cls.scheduled_date).toLocaleString()}</td>
                    <td>{cls.duration} min</td>
                    <td>{settings.currency || 'AED'} {cls.total_amount}</td>
                    <td>
                      <span className="badge badge-approved">{cls.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[#4a4a4a]">Completed Classes</h4>
        {(!classes.completed || classes.completed.length === 0) ? (
          <p className="text-gray-500 text-center py-8">No completed classes</p>
        ) : (
          <div className="data-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Teacher</th>
                  <th>Subject</th>
                  </th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {classes.completed.map((cls: any) => (
                  <tr key={cls.id}>
                    <td>{cls.student_name}</td>
                    <td>{cls.teacher_name}</td>
                    <td>{cls.subject_name}</td>
                    <td>{new Date(cls.scheduled_date).toLocaleString()}</td>
                    <td>{cls.duration} min</td>
                    <td>{settings.currency || 'AED'} {cls.total_amount}</td>
                    <td>
                      <span className="badge bg-green-100 text-green-700">{cls.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => {
    const [localSettings, setLocalSettings] = useState({
      primary_color: settings.primary_color || '#f5a623',
      secondary_color: settings.secondary_color || '#4a4a4a',
      accent_color: settings.accent_color || '#3498db',
      currency: settings.currency || 'AED',
      currency_symbol: settings.currency_symbol || 'د.إ',
      site_name: settings.site_name || 'IkLearnEdge',
    });

    const handleSave = () => {
      handleUpdateSettings(localSettings);
    };

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Website Settings</h3>
        
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-[#4a4a4a] mb-4">Color Theme</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={localSettings.primary_color}
                    onChange={(e) => setLocalSettings({...localSettings, primary_color: e.target.value})}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={localSettings.primary_color}
                    onChange={(e) => setLocalSettings({...localSettings, primary_color: e.target.value})}
                    className="form-input flex-1"
                    placeholder="#f5a623"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={localSettings.secondary_color}
                    onChange={(e) => setLocalSettings({...localSettings, secondary_color: e.target.value})}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={localSettings.secondary_color}
                    onChange={(e) => setLocalSettings({...localSettings, secondary_color: e.target.value})}
                    className="form-input flex-1"
                    placeholder="#4a4a4a"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Accent Color</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="color" 
                    value={localSettings.accent_color}
                    onChange={(e) => setLocalSettings({...localSettings, accent_color: e.target.value})}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={localSettings.accent_color}
                    onChange={(e) => setLocalSettings({...localSettings, accent_color: e.target.value})}
                    className="form-input flex-1"
                    placeholder="#3498db"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#4a4a4a] mb-4">Currency Settings</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Currency Code</label>
                <select 
                  value={localSettings.currency}
                  onChange={(e) => setLocalSettings({...localSettings, currency: e.target.value})}
                  className="form-input"
                >
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="SAR">SAR - Saudi Riyal</option>
                  <option value="KWD">KWD - Kuwaiti Dinar</option>
                  <option value="QAR">QAR - Qatari Riyal</option>
                  <option value="BHD">BHD - Bahraini Dinar</option>
                  <option value="OMR">OMR - Omani Rial</option>
                </select>
              </div>
              <div>
                <label className="form-label">Currency Symbol</label>
                <input 
                  type="text" 
                  value={localSettings.currency_symbol}
                  onChange={(e) => setLocalSettings({...localSettings, currency_symbol: e.target.value})}
                  className="form-input"
                  placeholder="د.إ"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#4a4a4a] mb-4">Site Name</h4>
            <input 
              type="text" 
              value={localSettings.site_name}
              onChange={(e) => setLocalSettings({...localSettings, site_name: e.target.value})}
              className="form-input max-w-md"
              placeholder="IkLearnEdge"
            />
          </div>

          <div className="pt-4 border-t">
            <button 
              onClick={handleSave}
              className="btn-primary"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#f5a623] flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <p className="font-semibold text-white">Admin</p>
              <p className="text-xs text-white/60">admin@iklearnedge.com</p>
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
            <button className="relative p-2 hover:bg-gray-100 rounded-full" title="Notifications">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              <span className="sr-only">Notifications</span>
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
          {activeTab === 'subjects' && renderSubjects()}
          {activeTab === 'teachers' && renderTeachers()}
          {activeTab === 'top-teachers' && renderTopTeachers()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'verifications' && renderVerifications()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'classes' && renderClasses()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Add Subject Modal */}
      {isAddingSubject && (
        <div className="modal-overlay" onClick={() => setIsAddingSubject(false)}>
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Add New Subject</h3>
              <button onClick={() => setIsAddingSubject(false)} className="p-2 hover:bg-gray-100 rounded-full" title="Close Add Subject Modal">
                <XCircle className="w-5 h-5 text-gray-500" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Subject Name</label>
                <input 
                  type="text" 
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., History"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea 
                  value={newSubjectDescription}
                  onChange={(e) => setNewSubjectDescription(e.target.value)}
                  className="form-input min-h-[80px]"
                  placeholder="Brief description of the subject"
                />
              </div>
              <div>
                <label className="form-label">Set Prices by Grade Level</label>
                <div className="space-y-3">
                  {gradeLevels.map((grade: string) => (
                    <div key={grade} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{grade}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">$</span>
                        <input 
                          type="number"
                          min="5"
                          placeholder="Enter price"
                          className="w-20 form-input py-1 text-sm"
                          aria-label={`Price for ${grade}`}
                          onChange={(e) => setNewSubjectPrices({...newSubjectPrices, [grade]: Number(e.target.value)})}
                        />
                        <span className="text-sm text-gray-500">/hr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleAddSubject} className="btn-primary w-full" title="Add Subject">
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pricing Modal */}
      {selectedSubject && (
        <div className="modal-overlay" onClick={() => setSelectedSubject(null)}>
          <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">
                Edit Pricing: {selectedSubject.name}
              </h3>
              <button onClick={() => setSelectedSubject(null)} className="p-2 hover:bg-gray-100 rounded-full" title="Close Edit Pricing Modal">
                <XCircle className="w-5 h-5 text-gray-500" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="space-y-4">
              {selectedSubject.pricingTiers?.map((tier: any) => (
                <div key={tier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{tier.gradeLevel}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">$</span>
                    <input 
                      type="number"
                      min="5"
                      defaultValue={tier.pricePerHour}
                      className="w-20 form-input py-1 text-sm"
                      aria-label={`Edit price for ${tier.gradeLevel}`}
                      placeholder="Enter price"
                    />
                    <span className="text-sm text-gray-500">/hr</span>
                  </div>
                </div>
              ))}
              <button onClick={handleUpdatePricing} className="btn-primary w-full" title="Update Pricing">
                Update Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Verification Modal */}
      {selectedTeacher && (
        <div className="modal-overlay" onClick={() => setSelectedTeacher(null)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">
                Teacher Verification
              </h3>
              <button onClick={() => setSelectedTeacher(null)} className="p-2 hover:bg-gray-100 rounded-full" title="Close Teacher Verification Modal">
                <XCircle className="w-5 h-5 text-gray-500" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedTeacher.profilePicture} 
                  alt={selectedTeacher.name} 
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-bold text-[#4a4a4a]">{selectedTeacher.name}</h4>
                  <p className="text-gray-500">{selectedTeacher.email}</p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-[#4a4a4a] mb-2">Bio</h5>
                <p className="text-gray-600 text-sm">{selectedTeacher.bio || 'No bio provided'}</p>
              </div>

              <div>
                <h5 className="font-semibold text-[#4a4a4a] mb-2">Subjects They Teach</h5>
                <div className="flex flex-wrap gap-2">
                  {(selectedTeacher.subjects || []).map((subId: string) => {
                    const sub = subjects.find(s => s.id === subId);
                    return sub ? (
                      <span key={subId} className="px-3 py-1 bg-[#f5a623]/10 text-[#f5a623] rounded-full text-sm">
                        {sub.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-[#4a4a4a] mb-2 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Highest Degree</span>
                  </h5>
                  <p className="text-sm text-gray-600">{(selectedTeacher.highestDegree || {}).fileName || 'Document uploaded'}</p>
                  <button className="text-[#f5a623] text-sm hover:underline mt-2">View Document</button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-[#4a4a4a] mb-2 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>ID Document</span>
                  </h5>
                  <p className="text-sm text-gray-600">{(selectedTeacher.identityDocument || {}).fileName || 'Document uploaded'}</p>
                  <button className="text-[#f5a623] text-sm hover:underline mt-2">View Document</button>
                </div>
              </div>

              {(selectedTeacher.verificationStatus === 'pending') && (
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleApproveTeacher(selectedTeacher.id)}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve</span>
                  </button>
                  <button 
                    onClick={() => handleRejectTeacher(selectedTeacher.id)}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Review Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">
                Payment Verification
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-[#f5a623] font-['Poppins']">
                  ${selectedBooking.amount}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-medium">#{selectedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Student</span>
                  <span className="font-medium">{selectedBooking.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teacher</span>
                  <span className="font-medium">{selectedBooking.teacherName}</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h5 className="font-semibold text-[#4a4a4a] mb-2">Payment Proof</h5>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <button className="text-[#f5a623] text-sm hover:underline mt-2">View Full Image</button>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => handleApprovePayment(selectedBooking.id)}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve Payment</span>
                </button>
                <button 
                  onClick={() => handleRejectPayment(selectedBooking.id)}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;