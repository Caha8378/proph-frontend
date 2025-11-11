import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Building2, ArrowRight } from 'lucide-react';
import type { SearchResponse } from '../../api/search';

interface SearchResultsDropdownProps {
  query: string;
  results: SearchResponse;
  loading: boolean;
  onPlayerClick: (playerId: string | number) => void;
  onClose: () => void;
}

export const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  query,
  results,
  loading,
  onPlayerClick,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleCollegeClick = (college: SearchResponse['coachingStaffs'][0]) => {
    // Try different possible ID fields from backend
    const schoolId = college.school_id || college.id || (college as any).schoolId;
    if (schoolId) {
      navigate(`/school/${schoolId}`);
    } else {
      console.warn('No school ID found for college:', college);
    }
    onClose();
  };

  const hasResults = results.players.length > 0 || results.coachingStaffs.length > 0;
  const showResults = query.length >= 2 && (hasResults || loading);

  if (!showResults) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-proph-grey border border-proph-grey-text/20 rounded-xl shadow-xl z-50 max-h-[500px] overflow-y-auto">
      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-proph-yellow"></div>
          <p className="text-proph-grey-text text-sm mt-2">Searching...</p>
        </div>
      ) : !hasResults ? (
        <div className="p-6 text-center">
          <Search className="w-8 h-8 text-proph-grey-text mx-auto mb-2" />
          <p className="text-proph-white text-sm">No results found for "{query}"</p>
          <p className="text-proph-grey-text text-xs mt-1">Try searching for a player name, high school, or college</p>
        </div>
      ) : (
        <div className="py-2">
          {/* Players Section */}
          {results.players.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-proph-grey-text/10">
                <h3 className="text-xs font-bold uppercase text-proph-grey-text tracking-wide">
                  Recruits ({results.players.length})
                </h3>
              </div>
              <div className="divide-y divide-proph-grey-text/10">
                {results.players.slice(0, 10).map((player) => (
                  <button
                    key={player.id || player.user_id}
                    onClick={() => {
                      onPlayerClick(player.user_id || player.id);
                      onClose();
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-proph-grey-light transition-colors text-left group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-proph-black/40 flex items-center justify-center">
                      {player.profile_image_url ? (
                        <img
                          src={player.profile_image_url}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/defualt.webp';
                          }}
                        />
                      ) : (
                        <User className="w-5 h-5 text-proph-grey-text" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-proph-white font-semibold truncate group-hover:text-proph-yellow transition-colors">
                        {player.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-proph-grey-text">
                        {player.school && (
                          <span className="truncate">{player.school}</span>
                        )}
                        {player.city && player.state && (
                          <span className="truncate">
                            {player.city}, {player.state}
                          </span>
                        )}
                        {player.position && (
                          <span className="truncate">• {player.position}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-proph-grey-text group-hover:text-proph-yellow transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colleges Section */}
          {results.coachingStaffs.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-proph-grey-text/10">
                <h3 className="text-xs font-bold uppercase text-proph-grey-text tracking-wide">
                  Colleges ({results.coachingStaffs.length})
                </h3>
              </div>
              <div className="divide-y divide-proph-grey-text/10">
                {results.coachingStaffs.slice(0, 10).map((college, index) => (
                  <button
                    key={college.id || college.school_id || index}
                    onClick={() => handleCollegeClick(college)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-proph-grey-light transition-colors text-left group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-proph-black/40 flex items-center justify-center">
                      {(college.logo || college.logo_url) ? (
                        <img
                          src={college.logo || college.logo_url}
                          alt={college.school}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/defualt.webp';
                          }}
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-proph-grey-text" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-proph-white font-semibold group-hover:text-proph-yellow transition-colors">
                        {college.school}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-proph-grey-text mt-1">
                        {college.division && (
                          <span>{college.division}</span>
                        )}
                        {college.state && (
                          <span>• {college.state}</span>
                        )}
                        {college.location && !college.state && (
                          <span>• {college.location}</span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <span className="text-xs text-proph-grey-text group-hover:text-proph-yellow transition-colors flex items-center gap-1">
                          View Opportunities
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

