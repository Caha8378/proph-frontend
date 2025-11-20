import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Building2, ArrowRight, Briefcase } from 'lucide-react';
import type { SearchResponse } from '../../api/search';
import { useAuth } from '../../context/authContext';
import { useProfile } from '../../hooks';

interface SearchResultsDropdownProps {
  query: string;
  results: SearchResponse;
  loading: boolean;
  onPlayerClick: (playerId: string | number) => void;
  onClose: () => void;
}

// State abbreviation to full name mapping
const STATE_FULL_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// State name mapping - full names and abbreviations to state code
// Note: New York and NY are prioritized at the start for better matching
const STATE_NAMES: Record<string, string> = {
  // Prioritized: New York first
  'new york': 'NY', 'ny': 'NY',
  // Rest of states
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  // Common abbreviations
  'minn': 'MN', 'cali': 'CA', 'cal': 'CA', 'mass': 'MA', 'conn': 'CT', 'penn': 'PA',
  'virg': 'VA', 'wisc': 'WI', 'mich': 'MI', 'ill': 'IL', 'ind': 'IN', 'miss': 'MS',
  'tenn': 'TN', 'fla': 'FL', 'ga': 'GA', 'nc': 'NC', 'sc': 'SC', 'nj': 'NJ',
  'pa': 'PA', 'ma': 'MA', 'ct': 'CT', 'ri': 'RI', 'nh': 'NH', 'vt': 'VT', 'me': 'ME',
  'md': 'MD', 'de': 'DE', 'va': 'VA', 'wv': 'WV', 'ky': 'KY', 'tn': 'TN', 'al': 'AL',
  'ms': 'MS', 'ar': 'AR', 'la': 'LA', 'ok': 'OK', 'tx': 'TX', 'nm': 'NM', 'az': 'AZ',
  'nv': 'NV', 'ca': 'CA', 'or': 'OR', 'wa': 'WA', 'id': 'ID', 'mt': 'MT', 'wy': 'WY',
  'co': 'CO', 'ut': 'UT', 'nd': 'ND', 'sd': 'SD', 'ne': 'NE', 'ks': 'KS', 'mo': 'MO',
  'ia': 'IA', 'mn': 'MN', 'wi': 'WI', 'il': 'IL', 'in': 'IN', 'mi': 'MI', 'oh': 'OH'
};

// Hardcoded level strings - check these FIRST before states
const LEVEL_STRINGS = ['d1', 'd2', 'd3', 'na', 'nai', 'naia', 'ju', 'juc', 'juco'];

// Helper to find division/level from query (check FIRST before states)
const findLevelInQuery = (query: string): string | null => {
  const lowerQuery = query.toLowerCase().trim();
  
  // Check if query starts with or matches any level string
  for (const levelStr of LEVEL_STRINGS) {
    if (lowerQuery === levelStr || lowerQuery.startsWith(levelStr)) {
      // Map to division code
      if (levelStr.startsWith('d')) {
        return levelStr.toUpperCase(); // 'd1' -> 'D1', 'd2' -> 'D2', 'd3' -> 'D3'
      } else if (levelStr.startsWith('na') || levelStr.startsWith('ju')) {
        return 'NAIA'; // All NAIA/JUCO variations map to NAIA
      }
    }
  }
  
  return null;
};

// Helper to find state from query (check AFTER levels to avoid false matches)
const findStateInQuery = (query: string): string | null => {
  const lowerQuery = query.toLowerCase().trim();
  
  // Convert to array and prioritize New York entries first, then sort by length
  const entries = Object.entries(STATE_NAMES);
  const prioritizedEntries = [
    ...entries.filter(([name]) => name === 'new york' || name === 'ny'),
    ...entries.filter(([name]) => name !== 'new york' && name !== 'ny')
  ].sort((a, b) => {
    // Within each group, sort by length (longer first) for better partial matching
    return b[0].length - a[0].length;
  });
  
  for (const [name, abbrev] of prioritizedEntries) {
    const nameLength = name.length;
    
    // For longer state names (4+ chars), allow partial match from start
    // e.g., "new y" matches "new york", "tex" matches "texas"
    if (nameLength >= 4) {
      if (name.startsWith(lowerQuery) || lowerQuery.startsWith(name) || lowerQuery.includes(name)) {
        return abbrev;
      }
    } else {
      // For short abbreviations (2-3 chars), require word boundaries or exact match
      // This prevents "ia" matching "Iowa" in "NAIA" or "co" matching "Colorado" in "JUCO"
      const regex = new RegExp(`(^|\\s|[^a-z])${name}(\\s|[^a-z]|$)`, 'i');
      if (regex.test(lowerQuery) || lowerQuery === name) {
        return abbrev;
      }
    }
  }
  
  return null;
};

export const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  query,
  results,
  loading,
  onPlayerClick,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  // Check if user is a player (either from auth context or on player home page)
  const isPlayer = user?.role === 'player' || location.pathname.includes('/player/');
  
  // Get player's projected level and extract division (e.g., "D1 - Power 5" -> "D1")
  const getDivisionFromLevel = (level: string | undefined | null): string | null => {
    if (!level) return null;
    // Extract division from formats like "D1 - Power 5", "D2", "D3", "NAIA"
    const match = level.match(/^(D[123]|NAIA)/i);
    return match ? match[1].toUpperCase() : null;
  };
  
  const projectedLevel = profile && 'evaluation' in profile ? profile.evaluation?.level : null;
  const division = getDivisionFromLevel(projectedLevel);
  
  // Find level and state in query (check level FIRST to avoid false state matches)
  const levelInQuery = findLevelInQuery(query);
  const stateInQuery = levelInQuery ? null : findStateInQuery(query); // Only check state if no level found
  
  // Determine posting suggestion text and filter
  const getPostingSuggestion = () => {
    // Priority: level in query > state > player's projected level
    if (levelInQuery) {
      // Special handling for JUCO - show "JUCO" instead of "NAIA" in text
      const displayText = levelInQuery === 'NAIA' && (query.toLowerCase().includes('juco') || query.toLowerCase().includes('junior'))
        ? 'JUCO'
        : levelInQuery;
      return {
        text: `View all ${displayText} postings`,
        filter: { division: levelInQuery }
      };
    } else if (stateInQuery) {
      const stateFullName = STATE_FULL_NAMES[stateInQuery] || stateInQuery;
      return {
        text: `View all ${stateFullName} postings`,
        filter: { state: stateInQuery }
      };
    } else if (division) {
      return {
        text: `View all ${division} postings`,
        filter: { division: division }
      };
    }
    return null;
  };
  
  const postingSuggestion = getPostingSuggestion();
  
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
  
  const handlePostingClick = () => {
    if (!postingSuggestion) return;
    
    // Build URL with filter params
    const params = new URLSearchParams();
    if (postingSuggestion.filter.state) {
      params.set('state', postingSuggestion.filter.state);
    }
    if (postingSuggestion.filter.division) {
      params.set('division', postingSuggestion.filter.division);
    }
    
    navigate(`/player/postings?${params.toString()}`);
    onClose();
  };

  const hasResults = results.players.length > 0 || results.coachingStaffs.length > 0;
  // Show results if: query is 2+ chars AND (has results, loading, or player with posting suggestion)
  const showResults = query.length >= 2 && (hasResults || loading || (isPlayer && postingSuggestion));

  if (!showResults) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-proph-grey border border-proph-grey-text/20 rounded-xl shadow-xl z-50 max-h-[500px] overflow-y-auto">
      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-proph-yellow"></div>
          <p className="text-proph-grey-text text-sm mt-2">Searching...</p>
        </div>
      ) : (
        <div className="py-2">
          {/* Postings Section - Only for players, always show if available */}
          {isPlayer && postingSuggestion && (
            <div>
              <div className="px-4 py-2 border-b border-proph-grey-text/10">
                <h3 className="text-xs font-bold uppercase text-proph-grey-text tracking-wide">
                  Postings
                </h3>
              </div>
              <button
                onClick={handlePostingClick}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-proph-grey-light transition-colors text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-proph-black/40 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-proph-grey-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-proph-white font-semibold group-hover:text-proph-yellow transition-colors">
                    {postingSuggestion.text}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-proph-grey-text group-hover:text-proph-yellow transition-colors flex-shrink-0" />
              </button>
            </div>
          )}

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

          {/* Empty State - Only show if no results and not loading */}
          {!loading && !hasResults && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-proph-grey-text mx-auto mb-2" />
              <p className="text-proph-white text-sm">No results found for "{query}"</p>
              <p className="text-proph-grey-text text-xs mt-1">Try searching for a player name, high school, or college</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

