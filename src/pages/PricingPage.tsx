import React, { useEffect, useState } from 'react';
import { subjectsAPI } from '@/services/api';
import { CheckCircle, Gift, AlertCircle } from 'lucide-react';

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
  { id: 'Grade 1-5', label: 'Grade 1-5 (Primary)', basePrice: 50 },
  { id: 'Grade 6-8', label: 'Grade 6-8 (Middle)', basePrice: 70 },
  { id: 'O-Level', label: 'O-Level', basePrice: 100 },
  { id: 'A-Level', label: 'A-Level', basePrice: 150 },
];

const DEFAULT_PRICES: Record<string, number> = {
  'Grade 1-5': 50,
  'Grade 6-8': 70,
  'O-Level': 100,
  'A-Level': 150,
};

const PricingPage: React.FC = () => {
  const [subjectPricing, setSubjectPricing] = useState<SubjectPricing[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await subjectsAPI.getAll();
        if (res.success && res.data && Array.isArray(res.data)) {
          // Deduplicate subjects by name
          const seenNames = new Set<string>();
          const uniqueSubjects: any[] = [];
          
          res.data.forEach((item: any) => {
            const normalizedName = item.name?.trim().toLowerCase();
            if (normalizedName && !seenNames.has(normalizedName)) {
              seenNames.add(normalizedName);
              uniqueSubjects.push(item);
            }
          });

          const pricingData: SubjectPricing[] = uniqueSubjects.map((item: any) => {
            // Parse pricing tiers from API response (handle both snake_case and camelCase)
            const tiers: PricingTier[] = (item.pricingTiers || []).map((tier: any) => ({
              gradeLevel: tier.gradeLevel || tier.grade_level || tier.gradeLevel,
              price: parseFloat(tier.pricePerHour || tier.price_per_hour) || 0,
            }));

            // If no tiers from API, use default prices
            if (tiers.length === 0) {
              GRADE_LEVELS.forEach(gl => {
                tiers.push({
                  gradeLevel: gl.id,
                  price: gl.basePrice
                });
              });
            }

            return {
              subject: item.name,
              subjectId: item.id,
              tiers,
            };
          });
          
          setSubjectPricing(pricingData);
        } else {
          setError(res.message || 'Failed to load subjects.');
        }
      } catch (err: any) {
        console.error('Pricing fetch error:', err);
        setError(err.message || 'Error connecting to the API.');
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const toggleSubject = (subjectId: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedSubjects(newSelected);
  };

  const getPriceForGrade = (tiers: PricingTier[], gradeLevel: string): number => {
    const tier = tiers.find(t => t.gradeLevel === gradeLevel);
    return tier?.price || DEFAULT_PRICES[gradeLevel] || 0;
  };

  const formatPrice = (price: number): string => {
    if (price <= 0 || isNaN(price)) return '-';
    return `AED ${price}`;
  };

  const calculateTotal = (): { subtotal: number; discount: number; total: number } => {
    if (selectedSubjects.size === 0) return { subtotal: 0, discount: 0, total: 0 };

    const avgPrice = 80; // Average hourly rate
    const subtotal = selectedSubjects.size * avgPrice;
    const discount = selectedSubjects.size >= 4 ? subtotal * 0.2 : 0;
    const total = subtotal - discount;
    
    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculateTotal();

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
        <div className="grid grid-cols-6 gap-4 p-6 bg-[#f5a623]/10 border-b">
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Subject</h3>
          </div>
          <div className="col-span-1 text-center">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Select</h3>
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
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : subjectPricing.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-lg mb-2">No pricing data available.</p>
            <p className="text-sm">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="divide-y">
            {subjectPricing.map((item) => (
              <div key={item.subjectId} className="grid grid-cols-6 gap-4 p-6 hover:bg-gray-50 transition-colors items-center">
                <div className="col-span-1">
                  <span className="font-semibold text-[#4a4a4a]">{item.subject}</span>
                </div>
                <div className="col-span-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.has(item.subjectId)}
                    onChange={() => toggleSubject(item.subjectId)}
                    className="w-5 h-5 text-[#f5a623] rounded border-gray-300 focus:ring-[#f5a623] cursor-pointer"
                  />
                </div>
                {GRADE_LEVELS.map((grade) => {
                  const price = getPriceForGrade(item.tiers, grade.id);
                  return (
                    <div key={grade.id} className="text-center">
                      <span className={`text-lg font-bold ${price > 0 ? 'text-green-600' : 'text-gray-400'}`}>
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

      {selectedSubjects.size > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-[#4a4a4a] mb-4">Your Selection</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subjects Selected</span>
              <span className="font-medium">{selectedSubjects.size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Hourly Rate (avg)</span>
              <span className="font-medium">AED 80/hour</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">AED {subtotal.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="flex items-center">
                  <Gift className="w-4 h-4 mr-2" />
                  20% Discount (4+ subjects)
                </span>
                <span className="font-bold">-AED {discount.toFixed(0)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-bold text-lg">Estimated Total</span>
              <span className="font-bold text-2xl text-[#f5a623]">AED {total.toFixed(0)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Final pricing may vary. Contact us for exact quotes based on your requirements.
          </p>
        </div>
      )}

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
