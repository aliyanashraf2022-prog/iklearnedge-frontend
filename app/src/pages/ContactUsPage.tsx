import React from 'react';

const ContactUsPage: React.FC = () => (
  <section className="max-w-3xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-bold mb-6 text-center text-[#4a4a4a]">Contact Us</h2>
    <p className="text-[#4a4a4a] text-base mb-4">We’re here to help! Reach out to us for any questions or support.</p>
    <div className="mb-4">
      <span className="font-semibold">Phone:</span> <a href="tel:+971507454001" className="text-blue-600 hover:underline">+971507454001</a>
    </div>
    <div className="mb-4">
      <span className="font-semibold">Email:</span> <a href="mailto:rubina1.altaf@gmail.com" className="text-blue-600 hover:underline">rubina1.altaf@gmail.com</a>
    </div>
    <p className="text-[#666666] text-sm">Our team will respond as soon as possible.</p>
  </section>
);

export default ContactUsPage;
