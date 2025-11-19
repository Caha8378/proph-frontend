import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { Header } from '../components/layout/Header';
import { PostingCardHorizontalMini } from '../components/posting/PostingCardHorizontalMini';
import { ApplyModalMinC } from '../components/application/ApplyModalMinC';
import { EmptyState } from '../components/common/EmptyState';
import { FileText, Share2, ChevronLeft, LogIn, UserPlus, Target } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useNotification } from '../hooks';
import * as postingsService from '../api/postings';
import type { Posting, School } from '../types';

export const SchoolPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [school, setSchool] = useState<School | null>(null);
  const [postings, setPostings] = useState<Posting[]>([]);
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolPostings = async () => {
      if (!schoolId) {
        setError('School ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await postingsService.getSchoolPostings(schoolId);
        setSchool(data.school);
        setPostings(data.postings);
      } catch (err: any) {
        console.error('Error fetching school postings:', err);
        setError(err.message || 'Failed to load school postings');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolPostings();
  }, [schoolId]);

  const handleShare = () => {
    const url = `${window.location.origin}/school/${schoolId}`;
    navigator.clipboard.writeText(url);
    showNotification('School page link copied to clipboard!', 'success');
  };

  const handleApply = (postingId: string) => {
    const posting = postings.find((p) => p.id === postingId);
    if (posting) {
      // Only allow players to apply
      if (!user) {
        // Not logged in - redirect to signup
        navigate(`/signup?role=player&redirect=/school/${schoolId}`);
        return;
      }
      if (user.role !== 'player') {
        // Logged in but not a player - show message or redirect
        showNotification('Only players can apply to postings. Please sign up as a player to apply.', 'error');
        return;
      }
      // Player can apply - open modal
      setSelectedPosting(posting);
    }
  };

  const handleApplicationSuccess = async () => {
    // Refresh postings to update has_applied status
    if (schoolId) {
      try {
        const data = await postingsService.getSchoolPostings(schoolId);
        setPostings(data.postings);
      } catch (err: any) {
        console.error('Error refreshing postings:', err);
      }
    }
    setSelectedPosting(null);
  };

  // Sort postings by created date (newest first)
  const sortedPostings = useMemo(() => {
    return [...postings].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [postings]);

  // Separate general and specific postings
  const generalPostings = sortedPostings.filter(p => p.is_general && p.status === 'active');
  const specificPostings = sortedPostings.filter(p => !p.is_general && p.status === 'active');
  const expiredPostings = sortedPostings.filter(p => p.status === 'expired');

  if (loading) {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center">
        <p className="text-proph-white">Loading...</p>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-proph-white text-xl mb-4">{error || 'School not found'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="text-proph-yellow hover:underline"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proph-black">
      <header className="bg-proph-grey border-b border-proph-grey-text/20 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="text-proph-white hover:text-proph-yellow transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-proph-yellow font-bold text-xl">Proph</h1>
          {!user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/login')}
                className="px-3 py-2 rounded-lg hover:bg-proph-grey-light active:scale-95 transition-all flex items-center gap-1 text-sm font-semibold text-proph-white"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-3 py-2 rounded-lg bg-proph-yellow text-proph-black active:scale-95 transition-all text-sm font-bold"
              >
                <UserPlus className="w-4 h-4 inline mr-1" />
                Sign Up
              </button>
            </div>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* School Header */}
        <div className="flex items-center justify-between pb-6 border-b border-proph-grey-text/20">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src={school.logo || '/defualt.webp'} 
                alt={school.name} 
                className="w-full h-full object-contain p-1.5" 
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-proph-white">{school.name}</h2>
              <p className="text-sm text-proph-grey-text">{school.division}</p>
              {school.location && (
                <p className="text-xs text-proph-grey-text mt-1">{school.location}</p>
              )}
            </div>
          </div>
          {/* Share Button */}
          <button 
            onClick={handleShare} 
            className="text-proph-white hover:text-proph-yellow transition-colors p-2 hover:bg-proph-grey-light rounded-lg"
            aria-label="Share school page"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Postings List */}
        <div className="space-y-6">
          {sortedPostings.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No postings available"
              description="This school doesn't have any active recruitment postings at the moment."
            />
          ) : (
            <>
              {/* Position-Specific Postings Section */}
              {specificPostings.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-proph-white mb-4">Open Opportunities</h2>
                  <div className="space-y-4">
                    {specificPostings.map((posting) => (
                      <PostingCardHorizontalMini
                        key={posting.id}
                        posting={posting}
                        onApply={handleApply}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Divider if both types exist */}
              {generalPostings.length > 0 && specificPostings.length > 0 && (
                <div className="border-t border-proph-grey-text/20 my-6" />
              )}

              {/* General Interest Postings Section */}
              {generalPostings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-proph-purple" />
                    <h2 className="text-xl font-bold text-proph-white">General Interest</h2>
                  </div>
                  <div className="space-y-4">
                    {generalPostings.map((posting) => (
                      <PostingCardHorizontalMini
                        key={posting.id}
                        posting={posting}
                        onApply={handleApply}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Postings */}
              {expiredPostings.length > 0 && (
                <>
                  <div className="border-t border-proph-grey-text/20 my-6" />
                  <h2 className="text-sm font-semibold text-proph-grey-text">
                    EXPIRED ({expiredPostings.length})
                  </h2>
                  <div className="space-y-4">
                    {expiredPostings.map((posting) => (
                      <PostingCardHorizontalMini
                        key={posting.id}
                        posting={posting}
                        onApply={handleApply}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Apply Modal - Only show for players */}
      {user?.role === 'player' && selectedPosting && (
        <ApplyModalMinC
          open={!!selectedPosting}
          onClose={() => setSelectedPosting(null)}
          posting={selectedPosting}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

