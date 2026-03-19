import React, { useEffect, useRef } from 'react';
import { UserPlus, FileText, Calendar, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '1',
    title: 'Get Started',
    description: 'Register',
    time: 'Takes few seconds',
    icon: UserPlus
  },
  {
    number: '2',
    title: 'Create Request',
    description: 'Write what you want to learn so tutors can contact you within the platform.',
    time: 'Takes 1 min',
    icon: FileText
  },
  {
    number: '3',
    title: 'Take Free Demo',
    description: 'Schedule a free demo. Decide your fee and details with the tutor.',
    time: 'Takes < 1 day',
    icon: Calendar
  },
  {
    number: '4',
    title: 'Start Tuition',
    description: 'Pay your fee to start classes. Recorded for transparency.',
    time: 'Congratulations!',
    icon: CheckCircle
  }
];

const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Timeline draw animation
      if (timelineRef.current) {
        const line = timelineRef.current.querySelector('.timeline-line');
        gsap.fromTo(line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Cards animation
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.step-card');
        const numbers = cardsRef.current.querySelectorAll('.step-number');

        cards.forEach((card, index) => {
          gsap.fromTo(card,
            { rotateX: 15, y: 50, opacity: 0 },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'expo.out',
              delay: 0.3 + index * 0.2,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });

        numbers.forEach((num, index) => {
          gsap.fromTo(num,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.6,
              ease: 'elastic.out(1, 0.5)',
              delay: 0.5 + index * 0.2,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="py-24 bg-[#f5f5f5] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#f5a623]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#f5a623]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-3xl sm:text-4xl font-bold text-[#4a4a4a] font-['Poppins']"
          >
            Choosing a tutor is <span className="text-[#f5a623]">simple</span>
          </h2>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative mb-8 hidden lg:block">
          <div className="timeline-line absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#f5a623]/30 via-[#f5a623] to-[#f5a623]/30 transform -translate-y-1/2" />
        </div>

        {/* Steps Grid */}
        <div 
          ref={cardsRef}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          style={{ perspective: '1000px' }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number}
                className="step-card relative"
              >
                {/* Step Number */}
                <div className="step-number absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-12 h-12 rounded-full bg-[#f5a623] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-6 pt-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5a623]/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-[#f5a623]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[#4a4a4a] mb-2 font-['Poppins']">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#666666] text-sm mb-4">
                      {step.description}
                    </p>

                    {/* Time Badge */}
                    <div className="inline-block px-4 py-2 bg-[#f5a623]/10 rounded-full">
                      <span className="text-sm font-medium text-[#f5a623]">
                        {step.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connector dot for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 rounded-full bg-[#f5a623] animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
