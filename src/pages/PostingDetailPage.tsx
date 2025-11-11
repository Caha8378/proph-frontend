import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, CheckCircle, Edit, Share2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { ApplyModalMinC } from '../components/application/ApplyModalMinC';
import * as postingsService from '../api/postings';
import type { Posting } from '../types';

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
        setError(err.message || 'Failed to load posting');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosting();
  }, [id]);

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
              <div className="space-y-2 text-base text-proph-white">
                {posting.requirements.height && <p>• Height: {posting.requirements.height}</p>}
                {posting.requirements.classYear && (
                  <p>• Class: {String(posting.requirements.classYear)}</p>
                )}
                {posting.requirements.class && posting.requirements.class.length > 0 && (
                  <p>• Class: {posting.requirements.class.join(', ')}</p>
                )}
                {posting.requirements.gpa && <p>• Minimum GPA: {posting.requirements.gpa}</p>}
              </div>
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
                <button onClick={() => setIsApplyModalOpen(true)} className="w-full bg-proph-yellow hover:bg-proph-yellow/90 text-proph-black font-black py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg">
                  <CheckCircle className="w-6 h-6" /> Apply to This Position
                </button>
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


