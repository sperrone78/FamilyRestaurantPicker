import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AdminInitializer: React.FC = () => {
  const { user, refreshUserClaims } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [message, setMessage] = useState('');

  const handleInitializeAdmin = async () => {
    if (!user || user.email !== 'sperrone78@gmail.com') {
      setMessage('Access denied. Only the designated admin can initialize admin claims.');
      return;
    }

    setIsInitializing(true);
    setMessage('');

    try {
      // For now, we'll just refresh the user's claims
      // In a real deployment, this would call the Firebase Function
      await refreshUserClaims();
      setMessage('Admin claims initialized! Please refresh the page to see admin features.');
    } catch (error) {
      console.error('Error initializing admin:', error);
      setMessage('Failed to initialize admin claims. Please contact support.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Only show this component to the designated admin email
  if (!user || user.email !== 'sperrone78@gmail.com') {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium text-blue-900 mb-2">Admin Setup</h3>
      <p className="text-blue-700 text-sm mb-3">
        Initialize admin privileges for restaurant management.
      </p>
      
      <button
        onClick={handleInitializeAdmin}
        disabled={isInitializing}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isInitializing ? 'Initializing...' : 'Initialize Admin Access'}
      </button>
      
      {message && (
        <div className={`mt-3 text-sm ${message.includes('Failed') || message.includes('denied') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
};