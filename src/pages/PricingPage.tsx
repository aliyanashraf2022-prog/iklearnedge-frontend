import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PricingItem {
  subject: string;
  class_charge: number;
  hourly_price: number;
}

const PricingPage: React.FC = () => {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/subjects/all`);
        if (res.data.success) {
          // Map admin pricing structure
          setPricing(
            res.data.data.map((item: any) => ({
              subject: item.name,
              class_charge: item.class_charge || item.pricing?.class || 0,
              hourly_price: item.hourly_price || item.pricing?.hourly || 0,
            }))
          );
        } else {
          setError('Failed to load pricing');
        }
      } catch (err) {
        setError('Failed to load pricing');
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-8 text-center text-[#4a4a4a]">Tutor Pricing</h2>
      {loading ? (
        <div className="py-8 text-center">Loading pricing...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-600">{error}</div>
      ) : (
        <table className="w-full border-collapse bg-white rounded-xl shadow-lg">
          <thead>
            <tr className="bg-[#f5a623]/10">
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Class Charges</th>
              <th className="py-3 px-4 text-left">Hourly Price</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((item) => (
              <tr key={item.subject} className="border-b last:border-none">
                <td className="py-3 px-4 font-medium text-[#4a4a4a]">{item.subject}</td>
                <td className="py-3 px-4 text-[#f5a623]">${item.class_charge.toFixed(2)}</td>
                <td className="py-3 px-4 text-[#f5a623]">${item.hourly_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default PricingPage;
