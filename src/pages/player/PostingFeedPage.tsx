import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { SearchDropdown } from '../../components/layout/SearchDropdown';
import { FilterModal } from '../../components/layout/FilterModal';
import { PostingCardHorizontalMini as PostingCard } from '../../components/posting/PostingCardHorizontalMini';
import { ApplyModalMinC as ApplyModal } from '../../components/application/ApplyModalMinC';
import { useSearchPostings } from '../../hooks';
import type { Posting } from '../../types';
import { Filter } from 'lucide-react';
import type { PostingFilters } from '../../api/postings';
import { useSearchParams } from 'react-router-dom';

interface Filters {
  state?: string[];
  division?: string[];
  qualifyOnly?: boolean;
}

// Helper to get region from state - COMMENTED OUT FOR NOW
// const getRegionFromState = (state: string): string => {
//   const west = ['CA', 'WA', 'OR', 'NV', 'AZ', 'CO', 'UT', 'ID', 'MT', 'WY', 'NM', 'AK', 'HI'];
//   const midwest = ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'];
//   const south = ['TX', 'FL', 'GA', 'NC', 'VA', 'TN', 'AL', 'SC', 'LA', 'MS', 'AR', 'OK', 'KY', 'WV'];
//   const northeast = ['NY', 'PA', 'MA', 'NJ', 'CT', 'MD', 'RI', 'NH', 'VT', 'ME', 'DE'];
//   
//   if (west.includes(state)) return 'West';
//   if (midwest.includes(state)) return 'Midwest';
//   if (south.includes(state)) return 'South';
//   if (northeast.includes(state)) return 'Northeast';
//   return '';
// };

export const PostingFeedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Initialize filters from URL params
  const initialFilters: Filters = useMemo(() => {
    const urlFilters: Filters = {};
    const division = searchParams.get('division');
    const state = searchParams.get('state');
    
    if (division) {
      urlFilters.division = [division];
    }
    if (state) {
      urlFilters.state = [state];
    }
    
    return urlFilters;
  }, [searchParams]);
  
  const [filters, setFilters] = useState<Filters>(initialFilters);
  
  // Update filters when URL params change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Convert frontend filters to API filters
  const apiFilters: PostingFilters = useMemo(() => {
    const apiFilter: PostingFilters = {};
    
    // Convert division filter (array to single value - backend expects single value)
    if (filters.division && filters.division.length > 0) {
      // For now, take first division. Could be enhanced to support multiple
      apiFilter.division = filters.division[0];
    }
    
    // Convert state filter (array to single value)
    if (filters.state && filters.state.length > 0) {
      apiFilter.state = filters.state[0];
    }
    
    // Note: position, graduation_year, school_name would come from search dropdown
    // region and qualifyOnly are frontend-only filters
    
    return apiFilter;
  }, [filters]);

  // Fetch all postings
  const { postings: allPostings, loading: allPostingsLoading, refetch: refetchAllPostings } = useSearchPostings(apiFilters);

  const handleApply = (postingId: string) => {
    const posting = allPostings.find((p) => p.id === postingId);
    if (posting) {
      setSelectedPosting(posting);
    }
  };

  const handleApplicationSuccess = async () => {
    // Refresh postings to update has_applied status
    await refetchAllPostings();
  };

  const handleFilterClick = () => {
    setShowFilterModal(!showFilterModal);
    setShowSearchDropdown(false);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  // Apply frontend-only filters that aren't supported by backend
  const filteredPostings = useMemo(() => {
    let result = [...allPostings];

    // Apply qualify filter - hide postings already applied to
    // Note: Full eligibility check would require backend to return can_apply on each posting
    if (filters.qualifyOnly) {
      result = result.filter(p => !(p as any).hasApplied);
    }

    // Backend already sorts by created_at DESC, so we keep that order
    return result;
  }, [allPostings, filters]);

  const hasActiveFilters = Object.values(filters).some(v => 
    Array.isArray(v) ? v.length > 0 : v === true
  );

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filter Button */}
        <div className="w-full max-w-[600px] mx-auto">
          <button
            onClick={handleFilterClick}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-colors ${
              hasActiveFilters
                ? 'bg-proph-yellow/20 border-proph-yellow text-proph-yellow'
                : 'bg-proph-grey border-proph-grey-text/20 text-proph-white hover:bg-proph-grey-light'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="font-semibold">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-proph-yellow text-proph-black text-xs font-bold rounded-full">
                {Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v === true).length}
              </span>
            )}
          </button>
        </div>

        {/* Posting Feed */}
        <div className="space-y-4">
          {allPostingsLoading ? (
            <div className="text-center py-12">
              <p className="text-proph-grey-text">Loading postings...</p>
            </div>
          ) : filteredPostings.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-proph-violet">No postings found</p>
              <p className="text-sm text-proph-violet">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filteredPostings.map((posting) => (
              <PostingCard
                key={posting.id}
                posting={posting}
                onApply={handleApply}
              />
            ))
          )}
        </div>
      </main>

      {/* Search Dropdown */}
      {showSearchDropdown && (
        <SearchDropdown
          isOpen={showSearchDropdown}
          onClose={() => setShowSearchDropdown(false)}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      )}

      {/* Apply Modal */}
      {selectedPosting && (
        <ApplyModal
          open={!!selectedPosting}
          onClose={() => setSelectedPosting(null)}
          posting={selectedPosting}
          onSuccess={handleApplicationSuccess}
        />
      )}

      <BottomNav 
        hasApplicationUpdate={false}
        hasProfileUpdate={false}
      />
    </div>
  );
};
