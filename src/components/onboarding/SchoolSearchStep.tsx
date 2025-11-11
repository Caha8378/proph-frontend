import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import * as schoolsService from '../../api/schools';

interface School {
  id: string;
  name: string;
  division: string;
  conference?: string;
  email_domain?: string;
  logo_url?: string;
  mens_program?: boolean;
  womens_program?: boolean;
}

interface SchoolSearchStepProps {
  selectedSchool: School | null;
  onSchoolSelect: (school: School | null) => void;
  onManualSchool: (school: Omit<School, 'id'> & { isManual: true }) => void;
  userEmail: string;
  onContinue: () => void;
}

// Mock data removed - now using API via schoolsService.searchSchools()

export const SchoolSearchStep: React.FC<SchoolSearchStepProps> = ({
  selectedSchool,
  onSchoolSelect,
  onManualSchool,
  userEmail,
  onContinue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  // const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search with API call
  // Backend requires minimum 1 character, but we'll wait for 2 for better UX
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await schoolsService.searchSchools(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching schools:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSchoolSelect = (school: School) => {
    onSchoolSelect(school);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const clearSelection = () => {
    onSchoolSelect(null);
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getEmailDomain = (): string => {
    return userEmail.split('@')[1] || '';
  };

  const showDomainWarning = (): boolean => {
    if (!selectedSchool || !selectedSchool.email_domain) return false;
    return getEmailDomain() !== selectedSchool.email_domain;
  };

  return (
    <>
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-proph-yellow" />
        <div className="w-2 h-2 rounded-full bg-proph-grey-light" />
      </div>
      <p className="text-proph-grey-text text-sm text-center mb-6">Step 1 of 2</p>

      <h2 className="text-2xl font-black text-proph-white mb-2">
        Find Your School
      </h2>
      <p className="text-proph-grey-text mb-6">
        We'll auto-fill your school's details
      </p>

      {/* User Email */}
      <div className="mb-6">
        <p className="text-proph-grey-text text-sm">
          Your Email: <span className="text-proph-white">{userEmail}</span>
        </p>
      </div>

      {/* School Search */}
      <div className="mb-6" ref={containerRef}>
        <label className="block text-proph-white font-semibold text-sm mb-2">
          School / University <span className="text-proph-error">*</span>
        </label>

        {!selectedSchool ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-proph-grey-text" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              placeholder="Search for your school..."
              className="w-full bg-proph-black border border-proph-grey-light rounded-lg pl-10 pr-10 py-3 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowDropdown(false);
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-proph-grey-text hover:text-proph-white cursor-pointer" />
              </button>
            )}

            {/* Dropdown Results */}
            {showDropdown && (searchResults.length > 0 || searchQuery.length >= 1) && (
              <div
                ref={dropdownRef}
                className="absolute top-full mt-2 w-full z-10 bg-proph-grey border border-proph-grey-light rounded-lg shadow-2xl max-h-80 overflow-y-auto"
              >
                {isSearching ? (
                  <div className="p-6 text-center">
                    <p className="text-proph-grey-text text-sm">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((school) => (
                    <div
                      key={school.id}
                      onClick={() => handleSchoolSelect(school)}
                      className="flex items-center gap-3 p-3 hover:bg-proph-grey-light cursor-pointer transition-colors border-b border-proph-grey-light last:border-b-0"
                    >
                      <img
                        src={school.logo_url || '/default-school-logo.png'}
                        alt={school.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-school-logo.png';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-proph-white">{school.name}</p>
                        <p className="text-sm text-proph-grey-text">
                          {school.division} • {school.conference || 'Independent'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-proph-grey-text" />
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-proph-grey-text text-sm mb-3">
                      No schools found matching "{searchQuery}"
                    </p>
                    <div className="text-proph-white text-xs space-y-1 mb-4 text-left max-w-xs mx-auto">
                      <p className="font-semibold mb-2">Tips:</p>
                      <p>• Try searching by location (e.g., "Duke NC")</p>
                      <p>• Check spelling</p>
                      <p>• Use full name (not abbreviation)</p>
                    </div>
                    <button
                      onClick={() => setShowManualEntry(true)}
                      className="text-proph-yellow text-sm font-semibold hover:underline"
                    >
                      + Add School Manually
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Selected School Confirmation
          <div className="border-2 border-proph-yellow bg-proph-yellow/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedSchool.logo_url || '/default-school-logo.png'}
                  alt={selectedSchool.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-school-logo.png';
                  }}
                />
                <div>
                  <p className="font-bold text-proph-white text-lg">
                    {selectedSchool.name}
                  </p>
                  <p className="text-sm text-proph-grey-text">
                    {selectedSchool.division} • {selectedSchool.conference || 'Independent'}
                  </p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-proph-yellow flex-shrink-0" />
            </div>
            <button
              onClick={clearSelection}
              className="text-proph-yellow text-sm font-semibold hover:underline"
            >
              Change School
            </button>
          </div>
        )}
      </div>

      {/* Email Domain Mismatch Warning */}
      {selectedSchool && showDomainWarning() && (
        <div className="mt-4 bg-proph-yellow/10 border border-proph-yellow rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-proph-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-proph-yellow font-semibold text-sm mb-1">
                Email domain doesn't match
              </p>
              <p className="text-proph-white text-sm">
                Your email ({userEmail}) doesn't match {selectedSchool.name}'s 
                official domain ({selectedSchool.email_domain}). You'll need to 
                submit proof of employment for verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Button (when no selection) */}
      {!selectedSchool && !showDropdown && (
        <button
          onClick={() => setShowManualEntry(true)}
          className="text-proph-yellow text-sm font-semibold hover:underline mb-6 block"
        >
          + Add School Manually
        </button>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={!selectedSchool}
        className={`w-full py-3 rounded-lg font-black text-base transition-all ${
          selectedSchool
            ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
            : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
        }`}
      >
        Continue to Role →
      </button>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualSchoolModal
          onClose={() => setShowManualEntry(false)}
          onSave={(school) => {
            onManualSchool({ ...school, isManual: true });
            setShowManualEntry(false);
          }}
        />
      )}
    </>
  );
};

interface ManualSchoolModalProps {
  onClose: () => void;
  onSave: (school: Omit<School, 'id'>) => void;
}

const ManualSchoolModal: React.FC<ManualSchoolModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const [conference, setConference] = useState('');
  const [emailDomain, setEmailDomain] = useState('');

  const canSave = name.trim() !== '' && division !== '';

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      division,
      conference: conference.trim() || undefined,
      email_domain: emailDomain.trim().replace('@', '') || undefined,
      logo_url: undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-proph-grey rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-proph-white">
            Manually Enter School Info
          </h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-proph-grey-text hover:text-proph-white" />
          </button>
        </div>

        <p className="text-proph-grey-text text-sm mb-6">
          For schools not in our database (e.g., JUCO programs)
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-proph-white font-semibold text-sm mb-2">
              School Name <span className="text-proph-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your College Name"
              className="w-full bg-proph-black border border-proph-grey-light rounded-lg px-4 py-3 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
            />
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-2">
              Division <span className="text-proph-error">*</span>
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full bg-proph-black border border-proph-grey-light rounded-lg px-4 py-3 text-proph-white focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
            >
              <option value="">Select division...</option>
              <option value="D1">NCAA Division I</option>
              <option value="D2">NCAA Division II</option>
              <option value="D3">NCAA Division III</option>
              <option value="NAIA">NAIA</option>
              <option value="JUCO">JUCO</option>
            </select>
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-2">
              Conference (Optional)
            </label>
            <input
              type="text"
              value={conference}
              onChange={(e) => setConference(e.target.value)}
              placeholder="e.g., Big Ten, SWAC, Independent"
              className="w-full bg-proph-black border border-proph-grey-light rounded-lg px-4 py-3 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
            />
            <p className="text-proph-grey-text text-xs mt-1">Leave blank if independent</p>
          </div>

          <div>
            <label className="block text-proph-white font-semibold text-sm mb-2">
              School Email Domain (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-proph-grey-text">@</span>
              <input
                type="text"
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                placeholder="yourschool.edu"
                className="w-full bg-proph-black border border-proph-grey-light rounded-lg pl-8 pr-4 py-3 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
              />
            </div>
            <p className="text-proph-grey-text text-xs mt-1">Official school email domain (if applicable)</p>
          </div>
        </div>

        <div className="bg-proph-yellow/10 border border-proph-yellow rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-proph-yellow flex-shrink-0" />
            <p className="text-proph-white text-sm">
              Manually entered schools will be verified by our team. You'll need 
              to provide proof of employment.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-proph-grey-light text-proph-white py-3 rounded-lg hover:bg-proph-grey-light/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              canSave
                ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
                : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
            }`}
          >
            Save School →
          </button>
        </div>
      </div>
    </div>
  );
};

