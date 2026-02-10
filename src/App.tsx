import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import HowItWorks from '@/sections/HowItWorks';
import Testimonials from '@/sections/Testimonials';
import Subjects from '@/sections/Subjects';
import Footer from '@/sections/Footer';
import AuthModal from '@/components/AuthModal';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import TeacherDashboard from '@/pages/dashboard/TeacherDashboard';
import StudentDashboard from '@/pages/dashboard/StudentDashboard';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import './App.css';

// Landing Page Component
const LandingPage: React.FC<{ onLoginClick: () => void; onRegisterClick: () => void }> = ({ 
  onLoginClick, 
  onRegisterClick 
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <Hero onGetStarted={onRegisterClick} />
      <HowItWorks />
      <Testimonials />
      <Subjects />
      <Footer />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

// Main App Content
const AppContent: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage 
                onLoginClick={openLogin} 
                onRegisterClick={openRegister} 
              />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

// Main App
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
