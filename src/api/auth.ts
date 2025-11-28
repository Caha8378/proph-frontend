import apiClient from './client';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    account_type?: string; // Backend might send this
    accountType?: string;  // Or this (camelCase)
    account_status?: string; // 'active' | 'inactive' | null
    accountStatus?: string;  // Or this (camelCase)
    email_verified?: boolean;
    emailVerified?: boolean;
    gender?: string; // For players: 'Male' or 'Female'
    gender_coached?: string; // For coaches: 'male' or 'female'
    genderCoached?: string; // Alternative camelCase
  };
}

export interface RegisterResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    account_type?: string;
    accountType?: string;
    account_status?: string; // 'active' | 'inactive' | null
    accountStatus?: string;  // Or this (camelCase)
    emailVerified?: boolean;
    gender?: string; // For players: 'Male' or 'Female'
    gender_coached?: string; // For coaches: 'male' or 'female'
    genderCoached?: string; // Alternative camelCase
  };
  nextStep?: string;
  requiresVerification?: boolean;
}

export interface User {
  id: number;
  email: string;
  account_type: string;
  account_status: string | null; // 'active' | 'inactive' | null
  email_verified: boolean;
  gender?: string; // For players: 'Male' or 'Female'
  gender_coached?: string; // For coaches: 'male' or 'female'
}

// Helper to normalize user object from backend (handles both camelCase and snake_case)
export const normalizeBackendUser = (user: any): User => {
  const accountType = user.account_type || user.accountType || 'player';
  
  // Convert email_verified from 1/0 (number) to boolean
  const emailVerified = user.email_verified !== undefined 
    ? (user.email_verified === 1 || user.email_verified === true)
    : (user.emailVerified !== undefined 
        ? (user.emailVerified === 1 || user.emailVerified === true)
        : false);
  
  // Handle gender fields:
  // - For players: backend sends 'gender'
  // - For coaches: backend sends 'gender' (which is actually gender_coached), map to gender_coached
  let gender: string | undefined = undefined;
  let gender_coached: string | undefined = undefined;
  
  if (accountType === 'coach') {
    // For coaches, backend sends gender_coached as 'gender', map it to gender_coached
    gender_coached = user.gender || user.gender_coached || user.genderCoached || undefined;
  } else {
    // For players, use gender field
    gender = user.gender || undefined;
  }
  
  return {
    id: user.id,
    email: user.email,
    account_type: accountType,
    account_status: user.account_status || user.accountStatus || null, // 'active' | 'inactive' | null
    email_verified: emailVerified,
    gender: gender,
    gender_coached: gender_coached,
  };
};

/**
 * Login user with email and password
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Store token and user in localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      
      // Normalize user object using the shared normalization function
      const normalizedUser = normalizeBackendUser(response.data.user);
      
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // Clean up old localStorage keys that might interfere
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Register new user
 */
export const signup = async (
  email: string,
  password: string,
  accountType: string
): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
      accountType: accountType, // Backend expects camelCase, not snake_case
    });

    const data = response.data;

    // Store token and user if provided (for verified accounts like fans)
    if (data.token && data.user) {
      localStorage.setItem('authToken', data.token);
      
      // Normalize user object using the shared normalization function
      const normalizedUser = normalizeBackendUser(data.user);
      
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Logout user - clear all localStorage values
 */
export const logout = (): void => {
  // Auth-related items
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // User info (old format)
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('pendingEmail');
  
  // Profile completion flags
  localStorage.removeItem('coachVerified');
  localStorage.removeItem('coachProfileComplete');
  localStorage.removeItem('emailVerified');
  
  // Conversation data
  localStorage.removeItem('conversations');
  
  // Profile data
  localStorage.removeItem('profilePhoto');
  
  // UI state
  localStorage.removeItem('verificationBannerDismissed');
};

/**
 * Verify email with token from email link
 * Backend returns updated user object with account_status
 */
export const verifyEmail = async (token: string): Promise<{ user?: any }> => {
  try {
    const response = await apiClient.get<{ user?: any }>(`/auth/verify-email/${token}`);
    
    // Update user in localStorage if backend returns updated user object
    if (response.data.user) {
      const normalizedUser = normalizeBackendUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Email verification failed');
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/resend-verification');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to resend verification email');
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const parsed = JSON.parse(userStr);
    // Normalize in case old format is stored
    return normalizeBackendUser(parsed);
  } catch {
    return null;
  }
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await apiClient.post<any>(
      '/auth/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Backend might return different formats - check for success flag if it exists
    // If no success flag, assume success if we got a 200 response
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || 'Failed to upload image');
    }
    
    // If we get here, the upload was successful (200 status)
    return;
  } catch (error: any) {
    // If it's a 200 response but we're in catch, it might be a parsing issue
    // Check if the status is 200 - if so, the upload likely succeeded
    if (error.response?.status === 200) {
      return; // Upload succeeded despite error parsing
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload profile image');
  }
};

