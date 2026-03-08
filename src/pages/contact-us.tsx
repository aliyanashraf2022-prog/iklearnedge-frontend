import React from 'react';

const ContactUs: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="space-y-4">
        <div>
          <span className="font-semibold">Phone:</span>
          <a href="tel:+971507454001" className="ml-2 text-blue-600 hover:underline">+971507454001</a>
        </div>
        <div>
          <span className="font-semibold">Email:</span>
          <a href="mailto:rubina1.altaf@gmail.com" className="ml-2 text-blue-600 hover:underline">rubina1.altaf@gmail.com</a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
