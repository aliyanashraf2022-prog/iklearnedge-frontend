import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = [
  { name: 'About Us', href: '#' },
  { name: 'Contact Us', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'FAQs', href: '#' },
  { name: 'Blog', href: '#' },
  { name: 'Terms and Conditions', href: '#' },
  { name: 'Privacy Policy', href: '#' }
];

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Footer entrance animation
      gsap.fromTo(contentRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Links stagger animation
      const links = contentRef.current?.querySelectorAll('.footer-link');
      if (links) {
        gsap.fromTo(links,
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'expo.out',
            delay: 0.2,
            scrollTrigger: {
              trigger: footerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer 
      ref={footerRef}
      className="bg-[#4a4a4a] text-white relative overflow-hidden"
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f5a623] to-transparent opacity-60" />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Logo and Description */}
        <div className="flex flex-col items-center mb-12">
          <a href="/" className="flex items-center space-x-2 mb-4">
            <GraduationCap className="w-10 h-10 text-[#f5a623]" />
            <span className="text-2xl font-bold font-['Poppins']">Ik LearnEdge</span>
          </a>
          <p className="text-white/60 text-center max-w-md">
            Connecting students with expert tutors for personalized online learning experiences.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="footer-link text-white/70 hover:text-[#f5a623] transition-colors duration-250 text-sm relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#f5a623] transition-all duration-250 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Newsletter */}
        <div className="max-w-md mx-auto mb-12">
          <h4 className="text-center text-lg font-semibold mb-4 font-['Poppins']">
            Signup for Updates
          </h4>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#f5a623] focus:ring-2 focus:ring-[#f5a623]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#f5a623] text-white rounded-lg font-medium hover:bg-[#e09513] transition-colors flex items-center space-x-2"
            >
              <span>Subscribe</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          {isSubscribed && (
            <p className="text-center text-green-400 text-sm mt-2 animate-fade-in">
              Thank you for subscribing!
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-4 mb-8">
          {[
            { icon: Facebook, href: '#' },
            { icon: Twitter, href: '#' },
            { icon: Instagram, href: '#' },
            { icon: Linkedin, href: '#' }
          ].map(({ icon: Icon, href }, index) => (
            <a
              key={index}
              href={href}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#f5a623] transition-colors duration-300"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/50 text-sm">
            © Copyright {new Date().getFullYear()} IkLearnEdge.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
