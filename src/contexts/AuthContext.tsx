import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, loginUser, registerUser, logoutUser } from '../lib/firebase';
import { LoadingScreen } from '../components/LoadingScreen';
import { isAdminEmail } from '../config/adminConfig';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAdmin(isAdminEmail(user?.email));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const user = await loginUser(email, password);
    setIsAdmin(isAdminEmail(user.email));
    return user;
  };

  const register = async (email: string, password: string) => {
    const user = await registerUser(email, password);
    setIsAdmin(isAdminEmail(user.email));
    return user;
  };

  const logout = async () => {
    await logoutUser();
    setIsAdmin(false);
  };

  const value = {
    currentUser,
    isLoading,
    isAdmin,
    login,
    register,
    logout
  };

  if (isLoading) {
    return <LoadingScreen message="Loading authentication status..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
