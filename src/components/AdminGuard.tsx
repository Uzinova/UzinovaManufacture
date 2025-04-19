import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { currentUser, isAdmin } = useAuth();

  // If not authenticated at all, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not an admin, redirect to the home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and admin, render the children
  return <>{children}</>;
};
