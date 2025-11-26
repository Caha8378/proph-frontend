import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, CheckCircle, Edit, Share2, ChevronLeft, Target } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { ApplyModalMinC } from '../components/application/ApplyModalMinC';
import * as postingsService from '../api/postings';
import type { Posting } from '../types';

// Helper function to convert inches to feet'inches" format
const formatHeight = (heightInches: number | undefined | null): string | null => {
  if (!heightInches || heightInches <= 0) return null;
  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;
  return `${feet}'${inches}"+`;
};

export const PostingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posting, setPosting] = useState<(Posting & {
    isMySchoolPosting?: boolean;
    applicationCount?: number;
    hasApplied?: boolean;
    applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
    coachName?: string;
    coachTitle?: string;
    coachImage?: string;
    coachEmail?: string;
    schoolWebsite?: string;
  }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [canApply, setCanApply] = useState<boolean | null>(null);
  const [eligibilityReasons, setEligibilityReasons] = useState<string[]>([]);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  useEffect(() => {
    const fetchPosting = async () => {
      if (!id) {
        setError('Posting ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await postingsService.getPostingById(id);
        setPosting(data);
      } catch (err: any) {
        console.error('Error fetching posting:', err);
        // Handle 404 - might indicate gender mismatch
        if (err.message?.includes('404') || err.message?.includes('not found')) {
          setError('This posting is not available or you do not have permission to view it.');
        } else {
          setError(err.message || 'Failed to load posting');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosting();
  }, [id]);

  // Check eligibility for players
  useEffect(() => {
    const checkEligibility = async () => {
      if (!id || !user || user.role !== 'player' || !posting) {
        return;
      }

      try {
        setIsCheckingEligibility(true);
        const eligibility = await postingsService.checkEligibility(id);
        setCanApply(eligibility.eligible);
        setEligibilityReasons(eligibility.reasons || []);
      } catch (err: any) {
        console.error('Error checking eligibility:', err);
        // On error, default to allowing apply (backend will catch it on submission)
        setCanApply(true);
        setEligibilityReasons([]);
      } finally {
        setIsCheckingEligibility(false);
      }
    };

    if (posting && user?.role === 'player' && !posting.hasApplied) {
      checkEligibility();
    }
  }, [id, user, posting]);

  const handleShare = () => {
    const url = `${window.location.origin}/posting/${posting?.id}`;
    navigator.clipboard.writeText(url);
    alert('Posting link copied to clipboard!');
  };

  const handleApplicationSuccess = async () => {
    // Refresh posting data to update hasApplied status
    if (id) {
      try {
        const data = await postingsService.getPostingById(id);
        setPosting(data);
      } catch (err: any) {
        console.error('Error refreshing posting:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center">
        <p className="text-proph-white">Loading...</p>
      </div>
    );
  }

  if (error || !posting) {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-proph-white text-xl mb-4">{error || 'Posting not found'}</p>
          <Link to="/" className="text-proph-yellow hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proph-black">
      <header className="bg-proph-grey border-b border-proph-grey-text/20 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-proph-white hover:text-proph-yellow transition-colors flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-proph-yellow font-bold text-xl">Proph</h1>
          <button onClick={handleShare} className="text-proph-white hover:text-proph-yellow transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-proph-grey rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 space-y-6">
            {/* General Interest Banner */}
            {posting.is_general && (
              <div className="bg-proph-purple/10 border-2 border-proph-purple rounded-xl p-6 mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-proph-purple/20 rounded-lg">
                    <Target className="w-6 h-6 text-proph-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-proph-white mb-2">
                      Open to All Players
                    </h3>
                    <p className="text-proph-grey-text">
                      This is a general interest posting. All players are welcome to apply 
                      regardless of position, class year, or specific requirements. The coaching 
                      staff will review your application and reach out if there's a potential fit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pb-6 border-b border-proph-grey-text/20">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src={posting.school.logo || '/defualt.webp'} 
                  alt={posting.school.name} 
                  className="w-full h-full object-contain p-1.5" 
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-proph-white">{posting.school.name}</h2>
                <p className="text-sm text-proph-grey-text">{posting.school.division}</p>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-proph-white leading-tight">{posting.position}</h1>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase text-proph-yellow tracking-wide mb-3">Requirements</h3>
              {posting.is_general ? (
                <div className="text-proph-grey-text italic">
                  No specific requirements - open to all qualified players
                </div>
              ) : (
                <div className="space-y-2 text-base text-proph-white">
                  {(() => {
                    // Get height in display format (check heightInches first, then fall back to height string)
                    const heightDisplay = (posting.requirements as any)?.heightInches 
                      ? formatHeight((posting.requirements as any).heightInches)
                      : posting.requirements.height || null;
                    return heightDisplay && <p>• Height: {heightDisplay}</p>;
                  })()}
                  {posting.requirements.classYear !== undefined && posting.requirements.classYear !== null && (
                    <p>• Class: {posting.requirements.classYear === 1 ? 'Eligible next season' : String(posting.requirements.classYear)}</p>
                  )}
                  {posting.requirements.class && posting.requirements.class.length > 0 && (
                    <p>• Class: {posting.requirements.class.join(', ')}</p>
                  )}
                  {posting.requirements.gpa && <p>• Minimum GPA: {posting.requirements.gpa}</p>}
                </div>
              )}
            </div>

            {posting.description && (
              <div>
                <h3 className="text-sm font-bold uppercase text-proph-yellow tracking-wide mb-3">About This Position</h3>
                <p className="text-base text-proph-white leading-relaxed">{posting.description}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-proph-grey-text/20">
              <div className="flex items-center gap-2 text-proph-grey-text">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Deadline: {formatDate(posting.deadline)}</span>
              </div>
              <div className="flex items-center gap-2 text-proph-grey-text">
                <Users className="w-5 h-5" />
                <span className="text-sm">{posting.applicationCount || posting.applicantCount || 0} applied</span>
              </div>
            </div>
            {posting.coachName && posting.createdAt && (
              <p className="text-xs text-proph-grey-text text-center">
                Posted by {posting.coachName} • {formatDate(posting.createdAt)}
              </p>
            )}
          </div>

          <div className="p-6 space-y-3 border-t border-proph-grey-text/20 bg-proph-black">
            {/* Coach's own school posting: Share, Edit, Review Applications */}
            {user?.role === 'coach' && posting.isMySchoolPosting && (
              <>
                <button onClick={handleShare} className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" /> Share Posting
                </button>
                <button onClick={() => navigate(`/coach/postings/edit/${posting.id}`)} className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-5 h-5" /> Edit Posting
                </button>
                <button onClick={() => navigate(`/coach/applications?posting=${posting.id}&status=pending,accepted,rejected`)} className="w-full bg-proph-yellow hover:bg-proph-yellow/90 text-proph-black font-black py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg">
                  Review Applications ({posting.applicationCount || 0})
                </button>
              </>
            )}

            {/* Player who has applied: Share, Applied status */}
            {user?.role === 'player' && posting.hasApplied && (
              <>
                <button onClick={handleShare} className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" /> Share Posting
                </button>
                <button disabled className="w-full bg-proph-grey-light text-proph-white font-semibold py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-lg">
                  <CheckCircle className="w-6 h-6" /> 
                  Applied {posting.applicationStatus ? `(${posting.applicationStatus})` : ''}
                </button>
              </>
            )}

            {/* Player who hasn't applied: Share, Apply */}
            {user?.role === 'player' && !posting.hasApplied && (
              <>
                <button onClick={handleShare} className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" /> Share Posting
                </button>
                {isCheckingEligibility ? (
                  <button disabled className="w-full bg-proph-grey-light text-proph-white font-semibold py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-lg">
                    Checking Eligibility...
                  </button>
                ) : canApply === false ? (
                  <>
                    <button disabled className="w-full bg-proph-grey-light text-proph-white font-semibold py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-lg opacity-50 cursor-not-allowed">
                      <CheckCircle className="w-6 h-6" /> Not Eligible to Apply
                    </button>
                    {eligibilityReasons.length > 0 && (
                      <div className="bg-proph-error/20 border border-proph-error/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-semibold text-proph-error">You are not eligible to apply:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-proph-white">
                          {eligibilityReasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <button onClick={() => setIsApplyModalOpen(true)} className="w-full bg-proph-yellow hover:bg-proph-yellow/90 text-proph-black font-black py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg">
                    <CheckCircle className="w-6 h-6" /> Apply to This Position
                  </button>
                )}
              </>
            )}

            {/* Coach (other posting) or Supporter/Admin: Share only */}
            {((user?.role === 'coach' && !posting.isMySchoolPosting) || user?.role === 'supporter' || user?.role === 'fan' || user?.role === 'admin') && (
              <button onClick={handleShare} className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" /> Share Posting
              </button>
            )}

            {/* Anonymous: Share, Sign Up */}
            {!user && (
              <>
                <button onClick={handleShare} className="w-full bg-proph-grey-light hover:bg-proph-grey-text/20 text-proph-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" /> Share Posting
                </button>
                <button onClick={() => navigate(`/signup?role=player&redirect=/posting/${posting.id}`)} className="w-full bg-proph-yellow hover:bg-proph-yellow/90 text-proph-black font-black py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  Sign Up to Apply
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {posting && user?.role === 'player' && !posting.hasApplied && (
        <ApplyModalMinC
          open={isApplyModalOpen}
          posting={posting}
          onSuccess={handleApplicationSuccess}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
};


