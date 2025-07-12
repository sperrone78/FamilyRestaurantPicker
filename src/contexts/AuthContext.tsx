import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { Family, UserProfile } from '../types/auth';

interface AuthContextType {
  user: User | null;
  currentFamily: Family | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // For now, create a default family for each user
        // In a real app, you'd fetch this from Firestore
        setCurrentFamily({
          id: user.uid,
          name: `${user.displayName || user.email}'s Family`,
          ownerId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Check admin status from custom claims
        let isAdminUser = false;
        try {
          const idTokenResult = await user.getIdTokenResult();
          isAdminUser = idTokenResult.claims.admin === true;
        } catch (error) {
          console.error('Error getting ID token result:', error);
          // Fallback to email check for backwards compatibility
          isAdminUser = user.email === 'sperrone78@gmail.com';
        }
        
        setUserProfile({
          id: user.uid,
          email: user.email || '',
          isAdmin: isAdminUser,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        setCurrentFamily(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUserClaims = async () => {
    if (user) {
      try {
        // Force refresh the ID token to get updated claims
        const idTokenResult = await user.getIdTokenResult(true);
        const isAdminUser = idTokenResult.claims.admin === true;
        
        setUserProfile(prev => prev ? {
          ...prev,
          isAdmin: isAdminUser,
          updatedAt: new Date()
        } : null);
      } catch (error) {
        console.error('Error refreshing user claims:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    currentFamily,
    userProfile,
    isAdmin: userProfile?.isAdmin ?? false,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    refreshUserClaims
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};