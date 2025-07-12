import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { referenceDataService } from '../services/firestore';
import { Restaurant } from '../types';

interface RestaurantFormProps {
  restaurant?: Restaurant;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function RestaurantForm({ restaurant, onSubmit, onCancel, isLoading }: RestaurantFormProps) {
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    address: restaurant?.address || '',
    phone: restaurant?.phone || '',
    cuisines: restaurant?.cuisines?.map(c => c.id) || [],
    priceRange: restaurant?.priceRange || undefined,
    rating: restaurant?.rating || undefined,
    website: restaurant?.website || '',
    notes: restaurant?.notes || '',
    dietaryAccommodations: restaurant?.dietaryAccommodations?.map(acc => ({
      dietaryRestrictionId: acc.id,
      notes: acc.notes || ''
    })) || []
  });

  useEffect(() => {
    setFormData({
      name: restaurant?.name || '',
      address: restaurant?.address || '',
      phone: restaurant?.phone || '',
      cuisines: restaurant?.cuisines?.map(c => c.id) || [],
      priceRange: restaurant?.priceRange || undefined,
      rating: restaurant?.rating || undefined,
      website: restaurant?.website || '',
      notes: restaurant?.notes || '',
      dietaryAccommodations: restaurant?.dietaryAccommodations?.map(acc => ({
        dietaryRestrictionId: acc.id,
        notes: acc.notes || ''
      })) || []
    });
  }, [restaurant]);

  const { data: cuisines = [] } = useQuery('cuisines', referenceDataService.getCuisines);
  const { data: dietaryRestrictions = [] } = useQuery('dietaryRestrictions', referenceDataService.getDietaryRestrictions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      name: formData.name,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      cuisines: formData.cuisines.length > 0 ? formData.cuisines : undefined,
      priceRange: formData.priceRange,
      rating: formData.rating,
      website: formData.website || undefined,
      notes: formData.notes || undefined,
      dietaryAccommodations: formData.dietaryAccommodations.filter(acc => acc.dietaryRestrictionId)
    };
    onSubmit(submitData);
  };

  const handleCuisineToggle = (cuisineId: string) => {
    setFormData(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisineId)
        ? prev.cuisines.filter(id => id !== cuisineId)
        : [...prev.cuisines, cuisineId]
    }));
  };

  const handleDietaryAccommodationToggle = (restrictionId: string) => {
    setFormData(prev => {
      const exists = prev.dietaryAccommodations.find(acc => acc.dietaryRestrictionId === restrictionId);
      if (exists) {
        return {
          ...prev,
          dietaryAccommodations: prev.dietaryAccommodations.filter(acc => acc.dietaryRestrictionId !== restrictionId)
        };
      } else {
        return {
          ...prev,
          dietaryAccommodations: [...prev.dietaryAccommodations, { dietaryRestrictionId: restrictionId, notes: '' }]
        };
      }
    });
  };

  const updateAccommodationNotes = (restrictionId: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryAccommodations: prev.dietaryAccommodations.map(acc =>
        acc.dietaryRestrictionId === restrictionId ? { ...acc, notes } : acc
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Rating and Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  id="rating"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range (1-4)
                </label>
                <select
                  id="priceRange"
                  value={formData.priceRange || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select price range</option>
                  <option value="1">$ - Budget</option>
                  <option value="2">$$ - Moderate</option>
                  <option value="3">$$$ - Expensive</option>
                  <option value="4">$$$$ - Very Expensive</option>
                </select>
              </div>
            </div>

            {/* Cuisines */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisines
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {cuisines.map((cuisine) => (
                  <label key={cuisine.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cuisines.includes(cuisine.id)}
                      onChange={() => handleCuisineToggle(cuisine.id)}
                      className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{cuisine.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary Accommodations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Accommodations
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {dietaryRestrictions.map((restriction) => {
                  const accommodation = formData.dietaryAccommodations.find(acc => acc.dietaryRestrictionId === restriction.id);
                  const isSelected = !!accommodation;
                  
                  return (
                    <div key={restriction.id}>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDietaryAccommodationToggle(restriction.id)}
                          className="mr-2 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{restriction.name}</span>
                      </label>
                      {isSelected && (
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={accommodation?.notes || ''}
                          onChange={(e) => updateAccommodationNotes(restriction.id, e.target.value)}
                          className="mt-1 ml-6 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : (restaurant ? 'Update Restaurant' : 'Add Restaurant')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}