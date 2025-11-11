import React, { useMemo, useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { CoachBottomNav } from '../../components/layout/CoachBottomNav';
import { ApplicationCardCoach } from '../../components/application/ApplicationCardCoach';
import { EmptyState } from '../../components/common/EmptyState';
import { Inbox, ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerProfileModal } from '../../components/player/PlayerProfileModal';
import { AcceptModal } from '../../components/application/AcceptModal';
import { RejectModal } from '../../components/application/RejectModal';
import * as applicationsService from '../../api/applications';
import { useProfile } from '../../hooks';
import { useAuth } from '../../context/authContext';
import type { Application } from '../../types';
import type { CoachProfile } from '../../api/coaches';

export const ReviewApplications: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const coachProfile = profile as CoachProfile | null;
  
  // Use user.emailVerified as the source of truth for verification status
  // Handle both boolean and number (1/0) from backend
  const isVerified = !!user?.emailVerified;
  
  // Get school name and coach name from coach profile
  const schoolName = (coachProfile as any)?.school || (coachProfile as any)?.school_name || null;
  const coachName = coachProfile?.name || null;
  
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
  const [postingsWithZeroApps, setPostingsWithZeroApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPostings, setExpandedPostings] = useState<Set<string>>(new Set());
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [acceptingApplication, setAcceptingApplication] = useState<Application | null>(null);
  const [rejectingApplication, setRejectingApplication] = useState<Application | null>(null);

  // Fetch pending applications from backend
  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await applicationsService.getPendingApplicationsByPosting();
        setPendingApplications(result.applications);
        setPostingsWithZeroApps(result.postingsWithZeroApps);
        
        // Start with all postings collapsed (empty set)
        setExpandedPostings(new Set());
      } catch (err: any) {
        console.error('Failed to fetch pending applications:', err);
        setError(err.message || 'Failed to load pending applications');
        setPendingApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApplications();
  }, []);

  // Group applications by posting
  const applicationsByPosting = useMemo(() => {
    const grouped = new Map<string, Application[]>();
    pendingApplications.forEach(app => {
      const postingId = app.posting.id;
      if (!grouped.has(postingId)) {
        grouped.set(postingId, []);
      }
      grouped.get(postingId)!.push(app);
    });
    
    // Add postings with 0 applications
    postingsWithZeroApps.forEach(postingGroup => {
      const postingId = String(postingGroup.posting.id);
      if (!grouped.has(postingId)) {
        grouped.set(postingId, []);
      }
    });
    
    return grouped;
  }, [pendingApplications, postingsWithZeroApps]);

  // Get posting display name (just position, no school name)
  const getPostingName = (postingId: string) => {
    const app = pendingApplications.find(a => a.posting.id === postingId);
    if (app) {
      return app.posting.position;
    }
    // Check postings with zero apps
    const zeroAppPosting = postingsWithZeroApps.find(p => String(p.posting.id) === postingId);
    if (zeroAppPosting) {
      return zeroAppPosting.posting.position_title;
    }
    return 'Unknown Posting';
  };
  
  // Get application count for a posting
  const getApplicationCount = (postingId: string) => {
    const apps = applicationsByPosting.get(postingId) || [];
    return apps.length;
  };

  // Get school logo from localStorage
  const schoolLogo = localStorage.getItem('schoolLogo') || '/defualt.webp';

  const togglePosting = (postingId: string) => {
    const next = new Set(expandedPostings);
    if (next.has(postingId)) {
      next.delete(postingId);
    } else {
      next.add(postingId);
    }
    setExpandedPostings(next);
  };

  const handleViewProfile = (playerId: string) => {
    // Use playerId to fetch full player data (with stats) via PlayerProfileModal
    // The modal will use usePlayer hook to fetch complete data
    setSelectedPlayerId(playerId);
    setIsProfileOpen(true);
  };

  const handleAccept = (applicationId: string) => {
    const app = pendingApplications.find(a => a.id === applicationId);
    if (app) {
      setAcceptingApplication(app);
    }
  };

  const handleReject = (applicationId: string) => {
    const app = pendingApplications.find(a => a.id === applicationId);
    if (app) {
      setRejectingApplication(app);
    }
  };

  const handleAcceptSubmit = async (message: string) => {
    if (!acceptingApplication) return;
    
    try {
      // Extract application ID
      // If it's a number (from backend application_id), use it directly
      // Otherwise, it's a composite ID format: "postingId-playerUserId-appliedAt"
      let applicationIdNum: number;
      
      if (!isNaN(Number(acceptingApplication.id))) {
        // Direct application_id from backend
        applicationIdNum = parseInt(acceptingApplication.id, 10);
      } else {
        // Composite ID - extract posting_id (first part)
        // NOTE: This is a workaround. Backend should include application_id in the response.
        const applicationIdParts = acceptingApplication.id.split('-');
        if (applicationIdParts.length < 2) {
          throw new Error('Invalid application ID format. Backend should include application_id.');
        }
        // For now, we'll need to fetch the actual application_id using posting_id and player_user_id
        // Or the backend should be updated to include application_id in the response
        throw new Error('Application ID not available. Backend response should include application_id.');
      }
      
      // Accept the application and create conversation with initial message
      // The backend handles conversation creation, so we just pass the message here
      await applicationsService.acceptApplication(applicationIdNum, message);
      
      setAcceptingApplication(null);
      
      // Refresh applications list
      const result = await applicationsService.getPendingApplicationsByPosting();
      setPendingApplications(result.applications);
      setPostingsWithZeroApps(result.postingsWithZeroApps);
    } catch (error: any) {
      console.error('Failed to accept application:', error);
      alert('Failed to accept application. Please try again.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingApplication) return;
    
    try {
      // Extract application ID
      let applicationIdNum: number;
      
      if (!isNaN(Number(rejectingApplication.id))) {
        // Direct application_id from backend
        applicationIdNum = parseInt(rejectingApplication.id, 10);
      } else {
        // Composite ID - not supported for reject operation
        throw new Error('Application ID not available. Backend response should include application_id.');
      }
      
      // Update application status to rejected
      await applicationsService.updateApplicationStatus(applicationIdNum, 'rejected');
      
      setRejectingApplication(null);
      
      // Refresh applications list
      const result = await applicationsService.getPendingApplicationsByPosting();
      setPendingApplications(result.applications);
      setPostingsWithZeroApps(result.postingsWithZeroApps);
    } catch (error: any) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <img
            src={schoolLogo}
            alt="School logo"
            className="w-8 h-8 rounded-lg object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/defualt.webp';
            }}
          />
          <h1 className="text-2xl font-bold text-proph-white">Review Applications</h1>
        </div>

        {/* Application List - Grouped by Posting */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-proph-grey-text">Loading applications...</p>
            </div>
          ) : error ? (
            <EmptyState icon={Inbox} title="Error loading applications" description={error} />
          ) : applicationsByPosting.size === 0 && postingsWithZeroApps.length === 0 ? (
            <EmptyState icon={Inbox} title="No pending applications" description="All applications have been reviewed" />
          ) : (
            Array.from(applicationsByPosting.entries()).map(([postingId, applications]) => {
              const isExpanded = expandedPostings.has(postingId);
              const postingName = getPostingName(postingId);
              
              return (
                <div key={postingId} className="bg-transparent overflow-hidden">
                  {/* Posting Header */}
                  <button
                    onClick={() => togglePosting(postingId)}
                    className="w-full p-3 flex items-center justify-between hover:bg-proph-grey-light/20 rounded-lg transition-colors"
                  >
                    <h3 className="text-lg font-bold text-proph-white">{postingName}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-proph-grey-text">
                        {getApplicationCount(postingId)} {getApplicationCount(postingId) === 1 ? 'application' : 'applications'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-proph-grey-text" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-proph-grey-text" />
                      )}
                    </div>
                  </button>

                  {/* Applications List (when expanded) */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-proph-grey-text/20 pt-3">
                      {applications.length === 0 ? (
                        <p className="text-proph-grey-text text-sm py-4 text-center">No pending applications for this posting</p>
                      ) : (
                        applications.map((application) => (
                          <ApplicationCardCoach
                            key={application.id}
                            application={application}
                            onViewProfile={handleViewProfile}
                            onAccept={handleAccept}
                            onReject={handleReject}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
      <CoachBottomNav isVerified={isVerified} />

      {/* Player Profile Modal */}
      <PlayerProfileModal
        playerId={selectedPlayerId}
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setSelectedPlayerId(null);
        }}
      />

      {/* Accept Modal */}
      {acceptingApplication && (
        <AcceptModal
          open={!!acceptingApplication}
          application={acceptingApplication}
          schoolName={schoolName || undefined}
          coachName={coachName || undefined}
          onSubmit={handleAcceptSubmit}
          onClose={() => setAcceptingApplication(null)}
        />
      )}

      {/* Reject Modal */}
      {rejectingApplication && (
        <RejectModal
          open={!!rejectingApplication}
          application={rejectingApplication}
          onSubmit={handleRejectSubmit}
          onClose={() => setRejectingApplication(null)}
        />
      )}
    </div>
  );
};


