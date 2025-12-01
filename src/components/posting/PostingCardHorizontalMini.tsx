import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Posting } from '../../types';
import { Clock } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import * as postingsService from '../../api/postings';
import { getOptimizedCloudinaryUrl } from '../../utils/cloudinary';

// Helper function to convert inches to feet'inches" format
const formatHeight = (heightInches: number | undefined | null): string | null => {
  if (!heightInches || heightInches <= 0) return null;
  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;
  return `${feet}'${inches}"+`;
};

interface PostingCardMiniProps {
  posting: Posting & { hasApplied?: boolean };
  onApply: (postingId: string) => void;
  hasApplied?: boolean; // Legacy prop, will use posting.hasApplied if not provided
  isDemo?: boolean; // Disables navigation for demo/landing page usage
}

export const PostingCardHorizontalMini: React.FC<PostingCardMiniProps> = ({ posting, hasApplied: hasAppliedProp, isDemo = false }) => {
  const due = new Date(posting.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const req = posting.requirements;
  
  // Use posting.hasApplied from backend if available, otherwise fall back to prop
  const hasApplied = posting.hasApplied ?? hasAppliedProp ?? false;
  
  // Eligibility state for players
  const [canApply, setCanApply] = useState<boolean | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  // Get height in display format (check heightInches first, then fall back to height string)
  const heightDisplay = (req as any)?.heightInches 
    ? formatHeight((req as any).heightInches)
    : req.height || null;

  const reqString = [
    heightDisplay,
        req.gpa ? `${req.gpa} GPA` : null,
    req.classYear !== undefined && req.classYear !== null
      ? (req.classYear === 1 ? 'Eligible next season' : `Class ${req.classYear}`)
      : null
  ].filter(Boolean).join(' • ');

  // Check eligibility for players
  useEffect(() => {
    const checkEligibility = async () => {
      // Skip eligibility check for demo postings (landing page mock data)
      if (posting.id.startsWith('demo-')) {
        setCanApply(true);
        return;
      }
      
      if (!user || user.role !== 'player' || hasApplied) {
        return;
      }

      try {
        setIsCheckingEligibility(true);
        const eligibility = await postingsService.checkEligibility(posting.id);
        setCanApply(eligibility.eligible);
      } catch (err: any) {
        console.error('Error checking eligibility:', err);
        // On error, default to allowing apply (backend will catch it on submission)
        setCanApply(true);
      } finally {
        setIsCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [posting.id, user, hasApplied]);

  // Determine application status text
  const getApplicationStatus = (): string => {
    if (hasApplied) {
      return 'Applied';
    }
    if (isCheckingEligibility) {
      return 'Checking...';
    }
    if (canApply === false) {
      return 'Not Eligible';
    }
    return 'Open';
  };

  return (
    <div className={`bg-proph-grey rounded-2xl p-2 md:p-4 w-full max-w-[600px] mx-auto relative ${
      isDemo ? '' : 'cursor-pointer'
    } ${
      posting.is_general 
        ? 'border-2 border-proph-purple bg-proph-purple/5' 
        : 'border border-proph-grey-text/20'
    }`} onClick={() => !isDemo && navigate(`/posting/${posting.id}`)}>
      {/* Application Status - Top Right */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4">
        <p className="text-xs text-proph-yellow font-semibold bg-proph-yellow/10 px-2 py-0.5 rounded-full">{getApplicationStatus()}</p>
      </div>

      <div className="flex gap-3 md:gap-4 items-center">
        {/* Logo left */}
        {posting.school.logo && (
          <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
            <img
              src={getOptimizedCloudinaryUrl(posting.school.logo, 48, 48)}
              alt={posting.school.name}
              width={48}
              height={48}
              className="w-full h-full rounded-lg object-contain p-0.5 md:p-1"
            />
          </div>
        )}

        {/* Content right */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-0.5 pr-16 md:pr-20">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm md:text-base font-bold text-proph-white truncate">{posting.school.name}</h3>
              {posting.is_general && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-proph-purple/20 border border-proph-purple rounded-full">
                  <span className="text-xs font-semibold text-proph-purple">Open to All</span>
                </div>
              )}
            </div>
            {posting.school.division && (
              <p className="text-xs md:text-sm text-proph-grey-text truncate">
                {[posting.school.division, posting.school.conference].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {/* Position */}
          <div className="flex items-center gap-2">
            <h4 className="text-base md:text-lg font-extrabold text-proph-white">{posting.position}</h4>
          </div>

          {/* Requirements line */}
          {reqString && (
            <p className="text-xs md:text-sm text-proph-grey-text mb-1">{reqString}</p>
          )}

          {/* Bottom row: deadline + button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs md:text-sm text-proph-grey-text">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span>{due}</span>
              </span>
              {posting.applicantCount > 0 && (
                <span>{posting.applicantCount} applied</span>
              )}
            </div>

            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!isDemo) navigate(`/posting/${posting.id}`); 
              }}
              disabled={isDemo}
              className={`flex-shrink-0 bg-proph-yellow text-proph-black text-xs md:text-sm font-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors ${
                isDemo ? 'opacity-75 cursor-default' : 'hover:bg-[#E6D436]'
              }`}
            >
              View Posting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
