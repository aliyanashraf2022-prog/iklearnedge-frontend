import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, ChevronDown, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavigationProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLoginClick, onRegisterClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const { user, logout } = useAuth();
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!user && id === 'subjects') {
      onLoginClick();
      setIsMobileMenuOpen(false);
      return;
    }
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const subjects = ['English', 'Math', 'Computer', 'Accounting', 'Chemistry', 'Physics', 'IELTS', 'SAT'];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-[#f5a623]" />
            <span className={`text-xl font-bold font-['Poppins'] transition-colors ${
              isScrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
            }`}>
              Ik LearnEdge
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('hero')}
              className={`text-sm font-medium transition-colors hover:text-[#f5a623] ${
                isScrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
              }`}
            >
              Home
            </button>

            <button 
              onClick={() => window.location.href='/our-team'}
              className={`text-sm font-medium transition-colors hover:text-[#f5a623] ${
                isScrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
              }`}
            >
              Our Team
            </button>
            
            {/* Subjects Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsSubjectsOpen(true)}
              onMouseLeave={() => setIsSubjectsOpen(false)}
            >
              <button className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-[#f5a623] ${
                isScrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
              }`}>
                <span>Subjects</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSubjectsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSubjectsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-fade-in origin-top">
                  {subjects.map((subject, index) => (
                    <button
                      key={subject}
                      onClick={() => scrollToSection('subjects')}
                      className="block w-full text-left px-4 py-2 text-sm text-[#4a4a4a] hover:bg-[#f5f5f5] hover:text-[#f5a623] transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => scrollToSection('how-it-works')}
              className={`text-sm font-medium transition-colors hover:text-[#f5a623] ${
                isScrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
              }`}
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className={`text-sm font-medium transition-colors hover:text-[#f5a623] ${
                isScrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
              }`}
            >
              Blog
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="btn-primary text-sm flex items-center space-x-2"
              onClick={() => setShowContact(!showContact)}
            >
              <Phone className="w-5 h-5 mr-2" />
              <span>Contact</span>
            </button>
            {showContact && (
              <div className="absolute top-16 right-32 bg-white shadow-lg rounded-lg p-4 z-50 flex flex-col text-[#4a4a4a]">
                <div className="mb-2">
                  <span className="font-semibold">Phone:</span>
                  <a href="tel:+971507454001" className="ml-2 text-blue-600 hover:underline">+971507454001</a>
                </div>
                <div>
                  <span className="font-semibold">Email:</span>
                  <a href="mailto:rubina1.altaf@gmail.com" className="ml-2 text-blue-600 hover:underline">rubina1.altaf@gmail.com</a>
                </div>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#4a4a4a]">Welcome, {user.name}</span>
                <button 
                  onClick={logout}
                  className="text-sm font-medium text-[#4a4a4a] hover:text-[#f5a623] transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className={`text-sm font-medium transition-colors hover:text-[#f5a623] ${
                    isScrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
                  }`}
                >
                  Login
                </button>
                <button 
                  onClick={onRegisterClick}
                  className="btn-primary text-sm"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#4a4a4a]" />
            ) : (
              <Menu className="w-6 h-6 text-[#4a4a4a]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <a href="/about-us" className="block w-full text-left py-2 text-[#4a4a4a] font-medium">About Us</a>
            <a href="/contact-us" className="block w-full text-left py-2 text-[#4a4a4a] font-medium">Contact Us</a>
            <a href="/faqs" className="block w-full text-left py-2 text-[#4a4a4a] font-medium">FAQs</a>
            <a href="/terms" className="block w-full text-left py-2 text-[#4a4a4a] font-medium">Terms and Conditions</a>
            <a href="/privacy" className="block w-full text-left py-2 text-[#4a4a4a] font-medium">Privacy Policy</a>
            <button 
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left py-2 text-[#4a4a4a] font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('subjects')}
              className="block w-full text-left py-2 text-[#4a4a4a] font-medium"
            >
              Subjects
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-[#4a4a4a] font-medium"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="block w-full text-left py-2 text-[#4a4a4a] font-medium"
            >
              Blog
            </button>
            <button 
              onClick={() => window.location.href='/our-team'}
              className="block w-full text-left py-2 text-[#4a4a4a] font-medium"
            >
              Our Team
            </button>
            {!user && (
              <div className="pt-4 border-t space-y-3">
                <button 
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-[#4a4a4a] font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    onRegisterClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-primary w-full text-center"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
