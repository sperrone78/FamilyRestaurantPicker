import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FamilyMembersPage from './pages/FamilyMembersPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RecommendationsPage from './pages/RecommendationsPage';

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/family-members" element={<FamilyMembersPage />} />
            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;