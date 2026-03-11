import React, { useEffect, useState } from 'react';
import { subjectsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface PricingItem {
  subject: string;
  gradeLevel: string;
  hourly_price: number;
}

const PricingPage: React.FC = () => {
  const { formatCurrency } = useSettings();
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await subjectsAPI.getAll();
        if (res.success && res.data) {
          const allPricing: PricingItem[] = [];
          res.data.forEach((item: any) => {
            if (item.pricingTiers && item.pricingTiers.length > 0) {
              item.pricingTiers.forEach((tier: any) => {
                allPricing.push({
                  subject: item.name,
                  gradeLevel: tier.gradeLevel,
                  hourly_price: parseFloat(tier.pricePerHour),
                });
              });
            }
          });
          setPricing(allPricing);
        } else {
          setError(res.message || 'Failed to load subjects.');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to the API.');
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);
  
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-['Poppins'] text-[#4a4a4a] mb-3">Transparent Pricing</h1>
        <p className="text-xl text-gray-500">Find the right tutor at the right price. All prices listed in {formatCurrency(100).replace('100.00', '')}.</p>
      </header>

      {loading ? (
        <div className="py-16 text-center">
          <p className='text-lg text-gray-500'>Loading pricing data...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-600">{error}</div>
      ) : pricing.length === 0 ? (
        <div className="py-16 text-center text-gray-500">No pricing data available.</div>
      ) : (
        <table className="w-full border-collapse bg-white rounded-xl shadow-xl">
          <thead>
            <tr className="bg-accent/10">
              <th className="py-4 px-4 text-left text-sm font-semibold text-secondary uppercase">Subject</th>
              <th className="py-4 px-4 text-left text-sm font-semibold text-secondary uppercase">Grade Level</th>
              <th className="py-4 px-4 text-right text-sm font-semibold text-secondary uppercase">Hourly Price</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((item, idx) => (
              <tr key={`${item.subject}-${item.gradeLevel}-${idx}`} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-medium text-[#4a4a4a]">{item.subject}</td>
                <td className="py-4 px-4 text-gray-600">{item.gradeLevel}</td>
                <td className="py-4 px-4 text-right">
                  <span className="text-lg font-bold text-green-600">{formatCurrency(item.hourly_price)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default PricingPage;
