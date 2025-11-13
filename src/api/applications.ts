import apiClient from './client';
import type { Application as FrontendApplication, Posting, School } from '../types';
import { formatHeight } from '../utils/helpers';

// Backend application response structure (flat from SQL join)
export interface BackendApplication {
  id: number;
  posting_id: number;
  player_user_id: number;
  application_message?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  reviewed_by_coach_id?: number;
  reviewed_at?: string;
  applied_at?: string;
  // Posting fields
  position_title?: string;
  position_description?: string;
  application_deadline?: string;
  // School fields
  school_name?: string;
  school_city?: string;
  school_state?: string;
  school_division?: string;
  school_logo?: string;
  // Coach fields
  coach_name?: string;
  coach_title?: string;
  [key: string]: any;
}

export interface Application {
  id: number;
  posting_id: number;
  player_user_id: number;
  application_message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at?: string;
  reviewed_at?: string;
  [key: string]: any; // Allow additional fields
}

export interface ApplyToPostingData {
  postingId: number;
  applicationMessage?: string;
}

/**
 * Apply to a posting (player only)
 * Backend expects: { posting_id, application_message }
 * Backend returns: { id, message }
 */
export const applyToPosting = async (
  postingId: number | string,
  message?: string
): Promise<{ id: number; message: string }> => {
  try {
    const response = await apiClient.post<{ id: number; message: string }>('/applications', {
      posting_id: Number(postingId),
      application_message: message || null,
    });
    return response.data;
  } catch (error: any) {
    // Handle 403 for gender mismatch
    if (error.response?.status === 403) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'You can only apply to postings that match your gender');
    }
    // Handle 400 for posting closed
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'This posting is no longer accepting applications');
    }
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to apply to posting');
  }
};

/**
 * Convert backend application format to frontend Application format
 */
function convertBackendApplicationToFrontend(backendApp: BackendApplication): FrontendApplication {
  // Build School object
  const school: School = {
    id: String(backendApp.posting_id), // Use posting_id as school id fallback
    name: backendApp.school_name || 'Unknown School',
    logo: backendApp.school_logo || '',
    division: (backendApp.school_division || 'Unknown') as any,
    location: backendApp.school_city && backendApp.school_state
      ? `${backendApp.school_city}, ${backendApp.school_state}`
      : backendApp.school_state || '',
  };

  // Build Posting object
  const posting: Posting = {
    id: String(backendApp.posting_id),
    school,
    position: backendApp.position_title || 'Position',
    requirements: {
      // Backend doesn't provide these in the join, but we can leave empty
    },
    deadline: backendApp.application_deadline || new Date().toISOString(),
    applicantCount: 0, // Not provided in this query
    description: backendApp.position_description || '',
    coachName: backendApp.coach_name || 'Coach',
    createdAt: backendApp.applied_at || new Date().toISOString(),
    status: 'active',
  };

  // Map backend status to frontend status
  // 'reviewed' from backend maps to 'pending' in frontend (still waiting for decision)
  const status: 'pending' | 'accepted' | 'rejected' = 
    backendApp.status === 'reviewed' ? 'pending' :
    backendApp.status === 'accepted' ? 'accepted' :
    backendApp.status === 'rejected' ? 'rejected' :
    'pending';

  return {
    id: String(backendApp.id),
    posting,
    player: {} as any, // Not needed for player's own applications view
    status,
    appliedAt: backendApp.applied_at || new Date().toISOString(),
    note: backendApp.application_message,
    reviewedAt: backendApp.reviewed_at,
  };
}

/**
 * Backend response structure for getMyApplications
 */
export interface MyApplicationsResponse {
  applications: BackendApplication[];
}

/**
 * Get player's own applications
 * Backend returns { applications: [...] } with joined posting/school/coach data
 */
export const getMyApplications = async (): Promise<FrontendApplication[]> => {
  try {
    const response = await apiClient.get<MyApplicationsResponse>('/applications/my');
    const backendApplications = response.data.applications || [];
    
    // Convert backend format to frontend format
    return backendApplications.map(convertBackendApplicationToFrontend);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

/**
 * Get applications for a specific posting (coach only)
 */
export const getPostingApplications = async (postingId: string | number): Promise<Application[]> => {
  try {
    const response = await apiClient.get<Application[]>(`/applications/posting/${postingId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch posting applications');
  }
};

/**
 * Update application status (coach only)
 */
export const updateApplicationStatus = async (
  applicationId: number,
  status: 'accepted' | 'rejected'
): Promise<Application> => {
  try {
    const response = await apiClient.put<Application>(`/applications/${applicationId}/status`, {
      status,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update application status');
  }
};

/**
 * Accept application and create connection (coach only)
 * Backend expects application_id and optional initial_message in request body
 */
export const acceptApplication = async (
  applicationId: number,
  initialMessage?: string
): Promise<Application> => {
  try {
    const body: { application_id: number; initial_message?: string } = {
      application_id: applicationId,
    };
    
    // Include initial_message if provided (the custom message from AcceptModal)
    if (initialMessage) {
      body.initial_message = initialMessage;
    }
    
    const response = await apiClient.post<Application>(`/applications/${applicationId}/accept`, body);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to accept application');
  }
};

/**
 * Withdraw application (player only)
 * Backend route: DELETE /applications/:application_id
 */
export const withdrawApplication = async (applicationId: number | string): Promise<void> => {
  try {
    await apiClient.delete(`/applications/${applicationId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to withdraw application');
  }
};

/**
 * Application info response (pending count for coach's school)
 */
export interface ApplicationInfo {
  pending_count: number;
  school_id: number | null;
}

/**
 * Get application info (pending count for coach's school)
 * Backend endpoint: GET /api/applications/info
 */
export const getApplicationInfo = async (): Promise<ApplicationInfo> => {
  try {
    const response = await apiClient.get<ApplicationInfo>('/applications/info');
    return response.data;
  } catch (error: any) {
    // Handle 404 gracefully - coach profile might not exist yet
    if (error.response?.status === 404 || error.message?.includes('coach profile not found') || error.message?.includes('404')) {
      // Return default values for missing profile
      return {
        pending_count: 0,
        school_id: null,
      };
    }
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch application info');
  }
};

/**
 * Backend response structure for pending applications by posting
 */
export interface PendingApplicationItem {
  application_id?: number; // Backend should include this for accept/reject operations
  player_user_id: number;
  name: string;
  height: number | null; // Height in inches
  weight: string | null;
  graduation_year: number | null;
  profile_image_url?: string | null;
  application_message?: string | null; // Application message from player
  applied_at: string;
}

export interface PostingWithApplications {
  posting: {
    id: number;
    position_title: string;
  };
  applications: PendingApplicationItem[];
  total_applications: number;
}

export interface PendingApplicationsResponse {
  postings: PostingWithApplications[];
  total_pending_applications: number;
}

/**
 * Get pending applications grouped by posting (coach only)
 * Backend endpoint: GET /api/applications/pending
 * Returns both applications and postings with 0 applications
 */
export const getPendingApplicationsByPosting = async (): Promise<{
  applications: FrontendApplication[];
  postingsWithZeroApps: PostingWithApplications[];
}> => {
  try {
    const response = await apiClient.get<PendingApplicationsResponse>('/applications/pending');
    const { postings } = response.data;
    
    // Transform backend response to frontend Application format
    const applications: FrontendApplication[] = [];
    const postingsWithZeroApps: PostingWithApplications[] = [];
    
    postings.forEach((postingGroup) => {
      const { posting, applications: appItems } = postingGroup;
      
      // If posting has 0 applications, store it separately
      if (appItems.length === 0) {
        postingsWithZeroApps.push(postingGroup);
        return;
      }
      
      // Build a minimal School object (we don't have school data in this response)
      const school: School = {
        id: String(posting.id),
        name: 'School', // Will be replaced when we have actual school data
        logo: '',
        division: 'D1' as any,
        location: '',
      };
      
      // Build Posting object
      const postingObj: Posting = {
        id: String(posting.id),
        school,
        position: posting.position_title,
        requirements: {},
        deadline: new Date().toISOString(),
        applicantCount: postingGroup.total_applications,
        description: '',
        coachName: 'Coach',
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      
      // Convert each application item to FrontendApplication
      appItems.forEach((appItem) => {
        // Convert height from inches to feet'inches" format
        const heightFormatted = appItem.height ? formatHeight(appItem.height) : '';
        
        // Build minimal PlayerProfile
        const player: any = {
          id: String(appItem.player_user_id),
          userId: appItem.player_user_id,
          name: appItem.name,
          position: '',
          photo: appItem.profile_image_url || '', // Use profile_image_url from backend
          school: '',
          height: heightFormatted,
          weight: appItem.weight ? parseInt(appItem.weight, 10) : undefined,
          age: 0,
          location: '',
          classYear: appItem.graduation_year || 0,
          evaluation: {
            level: '',
            comparisons: [],
          },
          stats: {
            ppg: 0,
            rpg: 0,
            apg: 0,
            steals: 0,
            blocks: 0,
          },
        };
        
        // Use application_id if provided, otherwise generate a composite ID
        // NOTE: Backend should include application_id in the response for accept/reject operations
        const applicationId = appItem.application_id 
          ? String(appItem.application_id)
          : `${posting.id}-${appItem.player_user_id}-${appItem.applied_at}`;
        
        applications.push({
          id: applicationId,
          posting: postingObj,
          player,
          status: 'pending',
          appliedAt: appItem.applied_at,
          applicationMessage: appItem.application_message || undefined, // Store application message
        });
      });
    });
    
    return {
      applications,
      postingsWithZeroApps,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch pending applications');
  }
};

