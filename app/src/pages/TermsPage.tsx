import React from 'react';

const TermsPage: React.FC = () => (
  <section className="max-w-3xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-bold mb-6 text-center text-[#4a4a4a]">Terms and Conditions</h2>
    <p className="text-[#4a4a4a] text-base mb-4">By using Ik LearnEdge, you agree to our terms and conditions. Please read them carefully.</p>
    <ul className="list-disc pl-6 text-[#666666]">
      <li>All users must provide accurate information during registration.</li>
      <li>Tutors are verified, but students are responsible for their own learning progress.</li>
      <li>Payments are handled securely through the platform.</li>
      <li>Any misuse of the platform may result in account suspension.</li>
      <li>Ik LearnEdge reserves the right to update terms at any time.</li>
    </ul>
  </section>
);

export default TermsPage;
