import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data factories
export const mockFamilyMember = {
  id: '1',
  familyId: 'family-1',
  name: 'John Doe',
  email: 'john@example.com',
  dietaryRestrictions: [
    { id: '1', name: 'Gluten Free', description: 'Cannot consume gluten' }
  ],
  cuisinePreferences: [
    { cuisineId: '2', cuisineName: 'Italian', preferenceLevel: 5 }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const mockCuisine = {
  id: '2',
  name: 'Italian',
  description: 'Italian cuisine including pizza and pasta'
};

export const mockDietaryRestriction = {
  id: '1',
  name: 'Gluten Free',
  description: 'Cannot consume gluten-containing foods'
};

export const mockRestaurant = {
  id: '1',
  familyId: 'family-1',
  name: 'Pizza Palace',
  address: '123 Main St',
  phone: '555-0123',
  cuisine: mockCuisine,
  priceRange: 2,
  rating: 4.5,
  website: 'https://pizzapalace.com',
  notes: 'Great gluten-free options',
  dietaryAccommodations: [mockDietaryRestriction],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const mockUser = {
  uid: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User'
};