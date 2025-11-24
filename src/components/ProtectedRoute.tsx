import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('player' | 'coach' | 'supporter' | 'admin' | 'fan')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo,
}) => {
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // If AuthProvider is not available (e.g., during hot reload), show loading
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center">
        <p className="text-proph-grey-text">Loading...</p>
      </div>
    );
  }

  const { user, loading } = authContext;

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center">
        <p className="text-proph-grey-text">Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to landing page
  if (!user) {
    return <Navigate to={redirectTo || '/'} replace />;
  }

  // Check account_status and redirect to onboarding if inactive
  // Skip this check if already on an onboarding page to prevent redirect loops
  const currentPath = window.location.pathname;
  const isOnboardingPage = currentPath.includes('/onboarding/');
  
  if (!isOnboardingPage && user.accountStatus === 'inactive') {
    if (user.role === 'coach') {
      return <Navigate to="/onboarding/coach" replace />;
    } else if (user.role === 'player') {
      return <Navigate to="/onboarding/player" replace />;
    }
    // For other roles (supporter/fan), account_status should be 'active' so no redirect needed
  }

  // If role-based access control is specified
  if (allowedRoles && allowedRoles.length > 0) {
    // Check if user's role is allowed
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate home page based on role
      if (user.role === 'player') {
        return <Navigate to="/player/home" replace />;
      } else if (user.role === 'coach') {
        return <Navigate to="/coach/home" replace />;
      } else if (user.role === 'supporter' || user.role === 'fan') {
        return <Navigate to="/supporter/home" replace />;
      }
      // Default redirect
      return <Navigate to={redirectTo || '/'} replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

