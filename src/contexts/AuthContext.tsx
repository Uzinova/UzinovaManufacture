import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, loginUser, registerUser, logoutUser } from '../lib/firebase';
import { isAdminEmail } from '../config/adminConfig';
import { SplashScreen } from '../components/SplashScreen';

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
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setIsAdmin(isAdminEmail(user.email));
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    // Show splash screen for at least 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
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

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
