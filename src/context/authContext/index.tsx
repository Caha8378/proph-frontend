import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as authService from '../../api/auth';

interface User {
  id: number;
  email: string;
  role: 'player' | 'coach' | 'supporter' | 'admin' | 'fan';
  verified: boolean;
  profileComplete: boolean;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend account_type to frontend role
const mapAccountTypeToRole = (accountType: string): 'player' | 'coach' | 'supporter' | 'admin' | 'fan' => {
  if (accountType === 'player' || accountType === 'coach' || accountType === 'admin' || accountType === 'fan') {
    return accountType as 'player' | 'coach' | 'supporter' | 'admin' | 'fan';
  }
  // Map 'fan' to 'supporter' for backward compatibility
  if (accountType === 'supporter') {
    return 'supporter';
  }
  return 'player'; // Default fallback
};

// Convert backend user to frontend User format
const convertBackendUser = (backendUser: authService.User): User => {
  return {
    id: backendUser.id,
    email: backendUser.email,
    role: mapAccountTypeToRole(backendUser.account_type),
    verified: false, // Will be determined from profile data
    profileComplete: false, // Will be determined from profile data
    emailVerified: backendUser.email_verified || false,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getAuthToken();
      const storedUser = authService.getCurrentUser();

      // Clean up old localStorage keys that might interfere
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');

      if (token && storedUser) {
        try {
          // Convert backend user format to frontend format
          const frontendUser = convertBackendUser(storedUser);
          setUser(frontendUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      // Backend user format is already stored by authService.login()
      // Just ensure consistency
      const backendUser = authService.getCurrentUser();
      if (backendUser) {
        localStorage.setItem('user', JSON.stringify(backendUser));
      }
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      // authService.login() already stores token and user in localStorage (normalized)
      // Get the normalized user from localStorage to ensure consistency
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        const frontendUser = convertBackendUser(storedUser);
        setUser(frontendUser);
      } else {
        // Fallback: convert from response if localStorage failed
        const frontendUser = convertBackendUser(authService.normalizeBackendUser(response.user));
        setUser(frontendUser);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, role: string) => {
    try {
      // Map frontend role to backend account_type
      const accountType = role === 'supporter' ? 'fan' : role;
      const response = await authService.signup(email, password, accountType);
      
      // If token and user are returned (verified accounts), update auth context
      if (response.token && response.user) {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          const frontendUser = convertBackendUser(storedUser);
          setUser(frontendUser);
        }
      }
      // Note: For unverified accounts (players/coaches), user will be set after email verification
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


