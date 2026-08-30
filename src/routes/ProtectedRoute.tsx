import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userProfile.isBlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl">
          <ShieldAlert className="w-16 h-16 text-rose-600 dark:text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-rose-950 dark:text-rose-200 mb-2">
            Account Restricted
          </h2>
          <p className="text-sm text-rose-800 dark:text-rose-300">
            Your account profile has been suspended by an administrator due to moderation rules. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
