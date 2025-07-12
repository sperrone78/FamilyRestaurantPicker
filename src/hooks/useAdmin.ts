import { useAuth } from '../contexts/AuthContext';

export const useAdmin = () => {
  const { isAdmin, userProfile, loading } = useAuth();
  
  return {
    isAdmin,
    userProfile,
    loading,
    canManageRestaurants: isAdmin
  };
};