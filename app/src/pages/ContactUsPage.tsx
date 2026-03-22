import React from 'react';

const contactItems = [
  {
    label: 'Phone',
    value: '+971507454001',
    href: 'tel:+971507454001',
  },
  {
    label: 'Email',
    value: 'rubina1.altaf@gmail.com',
    href: 'mailto:rubina1.altaf@gmail.com',
  },
];

const ContactUsPage: React.FC = () => (
  <section className="mx-auto min-h-screen max-w-3xl px-4 py-16">
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <h1 className="mb-4 text-3xl font-bold text-[#4a4a4a]">Contact Us</h1>
      <p className="mb-8 text-base text-gray-600">
        We are here to help. Reach out any time and our team will get back to you as soon as possible.
      </p>

      <div className="space-y-4">
        {contactItems.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-500">{item.label}</p>
            <a href={item.href} className="mt-1 inline-block text-lg font-medium text-[#f5a623] hover:underline">
              {item.value}
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ContactUsPage;
