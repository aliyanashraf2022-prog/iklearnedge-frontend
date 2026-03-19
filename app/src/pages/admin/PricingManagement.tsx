import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Save, X, DollarSign, Loader2
} from 'lucide-react';
import { subjectsAPI } from '@/services/api';

interface PricingTier {
  id: number;
  subject_id: number;
  grade_level: string;
  price_per_hour: number;
}

interface Subject {
  id: number;
  name: string;
  pricingTiers: PricingTier[];
}

const PricingManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [newTier, setNewTier] = useState<{ gradeLevel: string; pricePerHour: string } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectsAPI.getAll();
      setSubjects(data.data || data.subjects || []);
      if (data.data?.length > 0) {
        setSelectedSubject(data.data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTier = (tier: PricingTier) => {
    setEditingTier(tier);
    setNewTier(null);
  };

  const handleAddNewTier = (subjectId: number) => {
    setSelectedSubject(subjectId);
    setNewTier({ gradeLevel: '', pricePerHour: '' });
    setEditingTier(null);
  };

  const handleSaveTier = async () => {
    if (editingTier) {
      // Update existing tier - implement backend call
      console.log('Update tier:', editingTier);
      setEditingTier(null);
    } else if (newTier && selectedSubject) {
      // Create new tier - implement backend call
      console.log('Create new tier:', newTier, 'for subject:', selectedSubject);
      setNewTier(null);
    }
  };

  const handleDeleteTier = (tierId: number) => {
    // Implement delete - backend call
    console.log('Delete tier:', tierId);
  };

  const currentSubject = subjects.find(s => s.id === selectedSubject);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#f5a623]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#4a4a4a] font-['Poppins']">
          <DollarSign className="inline-block mr-2 text-[#f5a623]" />
          Pricing Management
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Subject List */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-[#4a4a4a] mb-4 font-['Poppins']">Subjects</h2>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedSubject === subject.id
                    ? 'bg-[#f5a623] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{subject.name}</div>
                <div className="text-sm opacity-75">
                  {subject.pricingTiers?.length || 0} tiers
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
          {currentSubject ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#4a4a4a] font-['Poppins']">
                  Pricing Tiers: {currentSubject.name}
                </h2>
                <button
                  onClick={() => handleAddNewTier(currentSubject.id)}
                  className="btn-primary flex items-center space-x-2 py-2 px-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tier</span>
                </button>
              </div>

              {/* Pricing Tiers Table */}
              <div className="space-y-3">
                {currentSubject.pricingTiers?.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    {editingTier?.id === tier.id ? (
                      <>
                        <input
                          type="text"
                          placeholder="Grade Level"
                          value={editingTier.grade_level}
                          onChange={(e) =>
                            setEditingTier({
                              ...editingTier,
                              grade_level: e.target.value
                            })
                          }
                          className="form-input flex-1 mr-2"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={editingTier.price_per_hour}
                          onChange={(e) =>
                            setEditingTier({
                              ...editingTier,
                              price_per_hour: parseFloat(e.target.value)
                            })
                          }
                          className="form-input flex-1 mr-2"
                        />
                        <button
                          onClick={handleSaveTier}
                          className="btn-primary py-2 px-3"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingTier(null)}
                          className="btn-secondary py-2 px-3 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium text-[#4a4a4a]">{tier.grade_level}</p>
                          <p className="text-sm text-gray-500">Grade Level</p>
                        </div>
                        <div>
                          <p className="font-bold text-[#f5a623] text-lg">
                            ${tier.price_per_hour}/hr
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTier(tier)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTier(tier.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* New Tier Form */}
                {newTier && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <input
                      type="text"
                      placeholder="Enter grade level (e.g., Grade 1-3)"
                      value={newTier.gradeLevel}
                      onChange={(e) =>
                        setNewTier({ ...newTier, gradeLevel: e.target.value })
                      }
                      className="form-input flex-1 mr-2"
                    />
                    <input
                      type="number"
                      placeholder="Price per hour"
                      value={newTier.pricePerHour}
                      onChange={(e) =>
                        setNewTier({ ...newTier, pricePerHour: e.target.value })
                      }
                      className="form-input flex-1 mr-2"
                    />
                    <button
                      onClick={handleSaveTier}
                      disabled={!newTier.gradeLevel || !newTier.pricePerHour}
                      className="btn-primary py-2 px-3 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNewTier(null)}
                      className="btn-secondary py-2 px-3 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {(!currentSubject.pricingTiers || currentSubject.pricingTiers.length === 0) && !newTier && (
                  <div className="text-center py-8 text-gray-500">
                    No pricing tiers found. Click "Add Tier" to create one.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a subject to manage pricing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingManagement;
