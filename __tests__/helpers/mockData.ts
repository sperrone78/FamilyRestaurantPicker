export const mockFamilyMembers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    dietaryRestrictions: [{ id: 1, name: 'Gluten Free' }],
    cuisinePreferences: [{ cuisineId: 1, cuisineName: 'Italian', preferenceLevel: 5 }],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@example.com',
    dietaryRestrictions: [{ id: 2, name: 'Vegetarian' }],
    cuisinePreferences: [{ cuisineId: 2, cuisineName: 'Mexican', preferenceLevel: 4 }],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockRestaurants = [
  {
    id: 1,
    name: 'Pizza Palace',
    address: '123 Main St',
    phone: '555-0123',
    cuisine: { id: 1, name: 'Italian' },
    priceRange: 2,
    rating: 4.5,
    website: 'https://pizzapalace.com',
    notes: 'Great gluten-free options',
    dietaryAccommodations: [{ id: 1, name: 'Gluten Free', notes: 'Gluten-free pizza available' }],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Veggie Delight',
    address: '456 Oak Ave',
    phone: '555-0456',
    cuisine: { id: 2, name: 'Mexican' },
    priceRange: 2,
    rating: 4.0,
    website: 'https://veggiedelight.com',
    notes: 'All vegetarian menu',
    dietaryAccommodations: [{ id: 2, name: 'Vegetarian', notes: 'Completely vegetarian' }],
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockDietaryRestrictions = [
  { id: 1, name: 'Gluten Free', description: 'Cannot consume gluten-containing foods' },
  { id: 2, name: 'Vegetarian', description: 'Does not eat meat' },
  { id: 3, name: 'Vegan', description: 'Does not eat any animal products' },
  { id: 4, name: 'Dairy Free', description: 'Cannot consume dairy products' },
];

export const mockCuisines = [
  { id: 1, name: 'Italian', description: 'Italian cuisine including pizza and pasta' },
  { id: 2, name: 'Mexican', description: 'Mexican and Tex-Mex cuisine' },
  { id: 3, name: 'American', description: 'Traditional American cuisine' },
  { id: 4, name: 'Chinese', description: 'Chinese cuisine' },
];