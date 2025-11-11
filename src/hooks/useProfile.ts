import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import * as playersService from '../api/players';
import * as coachesService from '../api/coaches';
import type { PlayerProfile } from '../api/players';
import type { CoachProfile } from '../api/coaches';

type Profile = PlayerProfile | CoachProfile;

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  profileNotFound: boolean; // True if profile doesn't exist (404)
  refetch: () => Promise<void>;
}

export const useProfile = (userId?: string): UseProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data: Profile;
      if (user.role === 'player') {
        data = await playersService.getPlayerProfile(userId);
      } else if (user.role === 'coach') {
        data = await coachesService.getCoachProfile(userId);
      } else {
        throw new Error('Profile not available for this user type');
      }

      setProfile(data);
      
      // Store profile photo in localStorage for quick access (e.g., BottomNav)
      if (data && 'photo' in data && data.photo) {
        localStorage.setItem('profilePhoto', data.photo);
      } else if (data && 'profileImageUrl' in data && data.profileImageUrl) {
        localStorage.setItem('profilePhoto', data.profileImageUrl);
      } else if (data && 'profile_image_url' in data && data.profile_image_url) {
        localStorage.setItem('profilePhoto', data.profile_image_url);
      }
      
      // Store coach verification status in localStorage
      if (user?.role === 'coach' && data && 'is_verified' in data) {
        const isVerified = data.is_verified === true || data.is_verified === 1;
        localStorage.setItem('coachVerified', String(isVerified));
      }
      
      // Store school logo_url for coach bottom nav "My Team" icon
      if (user?.role === 'coach' && data && 'logo_url' in data) {
        const logoUrl = (data as any).logo_url;
        if (logoUrl) {
          localStorage.setItem('schoolLogo', logoUrl);
        }
      }
    } catch (err: any) {
      // Check if it's a 404 (profile doesn't exist)
      if (err.response?.status === 404 || err.message?.includes('404')) {
        setProfileNotFound(true);
        setError(null); // Don't show error for missing profile
        setProfile(null);
      } else {
        setProfileNotFound(false);
        setError(err.message || 'Failed to fetch profile');
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id, userId]);

  return {
    profile,
    loading,
    error,
    profileNotFound,
    refetch: fetchProfile,
  };
};

