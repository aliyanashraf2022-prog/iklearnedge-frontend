import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { teachersAPI } from '@/services/api';

interface Teacher {
  id: number;
  name: string;
  profile_picture: string;
  bio: string;
  subject_names: string[];
}

const OurTeam: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await teachersAPI.getTop(10);
        if (res?.success && res?.data) {
          const data = Array.isArray(res.data) ? res.data : [];
          const normalizeExp = (t: any) => {
            const v = t.experience_years ?? t.years_of_experience ?? t.experienceYears ?? t.yearsExperience ?? t.experience ?? 0;
            const n = typeof v === 'string' ? parseFloat(v) : Number(v);
            return isNaN(n) ? 0 : n;
          };
          const top10 = [...data].sort((a, b) => normalizeExp(b) - normalizeExp(a)).slice(0, 10);
          setTeachers(top10);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <GraduationCap className="w-8 h-8 text-[#f5a623]" />
        Our Team
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map(teacher => (
          <div key={teacher.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img
              src={teacher.profile_picture || '/default-profile.jpg'}
              alt={teacher.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-[#f5a623]"
            />
            <h2 className="text-xl font-semibold mb-1">{teacher.name}</h2>
            {(teacher as any).experience_years !== undefined || (teacher as any).years_of_experience !== undefined || (teacher as any).experience !== undefined ? (
              <p className="text-xs text-[#f5a623] font-semibold mb-1">
                {(() => {
                  const v = (teacher as any).experience_years ?? (teacher as any).years_of_experience ?? (teacher as any).experience;
                  return `${v} years experience`;
                })()}
              </p>
            ) : null}
            <p className="text-sm text-gray-500 mb-2">
              {Array.isArray(teacher.subject_names)
                ? teacher.subject_names
                    .map((s: any) => (typeof s === 'string' ? s : s?.name))
                    .filter(Boolean)
                    .join(', ')
                : ''}
            </p>
            <p className="text-gray-700 text-center text-sm">{teacher.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurTeam;
