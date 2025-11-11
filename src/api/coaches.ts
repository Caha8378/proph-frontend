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

