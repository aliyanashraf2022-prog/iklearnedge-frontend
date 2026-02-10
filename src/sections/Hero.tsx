import React, { useEffect, useRef } from 'react';
import { ArrowRight, Users, BookOpen } from 'lucide-react';
import gsap from 'gsap';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for entrance animations
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // Image reveal
      tl.fromTo(imageRef.current, 
        { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
        { clipPath: 'circle(100% at 50% 50%)', opacity: 1, duration: 1 },
        0.2
      );

      // Headline animation - word by word
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        tl.fromTo(words,
          { rotateX: -90, opacity: 0, transformOrigin: 'center bottom' },
          { rotateX: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          0.4
        );
      }

      // Subheadline blur reveal
      tl.fromTo(subheadlineRef.current,
        { filter: 'blur(10px)', opacity: 0 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.8 },
        0.8
      );

      // CTA button bounce in
      tl.fromTo(ctaRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' },
        1
      );

      // Stats slide in
      if (statsRef.current) {
        const stats = statsRef.current.querySelectorAll('.stat-item');
        tl.fromTo(stats,
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
          1.1
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Floating animation for stats
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (statsRef.current) {
        const stats = statsRef.current.querySelectorAll('.stat-item');
        stats.forEach((stat, index) => {
          gsap.to(stat, {
            y: index % 2 === 0 ? 8 : -10,
            duration: index % 2 === 0 ? 6 : 7,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="hero" 
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-white"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #f5a623 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Content */}
          <div className="relative z-10 order-2 lg:order-1">
            <h1 
              ref={headlineRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4a4a4a] leading-tight mb-6 font-['Poppins']"
              style={{ perspective: '1000px' }}
            >
              <span className="word inline-block">International</span>{' '}
              <span className="word inline-block">Premier</span>{' '}
              <span className="word inline-block">Online</span>{' '}
              <span className="word inline-block text-[#f5a623]">Tutoring</span>{' '}
              <span className="word inline-block text-[#f5a623]">Platform</span>
            </h1>

            <p 
              ref={subheadlineRef}
              className="text-lg text-[#666666] mb-8 max-w-xl"
            >
              Where Excellence Meets Education. Top-Quality Tutors, Innovative Technology, 
              and Personalized Learning.
            </p>

            <button 
              ref={ctaRef}
              onClick={onGetStarted}
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 animate-pulse-glow"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Stats */}
            <div ref={statsRef} className="flex flex-wrap gap-8 mt-12">
              <div className="stat-item flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#f5a623]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#4a4a4a] font-['Poppins']">21.9 K+</div>
                  <div className="text-sm text-[#666666]">Students</div>
                </div>
              </div>

              <div className="stat-item flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#f5a623]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#4a4a4a] font-['Poppins']">63.3 K+</div>
                  <div className="text-sm text-[#666666]">Classes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div 
            ref={imageRef}
            className="relative order-1 lg:order-2"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/hero-image.jpg" 
                alt="Student learning online"
                className="w-full h-auto object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#f5a623]/20 rounded-full blur-xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#f5a623]/10 rounded-full blur-xl" />
            
            {/* Floating card */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#4a4a4a]">Verified Tutors</div>
                  <div className="text-xs text-[#666666]">100% Background Checked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
