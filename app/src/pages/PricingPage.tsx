import React, { useEffect, useState } from 'react';
import { subjectsAPI } from '@/services/api';
import { CheckCircle, Gift } from 'lucide-react';

interface PricingTier {
  gradeLevel: string;
  price: number;
}

interface SubjectPricing {
  subject: string;
  subjectId: string;
  tiers: PricingTier[];
}

const GRADE_LEVELS = [
  { id: 'Grade 1-5', label: 'Grade 1-5 (Primary)', price: 50 },
  { id: 'Grade 6-8', label: 'Grade 6-8 (Middle)', price: 70 },
  { id: 'O-Level', label: 'O-Level', price: 100 },
  { id: 'A-Level', label: 'A-Level', price: 150 },
];

const PricingPage: React.FC = () => {
  const [subjectPricing, setSubjectPricing] = useState<SubjectPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await subjectsAPI.getAll();
        if (res.success && res.data) {
          const pricingData: SubjectPricing[] = res.data.map((item: any) => ({
            subject: item.name,
            subjectId: item.id,
            tiers: item.pricingTiers?.map((tier: any) => ({
              gradeLevel: tier.gradeLevel,
              price: parseFloat(tier.pricePerHour) || 0,
            })) || [],
          }));
          setSubjectPricing(pricingData);
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

  const getPriceForGrade = (tiers: PricingTier[], gradeLevel: string): number => {
    const tier = tiers.find(t => t.gradeLevel === gradeLevel);
    return tier?.price ?? 0;
  };

  const formatPrice = (price: number): string => {
    if (price <= 0 || isNaN(price)) return '-';
    return `AED ${price}`;
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-16 min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-['Poppins'] text-[#4a4a4a] mb-3">Transparent Pricing</h1>
        <p className="text-xl text-gray-500 mb-2">Find the right tutor at the right price.</p>
        <p className="text-lg text-[#f5a623] font-medium">All prices listed in AED (UAE Dirham)</p>
      </header>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-200">
        <div className="flex items-start space-x-4">
          <Gift className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-green-800 mb-1">20% Discount for 4+ Subjects!</h3>
            <p className="text-green-700">
              Book tutoring for 4 or more subjects and receive a 20% discount on your total. 
              Perfect for comprehensive academic support across all your courses.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="grid grid-cols-5 gap-4 p-6 bg-[#f5a623]/10 border-b">
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Subject</h3>
          </div>
          {GRADE_LEVELS.map((grade) => (
            <div key={grade.id} className="text-center">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">{grade.label}</h3>
              <p className="text-xs text-gray-500 mt-1">AED/hr</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <p className="text-lg text-gray-500">Loading pricing data...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-600">{error}</div>
        ) : subjectPricing.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-lg mb-2">No pricing data available.</p>
            <p className="text-sm">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="divide-y">
            {subjectPricing.map((item, idx) => (
              <div key={`${item.subjectId}-${idx}`} className="grid grid-cols-5 gap-4 p-6 hover:bg-gray-50 transition-colors items-center">
                <div className="col-span-1">
                  <span className="font-semibold text-[#4a4a4a]">{item.subject}</span>
                </div>
                {GRADE_LEVELS.map((grade) => {
                  const price = getPriceForGrade(item.tiers, grade.id);
                  return (
                    <div key={grade.id} className="text-center">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          What's Included
        </h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            One-on-one personalized tutoring sessions
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Flexible scheduling to fit your routine
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Progress tracking and regular assessments
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Expert tutors with verified qualifications
          </li>
          <li className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Additional practice materials included
          </li>
        </ul>
      </div>
    </main>
  );
};

export default PricingPage;
