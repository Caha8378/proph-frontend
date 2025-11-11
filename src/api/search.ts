import { publicApiClient } from './client';
// import type { PlayerProfile } from './players';
// import type { School } from '../types';

export interface SearchPlayerResult {
  id: number;
  user_id: number;
  name: string;
  school?: string; // High school name
  city?: string;
  state?: string;
  profile_image_url?: string;
  position?: string;
  [key: string]: any;
}

export interface SearchCoachingStaffResult {
  id?: number;
  school: string; // College name
  logo?: string;
  logo_url?: string; // Backend may send logo_url
  division?: string;
  state?: string; // State from backend
  location?: string;
  school_id?: number; // For navigation (should be s.id from schools table)
  [key: string]: any;
}

export interface SearchResponse {
  players: SearchPlayerResult[];
  coachingStaffs: SearchCoachingStaffResult[];
}

/**
 * Search for players and colleges (coaching staffs)
 * Backend endpoint: GET /api/players/search?q={query}
 */
export const search = async (query: string): Promise<SearchResponse> => {
  try {
    if (!query || query.trim().length < 2) {
      return { players: [], coachingStaffs: [] };
    }

    // Use public client since search should work without auth
    const response = await publicApiClient.get<SearchResponse>(
      `/players/search?q=${encodeURIComponent(query.trim())}`
    );

    return {
      players: response.data.players || [],
      coachingStaffs: response.data.coachingStaffs || [],
    };
  } catch (error: any) {
    console.error('[search] Error:', error.response?.data?.message || error.message);
    // Return empty results on error instead of throwing
    return { players: [], coachingStaffs: [] };
  }
};

