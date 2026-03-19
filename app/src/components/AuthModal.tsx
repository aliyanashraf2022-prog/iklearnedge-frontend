import React, { useState } from 'react';
import { X, User, Mail, Lock, Upload, GraduationCap, BookOpen, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('student');
  const { login, register } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [bio, setBio] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [cnicFile, setCnicFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const success = await login({ email, password });
    if (success) {
      onClose();
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await register({
      name,
      email,
      password,
      role
    });

    if (success) {
      onClose();
    } else {
      setError('Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  const availableSubjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Science', 'IELTS', 'SAT'];

  const toggleSubject = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="form-label">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input pl-10"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input pl-10"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Login</span>
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setMode('register')}
          className="text-[#f5a623] font-medium hover:underline"
        >
          Register
        </button>
      </div>
    </form>
  );

  const renderRoleSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-6">I want to join as a...</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => { setRole('student'); setStep(2); }}
          className={`p-6 rounded-xl border-2 transition-all ${
            role === 'student' 
              ? 'border-[#f5a623] bg-[#f5a623]/10' 
              : 'border-gray-200 hover:border-[#f5a623]/50'
          }`}
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-[#f5a623]" />
          <h4 className="font-semibold text-[#4a4a4a]">Student</h4>
          <p className="text-sm text-gray-500 mt-1">I want to learn</p>
        </button>

        <button
          type="button"
          onClick={() => { setRole('teacher'); setStep(2); }}
          className={`p-6 rounded-xl border-2 transition-all ${
            role === 'teacher' 
              ? 'border-[#f5a623] bg-[#f5a623]/10' 
              : 'border-gray-200 hover:border-[#f5a623]/50'
          }`}
        >
          <GraduationCap className="w-10 h-10 mx-auto mb-3 text-[#f5a623]" />
          <h4 className="font-semibold text-[#4a4a4a]">Teacher</h4>
          <p className="text-sm text-gray-500 mt-1">I want to teach</p>
        </button>
      </div>
    </div>
  );

  const renderStudentForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="form-label">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input pl-10"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input pl-10"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input pl-10"
            placeholder="Create a password"
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Grade Level</label>
        <select
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          className="form-input"
          required
        >
          <option value="">Select your grade</option>
          <option value="Grade 1-5">Grade 1-5 (Primary)</option>
          <option value="Grade 6-8">Grade 6-8 (Middle)</option>
          <option value="O-Level">O-Level</option>
          <option value="A-Level">A-Level</option>
        </select>
      </div>

      <div>
        <label className="form-label">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && setProfilePicture(e.target.files[0])}
          className="form-input"
        />
        {profilePicture && <p className="text-xs text-green-600 mt-1">Selected: {profilePicture.name}</p>}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Complete Registration</span>
            <CheckCircle className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );

  const renderTeacherForm = () => (
    <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <label className="form-label">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input pl-10"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input pl-10"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input pl-10"
            placeholder="Create a password"
            required
          />
        </div>
      </div>

      <div>
        <label className="form-label">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="form-input min-h-[80px]"
          placeholder="Tell us about your teaching experience"
          required
        />
      </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input min-h-[60px]"
            placeholder="Short description about yourself (max 200 chars)"
            maxLength={200}
            required
          />
        </div>

      <div>
        <label className="form-label">Subjects You Teach</label>
        <div className="flex flex-wrap gap-2">
          {availableSubjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => toggleSubject(subject)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                subjects.includes(subject)
                  ? 'bg-[#f5a623] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Highest Degree (PDF/Image)</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => e.target.files?.[0] && setDegreeFile(e.target.files[0])}
          className="form-input"
        />
        {degreeFile && <p className="text-xs text-green-600 mt-1">Selected: {degreeFile.name}</p>}
      </div>

      <div>
        <label className="form-label">Teaching Certificates</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => e.target.files?.[0] && setCertificateFile(e.target.files[0])}
          className="form-input"
        />
        {certificateFile && <p className="text-xs text-green-600 mt-1">Selected: {certificateFile.name}</p>}
      </div>

      <div>
        <label className="form-label">CNIC/Passport Copy</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => e.target.files?.[0] && setCnicFile(e.target.files[0])}
          className="form-input"
        />
        {cnicFile && <p className="text-xs text-green-600 mt-1">Selected: {cnicFile.name}</p>}
      </div>

      <div>
        <label className="form-label">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && setProfilePicture(e.target.files[0])}
          className="form-input"
        />
        {profilePicture && <p className="text-xs text-green-600 mt-1">Selected: {profilePicture.name}</p>}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Submit for Verification</span>
            <CheckCircle className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-md w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#4a4a4a] font-['Poppins']">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' 
                ? 'Login to continue learning with your favorite tutors' 
                : 'Join our community of learners and educators'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {mode === 'login' ? (
          renderLogin()
        ) : (
          <div>
            {/* Step indicator */}
            {mode === 'register' && (
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setStep(1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= 1 ? 'bg-[#f5a623] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  1
                </button>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#f5a623]' : 'bg-gray-200'}`} />
                <button
                  onClick={() => step >= 2 && setStep(2)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= 2 ? 'bg-[#f5a623] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </button>
              </div>
            )}

            {/* Back button */}
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex items-center text-sm text-gray-500 hover:text-[#f5a623] mb-4 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            )}

            {/* Form content */}
            {step === 1 ? renderRoleSelection() : (
              role === 'student' ? renderStudentForm() : renderTeacherForm()
            )}
          </div>
        )}

        {/* Footer */}
        {mode === 'login' && (
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Are you a tutor?{' '}
              <button
                onClick={() => { setMode('register'); setStep(1); }}
                className="text-[#f5a623] font-medium hover:underline"
              >
                Apply to teach
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
