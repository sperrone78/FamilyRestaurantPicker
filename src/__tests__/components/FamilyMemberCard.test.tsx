import { render, screen, fireEvent } from '../utils/testUtils';
import FamilyMemberCard from '../../components/FamilyMemberCard';
import { mockFamilyMember } from '../utils/testUtils';

describe('FamilyMemberCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders family member information correctly', () => {
    render(
      <FamilyMemberCard
        member={mockFamilyMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Gluten Free')).toBeInTheDocument();
  });

  test('handles undefined dietary restriction names gracefully', () => {
    const memberWithUndefinedRestriction = {
      ...mockFamilyMember,
      dietaryRestrictions: [
        { id: '1', name: undefined as any, description: 'Test restriction' }
      ]
    };

    render(
      <FamilyMemberCard
        member={memberWithUndefinedRestriction}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText('Unknown Restriction')).toBeInTheDocument();
  });

  test('displays cuisine preferences correctly', () => {
    render(
      <FamilyMemberCard
        member={mockFamilyMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText('Italian')).toBeInTheDocument();
    // Should show 5 stars for preference level 5
    const stars = screen.getAllByTestId(/star-/);
    expect(stars).toHaveLength(5);
  });

  test('handles member without dietary restrictions', () => {
    const memberWithoutRestrictions = {
      ...mockFamilyMember,
      dietaryRestrictions: []
    };

    render(
      <FamilyMemberCard
        member={memberWithoutRestrictions}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText('No dietary restrictions')).toBeInTheDocument();
  });

  test('handles member without cuisine preferences', () => {
    const memberWithoutPreferences = {
      ...mockFamilyMember,
      cuisinePreferences: []
    };

    render(
      <FamilyMemberCard
        member={memberWithoutPreferences}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText('No cuisine preferences set')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <FamilyMemberCard
        member={mockFamilyMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockFamilyMember);
  });

  test('calls onDelete when delete button is clicked', () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);
    
    render(
      <FamilyMemberCard
        member={mockFamilyMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockFamilyMember.id);
  });

  test('does not call onDelete when user cancels confirmation', () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn(() => false);
    
    render(
      <FamilyMemberCard
        member={mockFamilyMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  test('shows loading state when deleting', () => {
    render(
      <FamilyMemberCard
        member={mockFamilyMember}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={true}
      />
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  test('handles member without email', () => {
    const memberWithoutEmail = {
      ...mockFamilyMember,
      email: undefined
    };

    render(
      <FamilyMemberCard
        member={memberWithoutEmail}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });
});