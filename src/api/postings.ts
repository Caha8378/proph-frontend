import apiClient, { publicApiClient } from './client';
import type { Posting as FrontendPosting, School } from '../types';

// Backend posting response structure (from database)
export interface Posting {
  id: number;
  coach_user_id: number;
  school?: string;
  state?: string;
  position_title: string;
  division?: string;
  graduation_year?: number; // Single graduation year (replaces graduation_year_min/max)
  min_height?: number; // Height in inches
  gpa?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  application_deadline?: string;
  match_score?: number;
  coach_name?: string;
  coach_position?: string;
  school_logo?: string;
  school_city?: string;
  school_state?: string;
  school_division?: string;
  school_conference?: string;
  [key: string]: any; // Allow additional fields
}

export interface CreatePostingData {
  school?: string;
  state?: string;
  position_title: string;
  division?: string;
  graduation_year?: number; // Single graduation year (replaces graduation_year_min/max)
  min_height?: number; // Height in inches
  gpa?: number;
  position_description?: string; // Backend field name
  description?: string; // Alternative field name
  application_deadline?: string; // Backend field name
  deadline?: string; // Alternative field name
  [key: string]: any;
}

export interface PostingFilters {
  division?: string;
  state?: string;
  position?: string;
  graduationYear?: number;
  school_name?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface SearchPostingsResponse {
  postings: Array<Posting & {
    school_name?: string;
    school_city?: string;
    school_state?: string;
    school_division?: string;
    school_conference?: string;
    school_logo?: string;
    has_applied?: boolean | number; // 1 or true if player has applied
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface SchoolPostingsResponse {
  school: {
    id: number;
    name: string;
    logo: string;
    division: string;
    location: string;
    conference?: string;
  };
  postings: Array<Posting & {
    school_name?: string;
    school_city?: string;
    school_state?: string;
    school_division?: string;
    school_conference?: string;
    school_logo?: string;
    has_applied?: boolean | number; // 1 or true if player has applied (only if authenticated player)
    application_count?: number;
    coach_name?: string;
    coach_title?: string;
  }>;
}

/**
 * Get all active postings (public)
 */
export const getPostings = async (filters: PostingFilters = {}): Promise<FrontendPosting[]> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/postings?${queryString}` : '/postings';
    const response = await apiClient.get<Posting[]>(endpoint);
    return response.data.map(convertBackendPostingToFrontend);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch postings');
  }
};

/**
 * Search postings with filters (public)
 * Backend endpoint: /postings/feed/search
 */
export const searchPostings = async (filters: PostingFilters = {}): Promise<{ postings: FrontendPosting[], total: number, page: number, limit: number }> => {
  try {
    const params = new URLSearchParams();
    
    // Map frontend filter names to backend query param names
    const filterMap: Record<string, string> = {
      division: 'division',
      state: 'state',
      position: 'position',
      graduationYear: 'graduation_year',
      school_name: 'school_name',
      page: 'page',
      limit: 'limit',
    };

    // Only send filters that are provided
    // Backend defaults page=1 and limit=20, so we don't need to send them
    Object.entries(filters).forEach(([key, value]) => {
      const backendKey = filterMap[key] || key;
      if (value !== undefined && value !== null) {
        params.append(backendKey, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = `/postings/feed/search${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<SearchPostingsResponse>(endpoint);
    
    
    // Convert backend format to frontend format
    const converted = response.data.postings.map(convertBackendPostingToFrontend);
    
    return {
      postings: converted,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    };
  } catch (error: any) {
    console.error('[searchPostings] Error:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to search postings');
  }
};

/**
 * Get all postings for a specific school (public endpoint)
 * Optionally includes has_applied if user is authenticated player
 * Backend route: GET /postings/school/:schoolId
 */
export const getSchoolPostings = async (schoolId: string | number): Promise<{ school: School; postings: FrontendPosting[] }> => {
  try {
    // Use authenticated client if available (to get has_applied for players)
    // Otherwise use public client
    const token = localStorage.getItem('authToken');
    const client = token ? apiClient : publicApiClient;
    
    const response = await client.get<SchoolPostingsResponse>(`/postings/school/${schoolId}`);
    
    const school: School = {
      id: String(response.data.school.id),
      name: response.data.school.name,
      logo: response.data.school.logo || '',
      division: response.data.school.division as any,
      location: response.data.school.location,
      conference: response.data.school.conference,
    };

    const postings = response.data.postings.map(convertBackendPostingToFrontend);
    
    return {
      school,
      postings,
    };
  } catch (error: any) {
    console.error('[getSchoolPostings] Error:', error.response?.data?.error || error.message);
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch school postings');
  }
};

/**
 * Backend response structure for getPostingById
 */
export interface PostingByIdResponse {
  posting: Posting & {
    // School fields from join
    school_name?: string;
    school_city?: string;
    school_state?: string;
    school_division?: string;
    school_conference?: string;
    school_logo?: string;
    school_website?: string;
    // Coach fields from join
    coach_name?: string;
    coach_title?: string;
    coach_image?: string;
    coach_email?: string;
    // Role-specific fields
    is_my_school_posting?: boolean;
    application_count?: number;
    has_applied?: boolean;
    application_status?: 'pending' | 'accepted' | 'rejected' | null;
  };
}

/**
 * Get single posting by ID
 * Backend returns { posting: {...} } with role-specific data
 */
export const getPostingById = async (postingId: string | number): Promise<FrontendPosting & { 
  isMySchoolPosting?: boolean;
  applicationCount?: number;
  hasApplied?: boolean;
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
  coachName?: string;
  coachTitle?: string;
  coachImage?: string;
  coachEmail?: string;
  schoolWebsite?: string;
}> => {
  try {
    const response = await apiClient.get<PostingByIdResponse>(`/postings/${postingId}`);
    const backendPosting = response.data.posting;
    
    // Convert backend format to frontend format
    const frontendPosting = convertBackendPostingToFrontend(backendPosting);
    
    // Ensure school.id is always a string (required by School interface)
    const schoolId = frontendPosting.school.id || String(backendPosting.id || '');
    const schoolWithId: School = {
      ...frontendPosting.school,
      id: schoolId,
    };
    
    // Build return object with explicit typing
    // Create a new FrontendPosting object with guaranteed school.id
    const result: FrontendPosting & { 
      isMySchoolPosting?: boolean;
      applicationCount?: number;
      hasApplied?: boolean;
      applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
      coachTitle?: string;
      coachImage?: string;
      coachEmail?: string;
      schoolWebsite?: string;
    } = {
      id: frontendPosting.id,
      coachId: frontendPosting.coachId,
      school: schoolWithId,
      position: frontendPosting.position,
      requirements: frontendPosting.requirements,
      deadline: frontendPosting.deadline,
      applicantCount: frontendPosting.applicantCount,
      matchScore: frontendPosting.matchScore,
      description: frontendPosting.description,
      coachName: backendPosting.coach_name || frontendPosting.coachName || 'Unknown Coach',
      createdAt: frontendPosting.createdAt,
      status: frontendPosting.status,
      // Additional role-specific fields
      isMySchoolPosting: backendPosting.is_my_school_posting,
      applicationCount: backendPosting.application_count || 0,
      hasApplied: backendPosting.has_applied || false,
      applicationStatus: backendPosting.application_status || null,
      coachTitle: backendPosting.coach_title || undefined,
      coachImage: backendPosting.coach_image || undefined,
      coachEmail: backendPosting.coach_email || undefined,
      schoolWebsite: backendPosting.school_website || undefined,
    };
    
    return result;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch posting');
  }
};

/**
 * Create new posting (coach only)
 */
export const createPosting = async (data: CreatePostingData): Promise<Posting> => {
  try {
    const response = await apiClient.post<Posting>('/postings', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create posting');
  }
};

/**
 * Update existing posting (coach only)
 * Backend endpoint: PUT /postings/:id
 */
export interface UpdatePostingData {
  position_title?: string;
  position_description?: string;
  min_height?: number; // Height in inches
  height?: number; // Alternative field name (also in inches)
  graduation_year?: number;
  gpa?: number;
  application_deadline?: string;
  deadline?: string; // Alternative field name
}

export const updatePosting = async (postingId: string | number, data: UpdatePostingData): Promise<{ id: string | number; message: string }> => {
  try {
    const response = await apiClient.put<{ id: string | number; message: string }>(`/postings/${postingId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update posting');
  }
};

/**
 * Check if player is eligible to apply to a posting
 * Backend endpoint: GET /postings/:postingId/can-apply
 * Authentication: Required (player must be authenticated)
 */
export interface EligibilityResponse {
  eligible: boolean;
  reasons: string[];
  posting: {
    id: number;
    school: string;
    division: string;
    gender: string;
  };
}

export const checkEligibility = async (postingId: string | number): Promise<EligibilityResponse> => {
  try {
    const response = await apiClient.get<EligibilityResponse>(`/postings/${postingId}/can-apply`);
    return response.data;
  } catch (error: any) {
    // Handle 404 for player profile not found or posting not found
    if (error.response?.status === 404) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Posting or profile not found');
    }
    // Handle 400 for invalid posting ID
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Invalid posting ID');
    }
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to check eligibility');
  }
};

/**
 * Get coach's own postings for their school
 * Backend endpoint: GET /api/recruitment/my-postings
 * Returns: { postings: [...] }
 */
export interface MyPostingsResponse {
  postings: Array<Posting & {
    created_by_coach_name?: string;
    application_count?: number;
    school_id?: number;
    [key: string]: any;
  }>;
}

export const getMyPostings = async (): Promise<FrontendPosting[]> => {
  try {
    const response = await apiClient.get<MyPostingsResponse>('/recruitment/my-postings');
    const backendPostings = response.data.postings || [];
    
    // Convert backend format to frontend format
    return backendPostings.map(convertBackendPostingToFrontend);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch my postings');
  }
};

/**
 * Deactivate a posting (coach only)
 */
export const deactivatePosting = async (postingId: string | number): Promise<void> => {
  try {
    await apiClient.delete(`/postings/${postingId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to deactivate posting');
  }
};

/**
 * Delete a posting (coach only)
 * Deletes the posting and all associated applications
 * Backend endpoint: DELETE /postings/:id
 */
export const deletePosting = async (postingId: string | number): Promise<{ message: string; deleted_applications: number }> => {
  try {
    const response = await apiClient.delete<{ message: string; deleted_applications: number }>(`/postings/${postingId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete posting');
  }
};

/**
 * Backend response structure for recommended postings
 */
export interface RecommendedPostingsResponse {
  recommendations: Array<Posting & {
    match_score?: number;
    coach_name?: string;
    coach_position?: string;
    coach_image?: string;
    coach_city?: string;
    coach_state?: string;
    conference?: string;
    position_description?: string;
  }>;
  player_criteria?: {
    height?: number;
    graduation_year?: number;
    projected_level?: string;
    state?: string;
    playstyle?: string;
    gpa?: number;
    act?: number;
    sat?: number;
  };
}

/**
 * Convert backend posting format to frontend Posting format
 * Backend returns database fields, frontend expects formatted object
 */
function convertBackendPostingToFrontend(backendPosting: Posting): FrontendPosting & { hasApplied?: boolean } {
  // Build School object
  // Backend may have school as string OR school_name, school_logo, etc. from join
  const schoolName = (backendPosting as any).school_name || backendPosting.school || 'Unknown School';
  // Check multiple possible locations for logo_url
  const schoolLogo = (backendPosting as any).school_logo || (backendPosting as any).logo_url || '';
  const schoolDivision = (backendPosting as any).school_division || backendPosting.division || 'Unknown';
  const schoolLocation = (backendPosting as any).school_city && (backendPosting as any).school_state
    ? `${(backendPosting as any).school_city}, ${(backendPosting as any).school_state}`
    : (backendPosting as any).school_state || backendPosting.state || '';
  
  const school: School = {
    id: String((backendPosting as any).school_id || backendPosting.id || ''),
    name: schoolName,
    logo: schoolLogo || '',
    division: schoolDivision as any,
    location: schoolLocation || '',
    conference: (backendPosting as any).school_conference || backendPosting.conference,
  };

  // Build requirements object
  // Handle both new schema (graduation_year) and old schema (graduation_year_min/max) for backwards compatibility
  // Note: graduation_year can be 0 (meaning "any eligibility"), so we need to check for null/undefined explicitly
  const graduationYear = backendPosting.graduation_year !== undefined && backendPosting.graduation_year !== null
    ? backendPosting.graduation_year
    : (backendPosting.graduation_year_min !== undefined && backendPosting.graduation_year_min !== null
      ? backendPosting.graduation_year_min
      : undefined);
  const requirements: FrontendPosting['requirements'] & { heightInches?: number } = {
    gpa: backendPosting.gpa || undefined,
    classYear: graduationYear, // Can be 0, so don't use || undefined
    // Store height in inches for frontend use (internal field for modals)
    heightInches: backendPosting.min_height || undefined,
  };

  // Use application_deadline from database, or default to 30 days from creation if not provided
  let deadline: Date;
  if (backendPosting.application_deadline) {
    deadline = new Date(backendPosting.application_deadline);
  } else {
    const createdAt = backendPosting.created_at ? new Date(backendPosting.created_at) : new Date();
    deadline = new Date(createdAt);
    deadline.setDate(deadline.getDate() + 30); // Default 30 days
  }

  // Check if player has applied (handle both boolean and number 1/0)
  const hasApplied = (backendPosting as any).has_applied === true || (backendPosting as any).has_applied === 1;

  // Get applicant count from backend (may be named application_count or applicantCount)
  const applicantCount = (backendPosting as any).application_count || 0;

  return {
    id: String(backendPosting.id),
    coachId: String(backendPosting.coach_user_id),
    school,
    position: backendPosting.position_title || 'Position',
    requirements,
    deadline: deadline.toISOString(),
    applicantCount: typeof applicantCount === 'number' ? applicantCount : 0,
    matchScore: backendPosting.match_score,
    description: backendPosting.position_description || '',
    coachName: backendPosting.coach_name || 'Coach',
    createdAt: backendPosting.created_at || new Date().toISOString(),
    status: backendPosting.is_active ? 'active' : 'expired',
    hasApplied,
    is_general: (backendPosting as any).is_general === true || (backendPosting as any).is_general === 1,
    can_delete: (backendPosting as any).can_delete !== false && (backendPosting as any).can_delete !== 0,
  };
}

/**
 * Get recommended postings for the current player
 * Backend calculates match scores and excludes already-applied postings
 * Returns top 20, frontend can limit further
 */
export const getRecommendedPostings = async (limit?: number): Promise<FrontendPosting[]> => {
  try {
    const response = await apiClient.get<RecommendedPostingsResponse>('/postings/feed/recommended');
    let recommendations = response.data.recommendations || [];
    
    // Convert backend format to frontend format
    const converted = recommendations.map(convertBackendPostingToFrontend);
    
    // Limit to requested number if specified
    if (limit && limit > 0) {
      return converted.slice(0, limit);
    }
    
    return converted;
  } catch (error: any) {
    // If 404, return empty array (profile might not exist yet)
    if (error.response?.status === 404) {
      console.log('[getRecommendedPostings] Profile not found (404), returning empty array');
      return [];
    }
    console.error('[getRecommendedPostings] Error:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch recommended postings');
  }
};

