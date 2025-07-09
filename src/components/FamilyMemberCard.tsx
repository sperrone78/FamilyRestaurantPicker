import { FamilyMember, Cuisine } from '../types';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
  isDeleting?: boolean;
  cuisines?: Cuisine[];
  dietaryRestrictions?: { id: string; name: string; }[];
}

export default function FamilyMemberCard({ member, onEdit, onDelete, isDeleting, cuisines = [], dietaryRestrictions = [] }: FamilyMemberCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPreferenceLabel = (level: number) => {
    switch (level) {
      case 1: return 'Don\'t like';
      case 2: return 'Dislike';
      case 3: return 'Neutral';
      case 4: return 'Like';
      case 5: return 'Love';
      default: return 'Unknown';
    }
  };

  const getPreferenceColor = (level: number) => {
    switch (level) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-red-500 bg-red-50';
      case 3: return 'text-gray-600 bg-gray-100';
      case 4: return 'text-green-600 bg-green-100';
      case 5: return 'text-green-700 bg-green-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6" data-testid="member-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
          {member.email && (
            <p className="text-gray-600 text-sm">{member.email}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Added {formatDate(member.createdAt)}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(member)}
            className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            data-testid="edit-member-btn"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(member.id)}
            disabled={isDeleting}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</h4>
        {member.dietaryRestrictions && member.dietaryRestrictions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {member.dietaryRestrictions.map((restriction, index) => {
              // Handle both string IDs and full objects
              const restrictionId = typeof restriction === 'string' ? restriction : restriction.id;
              const restrictionObj = dietaryRestrictions.find(dr => dr.id === restrictionId);
              const restrictionName = restrictionObj?.name || (typeof restriction === 'object' ? restriction.name : undefined) || 'Unknown Restriction';
              
              return (
                <span
                  key={restrictionId || `restriction-${index}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  data-testid={`restriction-${restrictionName.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {restrictionName}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No dietary restrictions</p>
        )}
      </div>

      {/* Cuisine Preferences */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Cuisine Preferences</h4>
        {member.cuisinePreferences && member.cuisinePreferences.length > 0 ? (
          <div className="space-y-2">
            {member.cuisinePreferences.map((preference) => {
              const cuisine = cuisines.find(c => c.id === String(preference.cuisineId));
              const cuisineName = cuisine?.name || preference.cuisineName || 'Unknown Cuisine';
              
              return (
                <div key={preference.cuisineId} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{cuisineName}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPreferenceColor(preference.preferenceLevel)}`}>
                    {preference.preferenceLevel}/5 - {getPreferenceLabel(preference.preferenceLevel)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No cuisine preferences set</p>
        )}
      </div>
    </div>
  );
}