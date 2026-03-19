import React from 'react';

const PrivacyPage: React.FC = () => (
  <section className="max-w-3xl mx-auto px-4 py-12">
    <h2 className="text-2xl font-bold mb-6 text-center text-[#4a4a4a]">Privacy Policy</h2>
    <p className="text-[#4a4a4a] text-base mb-4">Your privacy is important to us. Ik LearnEdge is committed to protecting your personal information.</p>
    <ul className="list-disc pl-6 text-[#666666]">
      <li>We collect only necessary information for registration and learning purposes.</li>
      <li>Your data is never shared with third parties without consent.</li>
      <li>All communications are encrypted and secure.</li>
      <li>You can request data deletion at any time.</li>
    </ul>
  </section>
);

export default PrivacyPage;
