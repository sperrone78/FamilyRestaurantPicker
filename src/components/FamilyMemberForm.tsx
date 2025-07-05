import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { referenceDataApi } from '../services/api';
import { FamilyMember, CreateFamilyMemberRequest, DietaryRestriction, Cuisine } from '../types';

interface FamilyMemberFormProps {
  member?: FamilyMember;
  onSubmit: (data: CreateFamilyMemberRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function FamilyMemberForm({ member, onSubmit, onCancel, isLoading }: FamilyMemberFormProps) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    dietaryRestrictions: member?.dietaryRestrictions?.map(dr => dr.id) || [],
    cuisinePreferences: member?.cuisinePreferences?.map(cp => ({
      cuisineId: cp.cuisineId,
      preferenceLevel: cp.preferenceLevel
    })) || []
  });

  // Update form data when member prop changes (for editing different members)
  useEffect(() => {
    setFormData({
      name: member?.name || '',
      email: member?.email || '',
      dietaryRestrictions: member?.dietaryRestrictions?.map(dr => dr.id) || [],
      cuisinePreferences: member?.cuisinePreferences?.map(cp => ({
        cuisineId: cp.cuisineId,
        preferenceLevel: cp.preferenceLevel
      })) || []
    });
  }, [member]);

  const { data: dietaryRestrictions = [] } = useQuery(
    'dietaryRestrictions',
    referenceDataApi.getDietaryRestrictions
  );

  const { data: cuisines = [] } = useQuery(
    'cuisines',
    referenceDataApi.getCuisines
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      name: formData.name,
      email: formData.email || undefined,
      // Always send arrays (even if empty) so backend knows to clear them
      dietaryRestrictions: formData.dietaryRestrictions,
      cuisinePreferences: formData.cuisinePreferences
    };
    onSubmit(submitData);
  };

  const handleDietaryRestrictionChange = (restrictionId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: checked
        ? [...prev.dietaryRestrictions, restrictionId]
        : prev.dietaryRestrictions.filter(id => id !== restrictionId)
    }));
  };

  const handleCuisinePreferenceChange = (cuisineId: number, level: number) => {
    setFormData(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.some(cp => cp.cuisineId === cuisineId)
        ? prev.cuisinePreferences.map(cp => 
            cp.cuisineId === cuisineId ? { ...cp, preferenceLevel: level } : cp
          )
        : [...prev.cuisinePreferences, { cuisineId, preferenceLevel: level }]
    }));
  };

  const removeCuisinePreference = (cuisineId: number) => {
    setFormData(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.filter(cp => cp.cuisineId !== cuisineId)
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {member ? 'Edit Family Member' : 'Add Family Member'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter family member's name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Dietary Restrictions
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dietaryRestrictions.map((restriction) => (
              <label key={restriction.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dietaryRestrictions.includes(restriction.id)}
                  onChange={(e) => handleDietaryRestrictionChange(restriction.id, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{restriction.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cuisine Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cuisine Preferences (1-5 scale)
          </label>
          
          {/* Selected Preferences */}
          {formData.cuisinePreferences.map((pref) => {
            const cuisine = cuisines.find(c => c.id === pref.cuisineId);
            return (
              <div key={pref.cuisineId} className="flex items-center space-x-4 mb-3 p-3 bg-gray-50 rounded-md">
                <span className="font-medium text-gray-700 flex-1">{cuisine?.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <select
                    value={pref.preferenceLevel}
                    onChange={(e) => handleCuisinePreferenceChange(pref.cuisineId, parseInt(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={1}>1 - Don't like</option>
                    <option value={2}>2 - Dislike</option>
                    <option value={3}>3 - Neutral</option>
                    <option value={4}>4 - Like</option>
                    <option value={5}>5 - Love</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeCuisinePreference(pref.cuisineId)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add New Preference */}
          <div className="mt-4">
            <select
              onChange={(e) => {
                const cuisineId = parseInt(e.target.value);
                if (cuisineId && !formData.cuisinePreferences.some(cp => cp.cuisineId === cuisineId)) {
                  handleCuisinePreferenceChange(cuisineId, 3);
                }
                e.target.value = '';
              }}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Add cuisine preference...</option>
              {cuisines
                .filter(cuisine => !formData.cuisinePreferences.some(cp => cp.cuisineId === cuisine.id))
                .map((cuisine) => (
                  <option key={cuisine.id} value={cuisine.id}>
                    {cuisine.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
}