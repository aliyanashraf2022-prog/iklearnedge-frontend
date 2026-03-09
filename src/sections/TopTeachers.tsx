import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Teacher {
  id: string;
  name: string;
  profile_picture: string;
  bio: string;
  years_of_experience: number;
  subject_names: string[];
}

const TopTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/teachers/top?limit=5`);
        if (res.data.success) {
          setTeachers(res.data.data);
        } else {
          setError('Failed to load teachers');
        }
      } catch (err) {
        setError('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (loading) return <div className="py-8 text-center">Loading top teachers...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-8 text-center text-[#4a4a4a]">Top Verified Tutors</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <img
              src={teacher.profile_picture || '/default-profile.png'}
              alt={teacher.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-[#f5a623]"
            />
            <h3 className="text-lg font-semibold mb-1">{teacher.name}</h3>
            <div className="text-sm text-gray-500 mb-2">{teacher.years_of_experience} years experience</div>
            <div className="text-xs text-gray-600 mb-3">{teacher.bio}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {teacher.subject_names.map((subject) => (
                <span key={subject} className="px-2 py-1 bg-[#f5a623]/10 text-[#f5a623] rounded-full text-xs">
                  {subject}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopTeachers;
