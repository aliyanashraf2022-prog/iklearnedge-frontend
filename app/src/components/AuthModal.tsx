import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, GraduationCap, Lock, Mail, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

interface FormState {
  name: string;
  email: string;
  password: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('student');
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMode(initialMode);
    setRole('student');
    setForm({ name: '', email: '', password: '' });
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) {
    return null;
  }

  const updateField = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const success = mode === 'login'
      ? await login({ email: form.email, password: form.password })
      : await register({
          name: form.name.trim(),
          email: form.email,
          password: form.password,
          role,
        });

    if (!success) {
      setError(
        mode === 'login'
          ? 'Invalid email or password.'
          : 'Registration failed. Please try again.',
      );
      setIsLoading(false);
      return;
    }

    onClose();
    setIsLoading(false);
  };

  const renderInput = (
    label: string,
    icon: React.ReactNode,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label className="form-label">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input {...props} className="form-input pl-10" />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md w-full" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-['Poppins'] text-2xl font-bold text-[#4a4a4a]">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'login'
                ? 'Sign in to continue your learning journey.'
                : 'Start with a simple account and complete your profile later.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="form-label">Join As</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'student' as const, label: 'Student', icon: <BookOpen className="h-5 w-5" /> },
                    { value: 'teacher' as const, label: 'Teacher', icon: <GraduationCap className="h-5 w-5" /> },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        role === option.value
                          ? 'border-[#f5a623] bg-[#f5a623]/10 text-[#f5a623]'
                          : 'border-gray-200 text-gray-600 hover:border-[#f5a623]/40'
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {renderInput('Full Name', <User className="h-5 w-5" />, {
                type: 'text',
                value: form.name,
                onChange: updateField('name'),
                placeholder: 'Enter your full name',
                required: true,
              })}
            </>
          )}

          {renderInput('Email Address', <Mail className="h-5 w-5" />, {
            type: 'email',
            value: form.email,
            onChange: updateField('email'),
            placeholder: 'Enter your email',
            required: true,
          })}

          {renderInput('Password', <Lock className="h-5 w-5" />, {
            type: 'password',
            value: form.password,
            onChange: updateField('password'),
            placeholder: mode === 'login' ? 'Enter your password' : 'Create a password',
            required: true,
            minLength: 6,
          })}

          {mode === 'register' && role === 'teacher' && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              Teacher profiles can add subjects, qualifications, and documents after signup.
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex w-full items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t pt-6 text-center text-sm text-gray-500">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-[#f5a623] hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
