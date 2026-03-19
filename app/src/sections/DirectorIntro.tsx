import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface DirectorIntroProps {
  directorImage?: string;
  directorName?: string;
  directorTitle?: string;
  directorIntro?: string;
}

const DirectorIntro: React.FC<DirectorIntroProps> = ({
  directorImage = '/api/placeholder/300/300',
  directorName = 'Director Name',
  directorTitle = 'Director',
  directorIntro = 'Add director introduction text here'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image animation
      gsap.fromTo(imageRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Content animation
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Director Image */}
          <div
            ref={imageRef}
            className="flex justify-center md:justify-start"
          >
            <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={directorImage}
                alt={directorName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Director Info */}
          <div ref={contentRef} className="flex flex-col justify-center">
            <div className="mb-2">
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">
                Meet Our Leader
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
              {directorName}
            </h2>
            <p className="text-lg text-indigo-600 font-medium mb-6">
              {directorTitle}
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              {directorIntro}
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-indigo-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-slate-600">Passionate about</p>
                  <p className="font-semibold text-slate-900">Education & Innovation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DirectorIntro;
