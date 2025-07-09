import { render, screen } from '../utils/testUtils';
import SummaryPanel from '../../components/SummaryPanel';
import { mockFamilyMember, mockCuisine } from '../utils/testUtils';

describe('SummaryPanel', () => {
  const mockCuisines = [
    mockCuisine,
    { id: '3', name: 'Mexican', description: 'Mexican cuisine' }
  ];

  test('shows prompt when no members selected', () => {
    render(
      <SummaryPanel
        selectedMembers={[]}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('Select family members to get restaurant recommendations')).toBeInTheDocument();
  });

  test('displays selected members correctly', () => {
    const selectedMembers = [mockFamilyMember];

    render(
      <SummaryPanel
        selectedMembers={selectedMembers}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('Selected Members (1)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1 restriction')).toBeInTheDocument();
  });

  test('displays dietary restrictions correctly', () => {
    const selectedMembers = [mockFamilyMember];

    render(
      <SummaryPanel
        selectedMembers={selectedMembers}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('Combined Dietary Restrictions')).toBeInTheDocument();
    expect(screen.getByText('Gluten Free')).toBeInTheDocument();
  });

  test('displays cuisine preferences with correct names', () => {
    const selectedMembers = [mockFamilyMember];

    render(
      <SummaryPanel
        selectedMembers={selectedMembers}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('Top Cuisine Preferences')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  test('handles cuisine preferences with numeric IDs', () => {
    const memberWithNumericCuisineId = {
      ...mockFamilyMember,
      cuisinePreferences: [
        { cuisineId: 2 as any, cuisineName: '', preferenceLevel: 4 }
      ]
    };

    render(
      <SummaryPanel
        selectedMembers={[memberWithNumericCuisineId]}
        cuisines={mockCuisines}
      />
    );

    // Should find cuisine by converting numeric ID to string
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  test('handles missing cuisine names gracefully', () => {
    const memberWithUnknownCuisine = {
      ...mockFamilyMember,
      cuisinePreferences: [
        { cuisineId: 'unknown-id', cuisineName: '', preferenceLevel: 3 }
      ]
    };

    render(
      <SummaryPanel
        selectedMembers={[memberWithUnknownCuisine]}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('Unknown Cuisine')).toBeInTheDocument();
  });

  test('displays results count when provided', () => {
    render(
      <SummaryPanel
        selectedMembers={[mockFamilyMember]}
        cuisines={mockCuisines}
        resultsCount={5}
      />
    );

    expect(screen.getByText('5 restaurants found')).toBeInTheDocument();
  });

  test('handles singular result count', () => {
    render(
      <SummaryPanel
        selectedMembers={[mockFamilyMember]}
        cuisines={mockCuisines}
        resultsCount={1}
      />
    );

    expect(screen.getByText('1 restaurant found')).toBeInTheDocument();
  });

  test('calculates multiple member preferences correctly', () => {
    const member2 = {
      ...mockFamilyMember,
      id: '2',
      name: 'Jane Doe',
      cuisinePreferences: [
        { cuisineId: '2', cuisineName: 'Italian', preferenceLevel: 3 }
      ]
    };

    render(
      <SummaryPanel
        selectedMembers={[mockFamilyMember, member2]}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('Selected Members (2)')).toBeInTheDocument();
    // Average of 5 and 3 should be 4.0
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  test('shows no dietary restrictions message when none exist', () => {
    const memberWithoutRestrictions = {
      ...mockFamilyMember,
      dietaryRestrictions: []
    };

    render(
      <SummaryPanel
        selectedMembers={[memberWithoutRestrictions]}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('No dietary restrictions')).toBeInTheDocument();
  });

  test('shows no cuisine preferences message when none exist', () => {
    const memberWithoutPreferences = {
      ...mockFamilyMember,
      cuisinePreferences: []
    };

    render(
      <SummaryPanel
        selectedMembers={[memberWithoutPreferences]}
        cuisines={mockCuisines}
      />
    );

    expect(screen.getByText('No cuisine preferences set')).toBeInTheDocument();
  });
});