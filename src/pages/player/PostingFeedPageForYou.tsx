import React, { useState, useMemo } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { SearchDropdown } from '../../components/layout/SearchDropdown';
import { FilterModal } from '../../components/layout/FilterModal';
import { PostingCardHorizontalMini as PostingCard } from '../../components/posting/PostingCardHorizontalMini';
import { ApplyModalMinC as ApplyModal } from '../../components/application/ApplyModalMinC';
import { useRecommendedPostings, useSearchPostings } from '../../hooks';
import type { Posting } from '../../types';
import { mockPlayer } from '../../data/mockData';
import { Filter } from 'lucide-react';
import type { PostingFilters } from '../../api/postings';

type TabType = 'forYou' | 'all';

interface Filters {
  state?: string[];
  region?: string[];
  division?: string[];
  qualifyOnly?: boolean;
}

// Helper to check if player qualifies for a posting
const doesPlayerQualify = (posting: Posting, player: typeof mockPlayer): boolean => {
  const req = posting.requirements;
  
  // Check height if required
  // Note: In real app would convert to inches and compare properly
  // For now, only checking if requirement exists and isn't "Any height"
  if (req.height && req.height !== 'Any height') {
    // Height comparison would go here in production
  }
  
  // Check class year
  if (req.classYear && player.classYear !== req.classYear) {
    return false;
  }
  
  // Check GPA if required (assuming player GPA is calculated from stats or stored separately)
  // For now, we'll assume player qualifies if class year matches
  // In real app, you'd compare player GPA to req.gpa
  
  return true;
};

// Helper to get region from state
const getRegionFromState = (state: string): string => {
  const west = ['CA', 'WA', 'OR', 'NV', 'AZ', 'CO', 'UT', 'ID', 'MT', 'WY', 'NM', 'AK', 'HI'];
  const midwest = ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'];
  const south = ['TX', 'FL', 'GA', 'NC', 'VA', 'TN', 'AL', 'SC', 'LA', 'MS', 'AR', 'OK', 'KY', 'WV'];
  const northeast = ['NY', 'PA', 'MA', 'NJ', 'CT', 'MD', 'RI', 'NH', 'VT', 'ME', 'DE'];
  
  if (west.includes(state)) return 'West';
  if (midwest.includes(state)) return 'Midwest';
  if (south.includes(state)) return 'South';
  if (northeast.includes(state)) return 'Northeast';
  return '';
};

export const PostingFeedPageForYou: React.FC = () => {
  const [selectedPosting, setSelectedPosting] = useState<Posting | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('forYou');
  const [filters, setFilters] = useState<Filters>({});

  // Fetch recommended postings for "For You" tab
  const { postings: recommendedPostings, loading: recommendedLoading, refetch: refetchRecommended } = useRecommendedPostings();

  // Convert frontend filters to API filters for "All Postings" tab
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

  // Fetch all postings for "All Postings" tab
  const { postings: allPostings, loading: allPostingsLoading, refetch: refetchAllPostings } = useSearchPostings(apiFilters);

  const handleApply = (postingId: string) => {
    const currentPostings = activeTab === 'forYou' ? recommendedPostings : allPostings;
    const posting = currentPostings.find((p) => p.id === postingId);
    if (posting) {
      setSelectedPosting(posting);
    }
  };

  const handleApplicationSuccess = async () => {
    // Refresh postings to update has_applied status
    if (activeTab === 'forYou') {
      await refetchRecommended();
    } else {
      await refetchAllPostings();
    }
  };

  const handleFilterClick = () => {
    setShowFilterModal(!showFilterModal);
    setShowSearchDropdown(false);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  // Get postings based on active tab
  const filteredPostings = useMemo(() => {
    if (activeTab === 'forYou') {
      // For "For You" tab, use recommended postings (already sorted by match score from backend)
      return recommendedPostings;
    } else {
      // For "All Postings" tab, use search results
      // Apply frontend-only filters (region, qualifyOnly) that aren't supported by backend
      let result = [...allPostings];

      // Apply region filter (frontend-only)
      if (filters.region && filters.region.length > 0) {
        result = result.filter(p => {
          const state = p.school.location || '';
          const region = getRegionFromState(state);
          return filters.region!.includes(region);
        });
      }

      // Apply qualify filter (frontend-only)
      if (filters.qualifyOnly) {
        result = result.filter(p => doesPlayerQualify(p, mockPlayer));
      }

      // Backend already sorts by created_at DESC, so we keep that order
      return result;
    }
  }, [activeTab, recommendedPostings, allPostings, filters]);

  const isLoading = activeTab === 'forYou' ? recommendedLoading : allPostingsLoading;

  const hasActiveFilters = Object.values(filters).some(v => 
    Array.isArray(v) ? v.length > 0 : v === true
  );

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-proph-grey-text/20 justify-center">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`pb-3 px-4 font-bold transition-colors ${
              activeTab === 'forYou'
                ? 'text-proph-yellow border-b-2 border-proph-yellow'
                : 'text-proph-grey-text hover:text-proph-white'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 font-bold transition-colors ${
              activeTab === 'all'
                ? 'text-proph-yellow border-b-2 border-proph-yellow'
                : 'text-proph-grey-text hover:text-proph-white'
            }`}
          >
            All Postings
          </button>
        </div>

        {/* Based on your Proph - Only show on For You tab */}
        {activeTab === 'forYou' && (
          <p className="text-sm text-proph-grey-text text-center">Based on your Proph</p>
        )}

        {/* Filter Button - Only show on All Postings tab */}
        {activeTab === 'all' && (
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
        )}

        {/* Posting Feed */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-proph-grey-text">Loading postings...</p>
            </div>
          ) : filteredPostings.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-proph-violet">No postings found</p>
              <p className="text-sm text-proph-violet">
                {activeTab === 'forYou' 
                  ? 'No recommendations available at this time. Check out "All Postings" to see what else is out there!'
                  : 'Try adjusting your filters'}
              </p>
              {activeTab === 'forYou' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-4 bg-proph-yellow hover:bg-proph-yellow/90 text-proph-black font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  View All Postings
                </button>
              )}
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

