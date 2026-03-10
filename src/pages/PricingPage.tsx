import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PricingItem {
  subject: string;
  gradeLevel: string;
  hourly_price: number;
}

const API_URL = 'https://web-production-5a949.up.railway.app/api';

const PricingPage: React.FC = () => {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await axios.get(`${API_URL}/subjects`);
        if (res.data.success && res.data.data) {
          const allPricing: PricingItem[] = [];
          res.data.data.forEach((item: any) => {
            if (item.pricingTiers && item.pricingTiers.length > 0) {
              item.pricingTiers.forEach((tier: any) => {
                allPricing.push({
                  subject: item.name,
                  gradeLevel: tier.grade_level,
                  hourly_price: parseFloat(tier.price_per_hour),
                });
              });
            }
          });
          setPricing(allPricing);
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
      ) : pricing.length === 0 ? (
        <div className="py-8 text-center">No pricing data available</div>
      ) : (
        <table className="w-full border-collapse bg-white rounded-xl shadow-lg">
          <thead>
            <tr className="bg-[#f5a623]/10">
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Grade Level</th>
              <th className="py-3 px-4 text-left">Hourly Price</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((item, idx) => (
              <tr key={`${item.subject}-${item.gradeLevel}-${idx}`} className="border-b last:border-none">
                <td className="py-3 px-4 font-medium text-[#4a4a4a]">{item.subject}</td>
                <td className="py-3 px-4 text-gray-600">{item.gradeLevel}</td>
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
