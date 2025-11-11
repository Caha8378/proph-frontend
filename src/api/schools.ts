import { publicApiClient } from './client';

// Backend school response structure (matches coachController.js)
export interface BackendSchool {
  school_id: number;
  name: string;
  logo_url?: string | null;
  division: string; // Now returned by backend
  conference?: string; // Now returned by backend
  // Optional fields that might be added later:
  email_domain?: string;
  mens_program?: boolean;
  womens_program?: boolean;
}

// Backend response format: { schools: BackendSchool[] }
export interface SearchSchoolsResponse {
  schools: BackendSchool[];
}

// Frontend school structure (for onboarding)
export interface School {
  id: string;
  name: string;
  division: string; // Required in frontend, but backend doesn't return it yet
  conference?: string;
  logo_url?: string;
  email_domain?: string;
  mens_program?: boolean;
  womens_program?: boolean;
}

/**
 * Search for schools
 * Backend endpoint: GET /coaches/schools/search?q={query}
 * Response: { schools: [{ school_id, name, logo_url, division, conference }] }
 */
export const searchSchools = async (query: string): Promise<School[]> => {
  try {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const response = await publicApiClient.get<SearchSchoolsResponse>(
      `/coaches/schools/search?q=${encodeURIComponent(query.trim())}`
    );

    // Map backend response to frontend format
    // Backend returns { schools: [...] }, so we need response.data.schools
    return response.data.schools.map((school) => ({
      id: String(school.school_id),
      name: school.name,
      division: school.division, // Backend now returns division
      conference: school.conference, // Backend now returns conference
      logo_url: school.logo_url || undefined,
      email_domain: school.email_domain,
      mens_program: school.mens_program,
      womens_program: school.womens_program,
    }));
  } catch (error: any) {
    console.error('[searchSchools] Error:', error.response?.data?.message || error.message);
    // Return empty array on error instead of throwing
    return [];
  }
};

