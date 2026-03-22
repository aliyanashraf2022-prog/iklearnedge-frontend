import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import type { UserRole } from '@/types';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import StudentDashboard from '@/pages/dashboard/StudentDashboard';
import TeacherDashboard from '@/pages/dashboard/TeacherDashboard';
import DirectorIntro from '@/sections/DirectorIntro';
import Footer from '@/sections/Footer';
import Hero from '@/sections/Hero';
import HowItWorks from '@/sections/HowItWorks';
import Navigation from '@/sections/Navigation';
import Subjects from '@/sections/Subjects';
import Testimonials from '@/sections/Testimonials';
import './App.css';

const PricingPage = lazy(() => import('./pages/PricingPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const OurTeamPage = lazy(() => import('./pages/OurTeamPage'));

const LandingPage: React.FC<{ onLoginClick: () => void; onRegisterClick: () => void }> = ({
  onLoginClick,
  onRegisterClick,
}) => (
  <div className="min-h-screen bg-white">
    <Navigation onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
    <Hero onGetStarted={onRegisterClick} />
    <HowItWorks />
    <Testimonials />
    <Subjects onLoginClick={onLoginClick} />
    <DirectorIntro
      directorName="Rubina Altaf"
      directorTitle="Director"
      directorIntro="25+ Years of Experiance in the Field of education"
      directorImage="/director-image.png"
    />
    <Footer />
  </div>
);

const LazyPage: React.FC<{ children: React.ReactNode; message?: string }> = ({
  children,
  message = 'Loading...',
}) => (
  <Suspense fallback={<div className="py-8 text-center">{message}</div>}>
    {children}
  </Suspense>
);

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
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

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const dashboards: Record<UserRole, React.ReactElement> = {
    admin: <AdminDashboard />,
    teacher: <TeacherDashboard />,
    student: <StudentDashboard />,
  };

  return dashboards[user.role] ?? <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isLoading } = useAuth();

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#4a4a4a]">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage onLoginClick={openLogin} onRegisterClick={openRegister} />
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
        <Route path="/pricing" element={<LazyPage message="Loading pricing..."><PricingPage /></LazyPage>} />
        <Route path="/our-team" element={<LazyPage><OurTeamPage /></LazyPage>} />
        <Route path="/about-us" element={<LazyPage><AboutUsPage /></LazyPage>} />
        <Route path="/contact-us" element={<LazyPage><ContactUsPage /></LazyPage>} />
        <Route path="/faqs" element={<LazyPage><FAQsPage /></LazyPage>} />
        <Route path="/terms" element={<LazyPage><TermsPage /></LazyPage>} />
        <Route path="/privacy" element={<LazyPage><PrivacyPage /></LazyPage>} />
        <Route path="/blog" element={<LazyPage message="Loading blog..."><BlogPage /></LazyPage>} />
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

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
