import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Save, X, BookOpen, Loader2, Upload, Eye, EyeOff
} from 'lucide-react';
import { subjectsAPI } from '@/services/api';

interface Subject {
  id: number;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
  tutor_count: number;
  pricingTiers?: any[];
}

interface NewSubject {
  name: string;
  description: string;
  image: string;
  pricingTiers: { gradeLevel: string; pricePerHour: string }[];
}

const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Subject> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState<NewSubject>({
    name: '',
    description: '',
    image: '',
    pricingTiers: [{ gradeLevel: '', pricePerHour: '' }]
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectsAPI.getAll();
      setSubjects(data.data || data.subjects || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subjects');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditingData({
      name: subject.name,
      description: subject.description,
      image: subject.image,
      is_active: subject.is_active
    });
  };

  const handleSaveEdit = async () => {
    if (!editingData || !editingId) return;
    setSaving(true);
    try {
      // Call backend to update subject
      console.log('Update subject:', editingId, editingData);
      // TODO: Implement backend API call
      setEditingId(null);
      setEditingData(null);
      await fetchSubjects();
    } catch (err: any) {
      alert('Failed to update subject: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) {
      alert('Subject name is required');
      return;
    }
    setSaving(true);
    try {
      // Call backend to create subject
      console.log('Create new subject:', newSubject);
      // TODO: Implement backend API call
      setNewSubject({
        name: '',
        description: '',
        image: '',
        pricingTiers: [{ gradeLevel: '', pricePerHour: '' }]
      });
      setShowAddForm(false);
      await fetchSubjects();
    } catch (err: any) {
      alert('Failed to create subject: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      // Call backend to delete subject
      console.log('Delete subject:', id);
      // TODO: Implement backend API call
      await fetchSubjects();
    } catch (err: any) {
      alert('Failed to delete subject: ' + err.message);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      // Call backend to toggle active status
      console.log('Toggle active for subject:', id, 'to:', !currentStatus);
      // TODO: Implement backend API call
      await fetchSubjects();
    } catch (err: any) {
      alert('Failed to update subject: ' + err.message);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      // TODO: Upload image and get URL
      const url = URL.createObjectURL(file);
      setNewSubject({ ...newSubject, image: url });
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addPricingTier = () => {
    setNewSubject({
      ...newSubject,
      pricingTiers: [...newSubject.pricingTiers, { gradeLevel: '', pricePerHour: '' }]
    });
  };

  const removePricingTier = (index: number) => {
    setNewSubject({
      ...newSubject,
      pricingTiers: newSubject.pricingTiers.filter((_, i) => i !== index)
    });
  };

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
          <BookOpen className="inline-block mr-2 text-[#f5a623]" />
          Subject Management
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{showAddForm ? 'Cancel' : 'Add Subject'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Subject Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-[#4a4a4a] mb-6 font-['Poppins']">
            Add New Subject
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="form-label">Subject Name *</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Advanced Mathematics"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  className="form-input min-h-[100px]"
                  placeholder="Describe this subject..."
                />
              </div>

              <div>
                <label className="form-label">Subject Image</label>
                <div className="flex items-center space-x-4">
                  {newSubject.image && (
                    <img
                      src={newSubject.image}
                      alt="preview"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <label className="btn-secondary px-4 py-2 flex items-center space-x-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing Tiers */}
            <div>
              <label className="form-label block mb-4">Pricing Tiers</label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {newSubject.pricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-end space-x-2">
                    <input
                      type="text"
                      placeholder="Grade Level"
                      value={tier.gradeLevel}
                      onChange={(e) => {
                        const updated = [...newSubject.pricingTiers];
                        updated[index].gradeLevel = e.target.value;
                        setNewSubject({ ...newSubject, pricingTiers: updated });
                      }}
                      className="form-input flex-1"
                    />
                    <input
                      type="number"
                      placeholder="Price/hr"
                      value={tier.pricePerHour}
                      onChange={(e) => {
                        const updated = [...newSubject.pricingTiers];
                        updated[index].pricePerHour = e.target.value;
                        setNewSubject({ ...newSubject, pricingTiers: updated });
                      }}
                      className="form-input w-24"
                    />
                    <button
                      onClick={() => removePricingTier(index)}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addPricingTier}
                className="btn-secondary mt-3 w-full flex items-center justify-center space-x-2 py-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tier</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleAddSubject}
              disabled={saving}
              className="btn-primary px-6 py-2 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Create Subject'}</span>
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary px-6 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subjects List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Subject Image */}
            <div className="relative h-40 bg-gray-200 overflow-hidden">
              <img
                src={subject.image || '/subject-default.jpg'}
                alt={subject.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleToggleActive(subject.id, subject.is_active)}
                className={`absolute top-2 right-2 p-2 rounded-full ${
                  subject.is_active
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {subject.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Subject Info */}
            <div className="p-4">
              {editingId === subject.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingData?.name || ''}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        name: e.target.value
                      })
                    }
                    className="form-input"
                  />
                  <textarea
                    value={editingData?.description || ''}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        description: e.target.value
                      })
                    }
                    className="form-input min-h-[80px]"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex-1 btn-primary py-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 btn-secondary py-2"
                    >
                      <X className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-[#4a4a4a] mb-2 font-['Poppins']">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {subject.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{subject.tutor_count} tutors</span>
                    <span>{subject.pricingTiers?.length || 0} pricing tiers</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="flex-1 btn-secondary py-2 flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="btn-danger py-2 px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No subjects found</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Create First Subject
          </button>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
