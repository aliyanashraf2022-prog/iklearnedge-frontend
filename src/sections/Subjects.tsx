import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const subjects = [
  {
    id: 1,
    name: 'English',
    description: 'Master English language skills with expert tutors.',
    image: '/subject-english.jpg',
    tutorCount: 15,
  },
  {
    id: 2,
    name: 'Chemistry',
    description: 'Learn Chemistry from qualified professionals.',
    image: '/subject-chemistry.jpg',
    tutorCount: 12,
  },
  {
    id: 3,
    name: 'Physics',
    description: 'Understand the laws of the universe.',
    image: '/subject-physics.jpg',
    tutorCount: 10,
  },
  {
    id: 4,
    name: 'Science',
    description: 'Comprehensive science tutoring for all levels.',
    image: '/subject-science.jpg',
    tutorCount: 18,
  },
  {
    id: 5,
    name: 'Math',
    description: 'From basic arithmetic to advanced calculus.',
    image: '/subject-math.jpg',
    tutorCount: 20,
  },
  {
    id: 6,
    name: 'IELTS',
    description: 'Prepare for your IELTS exam with certified trainers.',
    image: '/subject-ielts.jpg',
    tutorCount: 8,
  },
  {
    id: 7,
    name: 'SAT',
    description: 'Comprehensive SAT preparation courses.',
    image: '/subject-sat.jpg',
    tutorCount: 6,
  },
  {
    id: 8,
    name: 'Accounting',
    description: 'From begning to advance calculations.',
    image: '/subject-accounting.jpg',
    tutorCount: 9,
  }
];

const Subjects: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: 40, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards stagger animation
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.subject-card');
        cards.forEach((card, index) => {
          gsap.fromTo(card,
            { y: 60, opacity: 0, rotate: index % 2 === 0 ? -2 : 2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.6,
              ease: 'expo.out',
              delay: index * 0.1,
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
      id="subjects" 
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#f5f5f5] to-transparent opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#4a4a4a] mb-4 font-['Poppins']">
            Subjects <span className="text-[#f5a623]">We Teach</span>
          </h2>
          <p className="text-[#666666] max-w-xl mx-auto">
            Explore a wide range of subjects taught by expert tutors across Pakistan
          </p>
        </div>

        {/* Subjects Grid */}
        <div 
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {subjects.map((subject) => (
            <div 
              key={subject.id}
              className="subject-card group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-350 cursor-pointer"
              style={{
                transform: 'translateZ(0)',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={subject.image}
                  alt={subject.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Subject Name on Image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white font-['Poppins']">
                    {subject.name}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-[#666666] text-sm mb-4 line-clamp-2">
                  {subject.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#f5a623]" />
                    <span className="text-sm text-[#666666]">
                      {subject.tutorCount} Tutors
                    </span>
                  </div>
                  
                  <button className="text-[#f5a623] text-sm font-medium hover:underline flex items-center space-x-1 group/btn">
                    <span>Explore</span>
                    <svg 
                      className="w-4 h-4 transform transition-transform group-hover/btn:translate-x-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-[#f5a623]/10 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Subjects;
