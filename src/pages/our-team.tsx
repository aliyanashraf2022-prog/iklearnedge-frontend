import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  profile_picture: string;
  years_of_experience: number;
  description: string;
}

const OurTeam: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    // Fetch top 10 teachers from backend
    fetch('/api/teachers/top')
      .then(res => res.json())
      .then(data => setTeachers(data));
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
            <p className="text-sm text-gray-500 mb-2">{teacher.years_of_experience} years experience</p>
            <p className="text-gray-700 text-center text-sm">{teacher.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurTeam;
