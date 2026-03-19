import React, { useState } from 'react';

interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
}

const initialBlogs: Blog[] = [
  {
    id: 1,
    title: 'The Power of Personalized Learning',
    content:
      'Personalized learning tailors education to each student’s strengths, needs, and interests. It helps students stay motivated, improves outcomes, and fosters a love for learning. Technology enables tutors to adapt lessons and track progress, making learning more effective and enjoyable.',
    author: 'Admin',
    date: '2026-03-09',
  },
  {
    id: 2,
    title: 'How Online Tutoring Transforms Education',
    content:
      'Online tutoring breaks barriers, offering access to quality education regardless of location. It provides flexibility, expert guidance, and interactive tools. Students can connect with tutors worldwide, schedule sessions easily, and receive support tailored to their goals.',
    author: 'Admin',
    date: '2026-03-09',
  },
];

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Simulate admin add/remove
  const handleAddBlog = () => {
    if (!newTitle || !newContent) return;
    setBlogs([
      ...blogs,
      {
        id: Date.now(),
        title: newTitle,
        content: newContent,
        author: 'Admin',
        date: new Date().toISOString().split('T')[0],
      },
    ]);
    setNewTitle('');
    setNewContent('');
  };

  const handleRemoveBlog = (id: number) => {
    setBlogs(blogs.filter((blog) => blog.id !== id));
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-8 text-center text-[#4a4a4a]">Education Blog</h2>
      {/* Admin Add Blog */}
      <div className="mb-8 p-4 bg-[#f5a623]/10 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Add New Blog (Admin)</h3>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Blog Title"
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Blog Content"
          className="w-full mb-2 p-2 border rounded min-h-[80px]"
        />
        <button
          onClick={handleAddBlog}
          className="bg-[#f5a623] text-white px-4 py-2 rounded hover:bg-[#e09513]"
        >
          Add Blog
        </button>
      </div>
      {/* Blog List */}
      <div className="space-y-8">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-[#4a4a4a]">{blog.title}</h3>
              <button
                onClick={() => handleRemoveBlog(blog.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="text-sm text-gray-500 mb-2">By {blog.author} | {blog.date}</div>
            <div className="text-[#4a4a4a] text-base">{blog.content}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogPage;
