import { FamilyMember } from '../types';

interface MemberSelectionCardProps {
  member: FamilyMember;
  isSelected: boolean;
  onToggle: (memberId: number) => void;
}

export default function MemberSelectionCard({ member, isSelected, onToggle }: MemberSelectionCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger if the click came from the checkbox itself
    if ((e.target as HTMLElement).type === 'checkbox') {
      return;
    }
    onToggle(member.id);
  };

  return (
    <div 
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(member.id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div>
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            {member.email && (
              <p className="text-sm text-gray-500">{member.email}</p>
            )}
          </div>
        </div>
      </div>
      
      {member.dietaryRestrictions && member.dietaryRestrictions.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Dietary Restrictions:</p>
          <div className="flex flex-wrap gap-1">
            {member.dietaryRestrictions.map((restriction) => (
              <span
                key={restriction.id}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"
              >
                {restriction.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {member.cuisinePreferences && member.cuisinePreferences.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Cuisine Preferences:</p>
          <div className="flex flex-wrap gap-1">
            {member.cuisinePreferences
              .filter(pref => pref.preferenceLevel >= 4)
              .map((pref) => (
                <span
                  key={pref.cuisineId}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"
                >
                  {pref.cuisineName} ({pref.preferenceLevel}/5)
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}