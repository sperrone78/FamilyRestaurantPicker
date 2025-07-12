import React from 'react';
import { useAdmin } from '../hooks/useAdmin';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};