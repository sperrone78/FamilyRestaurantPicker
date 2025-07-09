import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';

// Mock Firebase
jest.mock('./firebase/config', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
  },
  db: {}
}));

// Mock React Query
jest.mock('react-query', () => ({
  useQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn()
  })),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));