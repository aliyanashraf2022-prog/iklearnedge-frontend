import React, { useEffect, useState } from 'react';
import { teachersAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

const TopTeachers: React.FC = () => {
  const { formatCurrency } = useSettings();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hadError, setHadError] = useState(false);

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
          setHadError(true);
        }
      } catch (err) {
        setHadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading top teachers...</div>;
  if (hadError) return null;
  if (teachers.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map((teacher, idx) => {
          const subjects: string[] =
            Array.isArray(teacher?.subject_names)
              ? teacher.subject_names
                  .map((s: any) => (typeof s === 'string' ? s : s?.name))
                  .filter(Boolean)
              : Array.isArray(teacher?.subjects)
              ? teacher.subjects
                  .map((s: any) => (typeof s === 'string' ? s : s?.name))
                  .filter(Boolean)
              : [];

          const profile =
            teacher.profile_picture ||
            teacher.profilePicture ||
            '/default-profile.png';

          const displayName = teacher.name || teacher.full_name || 'Tutor';

          return (
          <div key={teacher.id ?? `teacher-${idx}`} className="teacher-card p-6 flex flex-col items-center">
            <img
              src={profile}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary-500/50"
            />
            <h3 className="text-xl font-bold mb-1 text-[#4a4a4a] font-['Poppins']">{displayName}</h3>
            <div className="text-sm text-gray-600 mb-3 line-clamp-2 text-center h-10">{teacher.bio || 'Expert tutor in selected subjects.'}</div>
            
            <div className="flex flex-wrap gap-2 mt-2 justify-center mb-4">
              {subjects.map((subject: string, i: number) => (
                <span key={`${teacher.id ?? idx}-${subject}-${i}`} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {subject}
                </span>
              ))}
            </div>

            <div className="text-center mt-auto pt-4 border-t w-full border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Starting From</p>
                <p className="text-xl font-bold text-green-600">AED 50</p>
            </div>
          </div>
        )})}
      </div>
    </section>
  );
};

export default TopTeachers;
