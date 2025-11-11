import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { CoachBottomNav } from '../../components/layout/CoachBottomNav';
import { CoachBanner } from '../../components/coach/CoachBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { Users } from 'lucide-react';
import * as coachesService from '../../api/coaches';
import { useAuth } from '../../context/authContext';
import { useProfile } from '../../hooks';
import type { TeamMember } from '../../api/coaches';
import type { CoachProfile } from '../../api/coaches';

export const MyTeam: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const coachProfile = profile as CoachProfile | null;
  const [coaches, setCoaches] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await coachesService.getMyTeam();
        setCoaches(data);
      } catch (err: any) {
        console.error('Error fetching team:', err);
        setError(err.message || 'Failed to load team');
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  // Get school logo from coach profile (all coaches are from the same school)
  const schoolLogo = (coachProfile as any)?.logo_url || '/defualt.webp';
  const schoolName = (coachProfile as any)?.school || 'School';

  // Convert TeamMember to format expected by CoachBanner
  const teamCoaches = coaches.map(coach => ({
    id: String(coach.user_id),
    name: coach.name,
    school: {
      id: '',
      name: schoolName,
      logo: schoolLogo, // All coaches from same school, use profile's school logo
      division: 'D1' as const,
      location: '',
    },
    position: coach.position,
    photo: coach.profile_image_url,
    email: '',
    phone: '',
    verified: true,
  }));

  const currentUserId = user?.id ? String(user.id) : undefined;
  
  // Use user.emailVerified as the source of truth for verification status
  // Handle both boolean and number (1/0) from backend
  const isVerified = !!user?.emailVerified;

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-proph-white">My Team</h1>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-proph-grey-text">Loading team...</p>
          </div>
        ) : error ? (
          <div className="bg-proph-grey border border-proph-error/50 rounded-xl p-4 text-proph-error">
            {error}
          </div>
        ) : coaches.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members found"
            description="You must be associated with a school to view your team"
          />
        ) : (
          <CoachBanner coaches={teamCoaches} currentUserId={currentUserId} />
        )}
      </main>
      <CoachBottomNav isVerified={isVerified} />
    </div>
  );
};


