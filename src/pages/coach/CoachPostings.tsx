import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { CoachBottomNav } from '../../components/layout/CoachBottomNav';
import { PostingCardCoach } from '../../components/posting/PostingCardCoach';
import { CreatePostingModal } from '../../components/posting/CreatePostingModal';
import { EditPostingModal } from '../../components/posting/EditPostingModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Plus, FileText } from 'lucide-react';
import type { Posting } from '../../types';
import { useLocation, useNavigate } from 'react-router-dom';
import * as postingsService from '../../api/postings';
import { useProfile } from '../../hooks';
import { useAuth } from '../../context/authContext';
import type { CoachProfile } from '../../api/coaches';

export const CoachPostings: React.FC = () => {
  const { user } = useAuth();
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Posting | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch coach profile for school info
  const { profile } = useProfile();
  const coachProfile = profile as CoachProfile | null;
  
  // Use user.emailVerified as the source of truth for verification status
  // Handle both boolean and number (1/0) from backend
  const isVerified = !!user?.emailVerified;

  // Fetch postings on mount
  useEffect(() => {
    const fetchPostings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await postingsService.getMyPostings();
        setPostings(data);
      } catch (err: any) {
        console.error('Error fetching postings:', err);
        setError(err.message || 'Failed to load postings');
      } finally {
        setLoading(false);
      }
    };

    fetchPostings();
  }, []);

  // Auto-open create modal if ?create=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1') {
      setCreateOpen(true);
      // remove query after opening
      params.delete('create');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search, navigate]);

  const handleEdit = (id: string) => {
    const p = postings.find(p => p.id === id) || null;
    setEditing(p);
    // Ensure scroll to bottom where modal appears from bottom
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 0);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this posting?')) {
      setPostings(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleViewApplications = (id: string) => {
    navigate(`/coach/applications?posting=${id}&status=pending,accepted,rejected`);
  };

  const handlePublish = async (posting: Partial<Posting>) => {
    // Convert frontend posting format to backend format
    const createData = {
      position_title: posting.position || '',
      graduation_year_min: posting.requirements?.class && Array.isArray(posting.requirements.class) && posting.requirements.class.length > 0 
        ? Math.min(...(posting.requirements.class as number[]))
        : undefined,
      graduation_year_max: posting.requirements?.class && Array.isArray(posting.requirements.class) && posting.requirements.class.length > 0
        ? Math.max(...(posting.requirements.class as number[]))
        : undefined,
      gpa: posting.requirements?.gpa,
      description: posting.description,
      application_deadline: posting.deadline,
    };

    // Call API to create posting
    await postingsService.createPosting(createData);
    
    // Close modal
    setCreateOpen(false);
    
    // Refresh postings after creating
    try {
      const data = await postingsService.getMyPostings();
      setPostings(data);
    } catch (err: any) {
      console.error('Error refreshing postings:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setEditing(null);
    // Refresh postings after editing
    try {
      const data = await postingsService.getMyPostings();
      setPostings(data);
    } catch (err: any) {
      console.error('Error refreshing postings:', err);
    }
  };

  const handleClosePosting = (postingId: string) => {
    setPostings(prev => prev.map(p => p.id === postingId ? ({ ...p, status: 'filled' }) : p));
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Branding Header */}
        {coachProfile && (coachProfile as any).school && (
          <div className="flex items-center gap-3 mb-2 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-proph-black/40 flex items-center justify-center">
              <img 
                src={(coachProfile as any).logo_url || '/defualt.webp'} 
                alt={(coachProfile as any).school || 'School'} 
                className="w-full h-full object-contain p-1.5" 
              />
            </div>
            <h1 className="text-2xl font-extrabold text-proph-white truncate">
              My Postings
            </h1>
          </div>
        )}

        {error && (
          <div className="bg-proph-grey border border-proph-error/50 rounded-xl p-4 text-proph-error">
            {error}
          </div>
        )}

        {/* Big Create Button */}
        <button
          onClick={() => setCreateOpen(true)}
          className="w-full bg-proph-yellow text-proph-black text-xl font-bold py-6 px-8 rounded-xl shadow-xl flex items-center justify-center gap-3 hover:bg-proph-yellow/90"
        >
          <Plus className="w-8 h-8" /> Create New Posting
        </button>

        {/* Postings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-proph-grey-text">Loading postings...</p>
            </div>
          ) : postings.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No postings yet"
              description="Create your first posting to start recruiting players"
              ctaText="Create Posting"
              onCtaClick={() => setCreateOpen(true)}
            />
          ) : (
            <>
              <h2 className="text-sm font-semibold text-proph-grey-text">ACTIVE ({postings.filter(p => p.status === 'active').length})</h2>
              {postings.filter(p => p.status === 'active').map((posting) => (
                <PostingCardCoach
                  key={posting.id}
                  posting={posting}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewApplications={handleViewApplications}
                />
              ))}

              <h2 className="text-sm font-semibold text-proph-grey-text pt-4">EXPIRED ({postings.filter(p => p.status === 'expired').length})</h2>
              {postings.filter(p => p.status === 'expired').map((posting) => (
                <PostingCardCoach
                  key={posting.id}
                  posting={posting}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewApplications={handleViewApplications}
                />
              ))}
            </>
          )}
        </div>
      </main>

      <CreatePostingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onPublish={handlePublish}
      />

      {editing && (
        <EditPostingModal
          posting={editing}
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
          onClosePosting={handleClosePosting}
        />
      )}

      <CoachBottomNav postingsCount={postings.length} isVerified={isVerified} />
    </div>
  );
};
