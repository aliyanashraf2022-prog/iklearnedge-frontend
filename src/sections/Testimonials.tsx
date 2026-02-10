import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: 'Ahmed',
    role: 'Grade 10 Student',
    image: '/testimonial-ahmed.jpg',
    quote: 'IkLearnEdge made math easy for me! My tutor was so patient and explained every concept until I understood it. Highly recommend!'
  },
  {
    id: 2,
    name: 'Sara Khan',
    role: 'O-Level Student',
    image: '/testimonial-sara.jpg',
    quote: 'The platform is super easy to use. I booked a demo within minutes and found the perfect physics tutor for my exams.'
  },
  {
    id: 3,
    name: 'Jackson',
    role: 'University Student',
    image: '/testimonial-jackson.jpg',
    quote: 'Loved how professional and friendly the tutors are. I improved my grades and confidence a lot!'
  }
];

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Carousel entrance
      gsap.fromTo(carouselRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff + testimonials.length) % testimonials.length);
    
    if (normalizedDiff === 0) {
      return {
        transform: 'translateX(0) translateZ(50px) scale(1)',
        opacity: 1,
        zIndex: 10
      };
    } else if (normalizedDiff === 1 || normalizedDiff === -testimonials.length + 1) {
      return {
        transform: 'translateX(120%) translateZ(-100px) scale(0.85) rotateY(-15deg)',
        opacity: 0.5,
        zIndex: 5
      };
    } else if (normalizedDiff === testimonials.length - 1 || normalizedDiff === -1) {
      return {
        transform: 'translateX(-120%) translateZ(-100px) scale(0.85) rotateY(15deg)',
        opacity: 0.5,
        zIndex: 5
      };
    }
    return {
      transform: 'translateX(0) translateZ(-200px) scale(0.7)',
      opacity: 0,
      zIndex: 0
    };
  };

  return (
    <section 
      id="testimonials" 
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Quote */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Quote className="w-96 h-96 text-[#f5a623]/5" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#4a4a4a] mb-4 font-['Poppins']">
            What Our <span className="text-[#f5a623]">Students Say</span>
          </h2>
          <p className="text-[#666666] max-w-xl mx-auto">
            Trusted by thousands of learners across Pakistan
          </p>
        </div>

        {/* 3D Carousel */}
        <div 
          ref={carouselRef}
          className="relative h-[400px] flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="absolute w-full max-w-md transition-all duration-700 ease-out"
              style={{
                ...getCardStyle(index),
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#e0e0e0]">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-10 h-10 text-[#f5a623]" />
                </div>

                {/* Quote Text */}
                <p className="text-[#4a4a4a] text-lg mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#f5a623]"
                  />
                  <div>
                    <h4 className="font-bold text-[#4a4a4a] font-['Poppins']">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-[#666666]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button 
            onClick={goToPrev}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#f5a623] hover:text-white transition-all duration-300 group"
          >
            <ChevronLeft className="w-6 h-6 text-[#4a4a4a] group-hover:text-white" />
          </button>

          {/* Dots */}
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-[#f5a623] w-8' 
                    : 'bg-[#e0e0e0] hover:bg-[#f5a623]/50'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={goToNext}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#f5a623] hover:text-white transition-all duration-300 group"
          >
            <ChevronRight className="w-6 h-6 text-[#4a4a4a] group-hover:text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
