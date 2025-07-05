import { FamilyMember, RecommendationSummary } from '../types';

interface SummaryPanelProps {
  selectedMembers: FamilyMember[];
  summary?: RecommendationSummary;
  resultsCount?: number;
}

export default function SummaryPanel({ selectedMembers, summary, resultsCount }: SummaryPanelProps) {
  if (selectedMembers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-blue-800">Select family members to get restaurant recommendations</p>
        </div>
      </div>
    );
  }

  const allDietaryRestrictions = selectedMembers
    .flatMap(member => member.dietaryRestrictions || [])
    .filter((restriction, index, self) => 
      self.findIndex(r => r.id === restriction.id) === index
    );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Selection Summary</h3>
        {resultsCount !== undefined && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {resultsCount} restaurant{resultsCount !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selected Members */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Selected Members ({selectedMembers.length})
          </h4>
          <div className="space-y-2">
            {selectedMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-900">{member.name}</span>
                {member.dietaryRestrictions && member.dietaryRestrictions.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {member.dietaryRestrictions.length} restriction{member.dietaryRestrictions.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Combined Dietary Restrictions
          </h4>
          {allDietaryRestrictions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {allDietaryRestrictions.map((restriction) => (
                <span
                  key={restriction.id}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"
                >
                  {restriction.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No dietary restrictions</p>
          )}
        </div>
      </div>

      {/* Always show restriction summary when members are selected */}
      {selectedMembers.length > 0 && (() => {
        // Calculate restriction counts locally for accuracy
        const restrictionCounts = new Map<number, { name: string; count: number }>();
        selectedMembers.forEach(member => {
          member.dietaryRestrictions?.forEach(restriction => {
            const existing = restrictionCounts.get(restriction.id);
            if (existing) {
              existing.count++;
            } else {
              restrictionCounts.set(restriction.id, {
                name: restriction.name,
                count: 1
              });
            }
          });
        });

        const restrictionArray = Array.from(restrictionCounts.values())
          .sort((a, b) => b.count - a.count);

        return (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dietary Restrictions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Dietary Restrictions Summary
                </h4>
                {restrictionArray.length > 0 ? (
                  <div className="space-y-2">
                    {restrictionArray.map((restriction) => (
                      <div key={restriction.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{restriction.name}</span>
                        <span className="text-xs text-gray-500">
                          {restriction.count} member{restriction.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No dietary restrictions</p>
                )}
              </div>

              {/* Cuisine Preferences */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Top Cuisine Preferences
                </h4>
                {(() => {
                  // Calculate cuisine preferences locally
                  const cuisinePreferenceMap = new Map<number, { name: string; total: number; count: number }>();
                  
                  selectedMembers.forEach(member => {
                    member.cuisinePreferences?.forEach(pref => {
                      const existing = cuisinePreferenceMap.get(pref.cuisineId);
                      if (existing) {
                        existing.total += pref.preferenceLevel;
                        existing.count++;
                      } else {
                        cuisinePreferenceMap.set(pref.cuisineId, {
                          name: pref.cuisineName,
                          total: pref.preferenceLevel,
                          count: 1
                        });
                      }
                    });
                  });

                  const cuisineArray = Array.from(cuisinePreferenceMap.values())
                    .map(cuisine => ({
                      name: cuisine.name,
                      average: cuisine.total / cuisine.count
                    }))
                    .sort((a, b) => b.average - a.average)
                    .slice(0, 3);

                  return cuisineArray.length > 0 ? (
                    <div className="space-y-2">
                      {cuisineArray.map((cuisine) => (
                        <div key={cuisine.name} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900">{cuisine.name}</span>
                          <div className="flex items-center space-x-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < cuisine.average
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {cuisine.average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No cuisine preferences set</p>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}