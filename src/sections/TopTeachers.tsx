import React, { useEffect, useState } from 'react';
import { teachersAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

const TopTeachers: React.FC = () => {
  const { formatCurrency } = useSettings();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await teachersAPI.getTop(5);
        if (res.success && Array.isArray(res.data)) {
          const processedTeachers = res.data.map((t: any) => ({
            ...t,
            subject_names: Array.isArray(t.subject_names) 
              ? t.subject_names 
              : typeof t.subject_names === 'string' 
                ? t.subject_names.replace(/[{}]/g, '').split(',').map((s: string) => s.trim()).filter(Boolean)
                : []
          }));
          setTeachers(processedTeachers);
        } else {
          setError('Failed to load teachers');
        }
      } catch (err) {
        setError('Failed to load top teachers from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading top teachers...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;
  if (teachers.length === 0) return <div className="py-8 text-center text-gray-500">No top teachers available yet.</div>;

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-2 text-center text-[#4a4a4a] font-['Poppins']">Top Verified Tutors</h2>
      <p className="text-center text-lg text-gray-500 mb-10">Our highest-rated instructors ready for your session.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="teacher-card p-6 flex flex-col items-center">
            <img
              src={teacher.profile_picture || '/default-profile.png'}
              alt={teacher.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary-500/50"
            />
            <h3 className="text-xl font-bold mb-1 text-[#4a4a4a] font-['Poppins']">{teacher.name}</h3>
            <div className="text-sm text-gray-600 mb-3 line-clamp-2 text-center h-10">{teacher.bio || 'Expert tutor in selected subjects.'}</div>
            
            <div className="flex flex-wrap gap-2 mt-2 justify-center mb-4">
              {teacher.subject_names?.map((subject: string) => (
                <span key={subject} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {subject}
                </span>
              ))}
            </div>

            <div className="text-center mt-auto pt-4 border-t w-full border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Starting From</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(50)}</p> {/* Placeholder for now, will fix price display in next step */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopTeachers;
