import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { teachersAPI } from '@/services/api';

interface TeacherCard {
  id: string | number;
  name: string;
  profilePicture: string;
  bio: string;
  subjectNames: string[];
}

const normalizeSubjects = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'name' in item) return String(item.name);
        return '';
      })
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .replace(/[{}]/g, '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const OurTeamPage: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherCard[]>([]);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await teachersAPI.getAll();
        const items = (response.data || response.teachers || []).slice(0, 6);

        setTeachers(
          items.map((teacher: any) => ({
            id: teacher.id,
            name: teacher.name || 'Teacher',
            profilePicture: teacher.profilePicture || teacher.profile_picture || '/default-profile.jpg',
            bio: teacher.bio || 'Experienced teacher ready to help students grow.',
            subjectNames: normalizeSubjects(teacher.subjects || teacher.subject_names),
          })),
        );
      } catch (error) {
        console.error('Failed to load teachers:', error);
      }
    };

    loadTeachers();
  }, []);

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-4 py-16">
      <div className="mb-10 flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-[#f5a623]" />
        <div>
          <h1 className="text-3xl font-bold text-[#4a4a4a]">Our Team</h1>
          <p className="text-gray-500">Meet some of the tutors helping students at Ik LearnEdge.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <article key={teacher.id} className="rounded-3xl bg-white p-6 shadow-lg">
            <img
              src={teacher.profilePicture}
              alt={teacher.name}
              className="mb-4 h-24 w-24 rounded-full border-2 border-[#f5a623] object-cover"
            />
            <h2 className="text-xl font-semibold text-[#4a4a4a]">{teacher.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{teacher.subjectNames.join(', ') || 'General tutoring'}</p>
            <p className="mt-4 text-sm leading-6 text-gray-600">{teacher.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default OurTeamPage;
