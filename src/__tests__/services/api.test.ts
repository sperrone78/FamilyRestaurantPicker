import { familyMembersApi, restaurantsApi } from '../../services/api';
import { familyMembersService, restaurantsService } from '../../services/firestore';

// Mock the firestore service
jest.mock('../../services/firestore', () => ({
  familyMembersService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  restaurantsService: {
    getAll: jest.fn()
  }
}));

describe('familyMembersApi', () => {
  const mockUserId = 'user-123';
  const mockFamilyMember = {
    id: '1',
    familyId: 'family-1',
    name: 'John Doe',
    email: 'john@example.com',
    dietaryRestrictions: [],
    cuisinePreferences: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAll calls firestore service with userId as familyId', async () => {
    (familyMembersService.getAll as jest.Mock).mockResolvedValue([mockFamilyMember]);

    const result = await familyMembersApi.getAll(mockUserId);

    expect(familyMembersService.getAll).toHaveBeenCalledWith(mockUserId);
    expect(result).toEqual([mockFamilyMember]);
  });

  test('create calls firestore service with userId as familyId', async () => {
    const createData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      dietaryRestrictions: ['1'],
      cuisinePreferences: [{ cuisineId: '2', preferenceLevel: 4 }]
    };

    (familyMembersService.create as jest.Mock).mockResolvedValue(mockFamilyMember);

    const result = await familyMembersApi.create(mockUserId, createData);

    expect(familyMembersService.create).toHaveBeenCalledWith({
      ...createData,
      familyId: mockUserId
    });
    expect(result).toEqual(mockFamilyMember);
  });

  test('update calls firestore service correctly', async () => {
    const updateData = {
      name: 'John Smith',
      email: 'johnsmith@example.com'
    };

    (familyMembersService.update as jest.Mock).mockResolvedValue(mockFamilyMember);

    const result = await familyMembersApi.update('1', updateData);

    expect(familyMembersService.update).toHaveBeenCalledWith('1', updateData);
    expect(result).toEqual(mockFamilyMember);
  });

  test('delete calls firestore service correctly', async () => {
    (familyMembersService.delete as jest.Mock).mockResolvedValue(undefined);

    await familyMembersApi.delete('1');

    expect(familyMembersService.delete).toHaveBeenCalledWith('1');
  });

  test('handles errors from firestore service', async () => {
    const error = new Error('Firestore error');
    (familyMembersService.getAll as jest.Mock).mockRejectedValue(error);

    await expect(familyMembersApi.getAll(mockUserId)).rejects.toThrow('Firestore error');
  });
});

describe('restaurantsApi', () => {
  const mockRestaurant = {
    id: '1',
    familyId: 'family-1',
    name: 'Pizza Palace',
    address: '123 Main St',
    cuisine: { id: '2', name: 'Italian' },
    priceRange: 2,
    rating: 4.5,
    createdAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getAll calls firestore service', async () => {
    (restaurantsService.getAll as jest.Mock).mockResolvedValue([mockRestaurant]);

    const result = await restaurantsApi.getAll();

    expect(restaurantsService.getAll).toHaveBeenCalledWith();
    expect(result).toEqual([mockRestaurant]);
  });

  test('getAll does not use filters (handled by Firestore service)', async () => {
    (restaurantsService.getAll as jest.Mock).mockResolvedValue([mockRestaurant]);

    const result = await restaurantsApi.getAll();

    expect(restaurantsService.getAll).toHaveBeenCalledWith();
    expect(result).toEqual([mockRestaurant]);
  });

  test('handles empty response gracefully', async () => {
    (restaurantsService.getAll as jest.Mock).mockResolvedValue([]);

    const result = await restaurantsApi.getAll();

    expect(restaurantsService.getAll).toHaveBeenCalledWith();
    expect(result).toEqual([]);
  });
});