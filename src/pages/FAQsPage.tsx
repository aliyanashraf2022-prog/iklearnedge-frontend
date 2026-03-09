import React from 'react';

const FAQsPage: React.FC = () => (
  <section className="max-w-3xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-bold mb-6 text-center text-[#4a4a4a]">Frequently Asked Questions</h2>
    <div className="mb-6">
      <h3 className="font-semibold mb-2">How do I book a tutor?</h3>
      <p className="text-[#666666]">Register, create a request, and choose your preferred tutor. You can schedule a free demo before starting tuition.</p>
    </div>
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Are tutors verified?</h3>
      <p className="text-[#666666]">Yes, all tutors are background checked and verified for quality and expertise.</p>
    </div>
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Can I change my tutor?</h3>
      <p className="text-[#666666]">Yes, you can request a new tutor at any time if you’re not satisfied.</p>
    </div>
    <div className="mb-6">
      <h3 className="font-semibold mb-2">How are payments handled?</h3>
      <p className="text-[#666666]">Payments are secure and transparent. You pay only after you’re satisfied with the demo session.</p>
    </div>
  </section>
);

export default FAQsPage;
