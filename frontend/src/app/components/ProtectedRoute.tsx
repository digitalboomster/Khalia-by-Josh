/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * Redirects to login if user is not authenticated
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredKycLevel?: number;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredKycLevel = 0 }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredKycLevel && user && user.kyc_level < requiredKycLevel) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
