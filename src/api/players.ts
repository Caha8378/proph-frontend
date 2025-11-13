import apiClient, { publicApiClient } from './client';

// Backend player response structure - matches player_profiles table
// Backend may return this flat or nested in a profile object
export interface BackendPlayerResponse {
  id: number;
  user_id: number;
  name: string;
  height?: number; // Stored in inches in DB
  age?: number;
  clop?: string; // Position/playstyle
  playstyle?: string; // Alternative field name
  school?: string;
  gpa?: number;
  sat?: number;
  act?: number;
  graduation_year?: number;
  phone_number?: string;
  email?: string;
  city?: string;
  state?: string;
  profile_image_url?: string;
  weight?: number;
  projected_level?: string;
  comp_player_1?: string;
  comp_player_2?: string;
  comp_player_3?: string;
  is_verified?: boolean | number; // DB uses tinyint(1), may be 0/1 or boolean
  is_public?: boolean | number;
  // Nested format (if backend wraps it)
  profile?: {
    id?: number;
    user_id?: number;
    name?: string;
    height?: number;
    age?: number;
    clop?: string;
    playstyle?: string;
    school?: string;
    gpa?: number;
    sat?: number;
    act?: number;
    graduation_year?: number;
    city?: string;
    state?: string;
    profile_image_url?: string;
    weight?: number;
    projected_level?: string;
    comp_player_1?: string;
    comp_player_2?: string;
    comp_player_3?: string;
    is_verified?: boolean | number;
    [key: string]: any;
  };
  stats?: {
    ppg?: number;
    rpg?: number;
    apg?: number;
    fg_percentage?: number;
    fgPercentage?: number;
    three_pt_percentage?: number;
    threePtPercentage?: number;
    ft_percentage?: number;
    steals?: number;
    blocks?: number;
    spg?: number; // Steals per game (database field name)
    bpg?: number; // Blocks per game (database field name)
    // Makes and attempts (for calculating percentages)
    fga?: number; // Field Goal Attempts
    fgm?: number; // Field Goal Makes
    fta?: number; // Free Throw Attempts
    ftm?: number; // Free Throw Makes
    threepa?: number; // Three Point Attempts
    threepm?: number; // Three Point Makes
    [key: string]: any;
  };
  [key: string]: any;
}

// Frontend PlayerProfile (for API service - matches backend structure)
export interface PlayerProfile {
  id: number;
  user_id: number;
  name: string;
  height?: string;
  weight?: number;
  age?: number;
  clop?: string; // position
  school?: string;
  gpa?: number;
  graduation_year?: number;
  projected_level?: string;
  comp_player_1?: string;
  comp_player_2?: string;
  comp_player_3?: string;
  profile_image_url?: string;
  profile?: any; // Backend may nest profile data
  stats?: any; // Backend may nest stats data
  [key: string]: any; // Allow additional fields
}

export interface PlayerSearchFilters {
  query?: string;
  graduationYear?: number;
  level?: string;
  position?: string;
  [key: string]: any;
}

/**
 * Get current player's profile (authenticated) or specific player by ID
 */
export const getPlayerProfile = async (playerId?: string | null): Promise<any> => {
  try {
    // Validate playerId - if it's undefined, null, or empty string, use authenticated endpoint
    if (!playerId || playerId === 'undefined' || playerId === 'null') {
      const response = await apiClient.get<BackendPlayerResponse>('/players/me/profile');
      return convertBackendPlayerToFrontend(response.data);
    }
    
    const endpoint = `/players/${playerId}`;
    const response = await apiClient.get<BackendPlayerResponse>(endpoint);
    return convertBackendPlayerToFrontend(response.data);
  } catch (error: any) {
    // Preserve 404 status for useProfile hook to detect missing profile
    if (error.response?.status === 404) {
      const notFoundError: any = new Error(error.response?.data?.message || 'Player profile not found');
      notFoundError.response = error.response;
      throw notFoundError;
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch player profile');
  }
};

/**
 * Update player profile
 * Note: playerId is accepted but not used - backend uses /players/me/profile
 */
export const updatePlayerProfile = async (
  _playerId: number, // Prefixed with _ to indicate intentionally unused
  data: Partial<PlayerProfile>
): Promise<PlayerProfile> => {
  try {
    // Backend uses PUT /players/me/profile (no playerId in path)
    const response = await apiClient.put<PlayerProfile>('/players/me/profile', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update player profile');
  }
};

/**
 * Search players with filters
 */
export const searchPlayers = async (filters: PlayerSearchFilters = {}): Promise<PlayerProfile[]> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<BackendPlayerResponse[]>(`/players/search?${params.toString()}`);
    return response.data.map(convertBackendPlayerToFrontend);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to search players');
  }
};

/**
 * Shuffle array and return random subset
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random players (for accordion/carousel display)
 * Backend returns { players: [...], pagination: {...} }
 * Frontend randomly selects exactly 5 players from the response
 */
export const getRandomPlayers = async (limit: number = 5): Promise<PlayerProfile[]> => {
  try {
    // Request more players than needed so we can randomly select from them
    const response = await apiClient.get<{ players: BackendPlayerResponse[], pagination?: any }>(`/players?limit=${Math.max(limit * 2, 10)}`);
    // Backend returns { players: [...], pagination: {...} }
    const players = response.data.players || response.data || [];
    
    if (!Array.isArray(players) || players.length === 0) {
      return [];
    }
    
    // Convert to frontend format
    const convertedPlayers = players.map(convertBackendPlayerToFrontend);
    
    // If we have more players than needed, randomly shuffle and take limit
    if (convertedPlayers.length > limit) {
      const shuffled = shuffleArray(convertedPlayers);
      return shuffled.slice(0, limit);
    }
    
    // If we have exactly limit or fewer, return all
    return convertedPlayers;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || '';
    if (errorMessage.includes('userId') || errorMessage.includes('Cannot read properties of undefined')) {
      throw new Error('Authentication required: Please log in to view players.');
    }
    throw new Error(errorMessage || 'Failed to fetch players');
  }
};

/**
 * Get all players (public endpoint)
 * Uses public client to avoid auth issues
 */
/**
 * Get player edit info (for editing profile)
 */
export interface PlayerEditInfo {
  phone_number: string;
  highlight_video_link: string;
  gpa: number | null;
  act: number | null;
  sat: number | null;
}

export const getPlayerEditInfo = async (): Promise<PlayerEditInfo> => {
  try {
    const response = await apiClient.get<{ success: boolean; profile: PlayerEditInfo }>('/player/getEditInfo');
    if (response.data.success) {
      return response.data.profile;
    }
    throw new Error('Failed to fetch edit info');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch player edit info');
  }
};

/**
 * Update player profile (edit endpoint)
 */
export interface UpdatePlayerProfileData {
  highlightVideo?: string | null;
  phone_number?: string | null;
  gpa?: number | null;
  act?: number | null;
  sat?: number | null;
}

export const updatePlayerProfileEdit = async (
  data: UpdatePlayerProfileData
): Promise<void> => {
  try {
    // Ensure all fields are explicitly set to null (not undefined) - SQL requires null
    // Send all fields that the backend expects, even if not provided
    const sanitizedData: any = {
      highlightVideo: data.highlightVideo !== undefined ? data.highlightVideo : null,
      phone_number: data.phone_number !== undefined ? data.phone_number : null,
      gpa: data.gpa !== undefined ? data.gpa : null,
      act: data.act !== undefined ? data.act : null,
      sat: data.sat !== undefined ? data.sat : null,
    };
    
    // Double-check: convert any remaining undefined to null
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        sanitizedData[key] = null;
      }
    });
    
    const response = await apiClient.put<{ success: boolean; message: string }>(
      `/player/profile/edit`,
      sanitizedData
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update player profile');
  }
};

export const getAllPlayers = async (): Promise<PlayerProfile[]> => {
  try {
    const response = await publicApiClient.get<BackendPlayerResponse[]>('/players');
    return response.data.map(convertBackendPlayerToFrontend);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch players');
  }
};

/**
 * Get total player cards count
 * Backend endpoint: GET /player/getCount
 */
export const getTotalPlayerCards = async (): Promise<number> => {
  try {
    const response = await publicApiClient.get<{ success: boolean; totalCards: number }>('/player/getCount');
    return response.data.totalCards || 0;
  } catch (error: any) {
    console.error('Error fetching total player cards:', error);
    return 0; // Return 0 on error to prevent breaking the UI
  }
};

/**
 * Convert inches to feet'inches" format
 * Example: 74 -> "6'2""
 */
function formatHeightInches(inches: number | null | undefined): string {
  if (!inches || inches === 0) return '';
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

/**
 * Convert backend player format to frontend PlayerProfile format
 * Backend returns player data from player_profiles table (may be flat or nested)
 * Frontend expects: PlayerProfile type from types/index.ts
 */
export const convertBackendPlayerToFrontend = (backendPlayer: BackendPlayerResponse): any => {
  // Handle both flat and nested formats
  const isNested = !!backendPlayer.profile;
  const playerData = isNested ? backendPlayer.profile! : backendPlayer;
  const stats = backendPlayer.stats || {};
  
  // Get position/playstyle (clop field in DB)
  const position = playerData.playstyle || playerData.clop || 'Unknown';
  
  // Build comparisons array from comp_player fields
  const comparisons = [];
  if (playerData.comp_player_1) comparisons.push(playerData.comp_player_1);
  if (playerData.comp_player_2) comparisons.push(playerData.comp_player_2);
  if (playerData.comp_player_3) comparisons.push(playerData.comp_player_3);
  
  // Convert height from inches to feet'inches" format
  const heightInches = playerData.height;
  const heightFormatted = heightInches ? formatHeightInches(heightInches) : '';
  
  // Build location from city and state
  const location = playerData.city && playerData.state 
    ? `${playerData.city}, ${playerData.state}`
    : playerData.city || playerData.state || 'Unknown';
  
  // Handle is_verified (may be 0/1 or boolean)
  const isVerified = playerData.is_verified === true || playerData.is_verified === 1;
  
  // Calculate percentages from makes/attempts if available
  // If percentage is already provided, use it; otherwise calculate from makes/attempts
  const calculatePercentage = (makes: number | undefined, attempts: number | undefined, existingPercentage?: number): number => {
    if (existingPercentage !== undefined && existingPercentage !== null) {
      return existingPercentage;
    }
    if (makes !== undefined && attempts !== undefined && attempts > 0) {
      return makes / attempts;
    }
    return 0;
  };
  
  const fgPercentage = calculatePercentage(stats.fgm, stats.fga, stats.fg_percentage || stats.fgPercentage);
  const threePtPercentage = calculatePercentage(stats.threepm, stats.threepa, stats.three_pt_percentage || stats.threePtPercentage);
  const ftPercentage = calculatePercentage(stats.ftm, stats.fta, stats.ft_percentage);
  
  // Get the correct ID - backend uses user_id for player queries
  // Backend response has both id (player_profiles.id) and user_id
  // Use user_id if available, otherwise fall back to id
  const playerId = isNested 
    ? (playerData.user_id || backendPlayer.user_id || backendPlayer.id)
    : (backendPlayer.user_id || backendPlayer.id);
  
  // Get weight from correct location (may be in profile or top level)
  const weight = playerData.weight || (isNested ? backendPlayer.weight : undefined);
  
  // Convert to frontend PlayerProfile format
  return {
    id: String(playerId), // Use user_id for API calls (backend expects this)
    userId: backendPlayer.user_id || playerData.user_id, // Store user_id separately
    profileId: backendPlayer.id, // Store player_profiles.id separately
    name: playerData.name || 'Unknown Player',
    position: position,
    photo: playerData.profile_image_url || '',
    school: playerData.school || 'Unknown School',
    height: heightFormatted,
    weight: weight,
    age: playerData.age || 0,
    location: location,
    classYear: playerData.graduation_year || new Date().getFullYear(),
    evaluation: {
      level: playerData.projected_level || 'Unknown',
      comparisons: comparisons,
    },
    stats: {
      ppg: stats.ppg || 0,
      rpg: stats.rpg || 0,
      apg: stats.apg || 0,
      fgPercentage: fgPercentage,
      threePtPercentage: threePtPercentage,
      ftPercentage: ftPercentage,
      steals: stats.spg || stats.steals || 0, // Database uses spg, fallback to steals
      blocks: stats.bpg || stats.blocks || 0, // Database uses bpg, fallback to blocks
      // Include database field names for direct access
      spg: stats.spg,
      bpg: stats.bpg,
      // Include raw makes/attempts for frontend calculation
      fga: stats.fga,
      fgm: stats.fgm,
      fta: stats.fta,
      ftm: stats.ftm,
      threepa: stats.threepa,
      threepm: stats.threepm,
    },
    verified: isVerified,
    verificationStatus: isVerified ? 'verified' : 'pending',
    statsIntegrityCertified: isVerified,
    // Additional fields that may be useful
    sat: playerData.sat,
    act: playerData.act,
    gpa: playerData.gpa,
    email: backendPlayer.email || playerData.email,
    phoneNumber: playerData.phone_number || playerData.phoneNumber,
  };
};

