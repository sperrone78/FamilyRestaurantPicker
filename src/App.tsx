import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FamilyMembersPage from './pages/FamilyMembersPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RecommendationsPage from './pages/RecommendationsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/family-members" element={<FamilyMembersPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;