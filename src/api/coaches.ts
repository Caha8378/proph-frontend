import apiClient from './client';

export interface CoachProfile {
  id: number;
  user_id: number;
  school_id?: number;
  name: string;
  position_title?: string;
  bio?: string;
  profile_image_url?: string;
  is_verified?: boolean | number; // DB uses tinyint(1), may be 0/1 or boolean
  email?: string;
  phone_number?: string;
  gender_coached?: 'male' | 'female';
  [key: string]: any; // Allow additional fields
}

/**
 * Get current coach's profile (authenticated)
 */
export const getCoachProfile = async (coachId?: string): Promise<CoachProfile> => {
  try {
    const endpoint = coachId ? `/coaches/${coachId}` : '/coaches/me/profile';
    const response = await apiClient.get<{ profile: CoachProfile } | CoachProfile>(endpoint);
    
    // Backend may return { profile: {...} } or just the profile directly
    const profile = 'profile' in response.data ? response.data.profile : response.data;
    return profile;
  } catch (error: any) {
    // Preserve 404 status for useProfile hook to detect missing profile
    if (error.response?.status === 404 || error.message?.includes('coach profile not found') || error.message?.includes('404')) {
      const notFoundError: any = new Error(error.response?.data?.message || 'Coach profile not found');
      notFoundError.response = { status: 404, data: error.response?.data };
      throw notFoundError;
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch coach profile');
  }
};

/**
 * Update coach profile
 */
export const updateCoachProfile = async (
  _coachId: number,
  data: Partial<CoachProfile>
): Promise<CoachProfile> => {
  try {
    // Backend uses PUT /coaches/me/profile (no coachId in path)
    const response = await apiClient.put<CoachProfile>('/coaches/me/profile', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update coach profile');
  }
};

/**
 * Team member interface
 */
export interface TeamMember {
  user_id: number;
  name: string;
  position: string;
  profile_image_url?: string;
  is_me: boolean;
}

/**
 * Get my team (all coaches from the same school)
 * Backend endpoint: GET /api/coaches/me/team
 */
export interface MyTeamResponse {
  coaches: TeamMember[];
}

export const getMyTeam = async (): Promise<TeamMember[]> => {
  try {
    const response = await apiClient.get<MyTeamResponse>('/coaches/me/team');
    return response.data.coaches || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch team');
  }
};

/**
 * Register coach profile (after onboarding)
 * Backend endpoint: POST /auth/register/coach
 * 
 * Backend expects:
 * - userId (or user_id) - from authenticated user or request body
 * - school_id (number) - if school selected from dropdown
 * - position_title (string) - role or custom role
 * - gender_coached ('male' | 'female') - mapped from 'mens'/'womens'
 * - name (optional) - user's name if available
 * - phone_number (optional) - not collected in onboarding yet
 */
export interface RegisterCoachData {
  userId?: number; // User ID (from localStorage or token)
  school_id?: number | null; // If school was selected from dropdown (has id)
  position_title: string; // role or customRole
  gender_coached: 'male' | 'female'; // 'mens' -> 'male', 'womens' -> 'female'
  name?: string; // User's name if available
  phone_number?: string | null; // Optional, not collected in onboarding
}

export interface RegisterCoachResponse {
  profile: CoachProfile;
  user?: {
    id: number;
    email: string;
    account_type?: string;
    accountType?: string;
    account_status?: string;
    accountStatus?: string;
    email_verified?: boolean;
    emailVerified?: boolean;
  };
}

export const registerCoach = async (data: RegisterCoachData): Promise<RegisterCoachResponse> => {
  try {
    // Backend expects fields at top level (not nested in profile object)
    // Backend will get userId from body or from authenticated token
    const response = await apiClient.post<{ 
      message: string;
      profile: {
        id: number;
        userId: number;
        profileImageUrl?: string;
      };
      user?: {
        id: number;
        email: string;
        account_type?: string;
        accountType?: string;
        account_status?: string;
        accountStatus?: string;
        email_verified?: boolean;
        emailVerified?: boolean;
      };
    }>(
      '/auth/register/coach',
      {
        userId: data.userId,
        school_id: data.school_id,
        position_title: data.position_title,
        gender_coached: data.gender_coached,
        name: data.name,
        phone_number: data.phone_number,
      }
    );
    
    // Backend returns { message, profile: { id, userId, profileImageUrl }, user: { id, account_status } }
    // We need to fetch the full profile after registration
    if (response.data.profile) {
      // Fetch the full profile to get all fields
      const fullProfile = await getCoachProfile();
      
      // Return both profile and user object from response
      return {
        profile: fullProfile,
        user: response.data.user
      };
    }
    
    throw new Error('Unexpected response format from backend');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to register coach profile');
  }
};

