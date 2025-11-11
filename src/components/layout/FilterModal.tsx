import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ChevronDown, Search } from 'lucide-react';

export interface Filters {
  state?: string[];
  region?: string[];
  division?: string[];
  qualifyOnly?: boolean;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange?: (filters: Filters) => void;
  initialFilters?: Filters;
  variant?: 'minimal' | 'bold' | 'glass';
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onFilterChange,
  initialFilters = {},
  variant = 'minimal',
}) => {
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(initialFilters.division || []);
  const [selectedStates, setSelectedStates] = useState<string[]>(initialFilters.state || []);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(initialFilters.region || []);
  const [qualifyOnly, setQualifyOnly] = useState<boolean>(initialFilters.qualifyOnly || false);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');

  // Sync with initialFilters when they change
  useEffect(() => {
    setSelectedDivisions(initialFilters.division || []);
    setSelectedStates(initialFilters.state || []);
    setSelectedRegions(initialFilters.region || []);
    setQualifyOnly(initialFilters.qualifyOnly || false);
  }, [initialFilters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!stateDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-state-dropdown]')) {
        setStateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [stateDropdownOpen]);

  const divisions = ['D1', 'D2', 'D3', 'NAIA'];
  const allStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  const regions = ['West', 'Midwest', 'South', 'Northeast'];

  // Filter states based on search query
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery) return allStates;
    const query = stateSearchQuery.toUpperCase();
    return allStates.filter(state => state.includes(query));
  }, [stateSearchQuery]);

  if (!isOpen) return null;

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAll = () => {
    setSelectedDivisions([]);
    setSelectedStates([]);
    setSelectedRegions([]);
    setQualifyOnly(false);
  };

  const handleApply = () => {
    const filters: Filters = {
      division: selectedDivisions.length > 0 ? selectedDivisions : undefined,
      state: selectedStates.length > 0 ? selectedStates : undefined,
      region: selectedRegions.length > 0 ? selectedRegions : undefined,
      qualifyOnly: qualifyOnly || undefined,
    };
    
    if (onFilterChange) {
      onFilterChange(filters);
    }
    onClose();
  };

  // Styling variants
  const modalClass = variant === 'bold'
    ? 'bg-proph-grey rounded-b-3xl border-b-4 border-x-2 border-proph-yellow/20'
    : variant === 'glass'
    ? 'bg-proph-grey/95 backdrop-blur-2xl'
    : 'bg-proph-grey';

  const sectionClass = variant === 'bold'
    ? 'text-base font-black uppercase tracking-wide'
    : variant === 'glass'
    ? 'text-sm font-bold uppercase tracking-wide'
    : 'text-xs font-bold uppercase tracking-wide';

  const chipClass = (isSelected: boolean) => {
    if (variant === 'bold') {
      return `px-4 py-3 rounded-xl border-2 transition-all ${
        isSelected
          ? 'bg-proph-yellow text-proph-black border-proph-yellow'
          : 'bg-proph-grey-light text-proph-white border-proph-grey-text/20 hover:border-proph-yellow'
      } font-bold text-base`;
    }
    if (variant === 'glass') {
      return `px-3 py-2 rounded-lg border transition-all backdrop-blur-sm ${
        isSelected
          ? 'bg-proph-yellow/30 text-proph-yellow border-proph-yellow/50'
          : 'bg-proph-white/10 text-proph-white border-proph-grey-text/30 hover:bg-proph-yellow/10 hover:border-proph-yellow/40'
      } text-sm`;
    }
    return `px-3 py-2 rounded-lg border transition-all ${
      isSelected
        ? 'bg-proph-yellow text-proph-black border-proph-yellow'
        : 'bg-proph-grey-light text-proph-white border-proph-grey-text/20 hover:border-proph-yellow'
    } text-sm`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${modalClass} animate-in slide-in-from-top duration-300 max-h-[80vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`sticky top-0 ${modalClass} ${variant === 'bold' ? 'p-6' : 'p-4'} border-b border-proph-grey-text/20 flex items-center justify-between`}>
          <h2 className={`${variant === 'bold' ? 'text-2xl' : 'text-xl'} font-black text-proph-white`}>
            Filters
          </h2>
          <button
            onClick={onClose}
            className={`${
              variant === 'bold' ? 'p-3' : 'p-2'
            } hover:bg-proph-grey-light rounded-lg transition-colors`}
          >
            <X className={`${variant === 'bold' ? 'w-6 h-6' : 'w-5 h-5'} text-proph-white`} />
          </button>
        </div>

        {/* Content */}
        <div className={variant === 'bold' ? 'p-6 space-y-6' : 'p-4 space-y-5'}>
          {/* State Dropdown */}
          <div className="relative" data-state-dropdown>
            <p className={`${sectionClass} text-proph-yellow mb-3`}>State</p>
            <button
              onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
              className={`w-full ${variant === 'bold' ? 'py-4 px-4' : 'py-3 px-3'} rounded-xl border-2 transition-all flex items-center justify-between ${
                selectedStates.length > 0
                  ? 'bg-proph-yellow/20 border-proph-yellow text-proph-yellow'
                  : 'bg-proph-grey-light border-proph-grey-text/20 text-proph-white hover:border-proph-yellow'
              }`}
            >
              <span className="font-semibold">
                {selectedStates.length === 0
                  ? 'Select states'
                  : selectedStates.length === 1
                  ? selectedStates[0]
                  : `${selectedStates.length} states selected`}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${stateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {stateDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 z-50 bg-proph-grey border border-proph-grey-text/20 rounded-lg shadow-2xl max-h-96 overflow-hidden flex flex-col" data-state-dropdown>
                {/* Search Input */}
                <div className="p-3 border-b border-proph-grey-text/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-proph-grey-text" />
                    <input
                      type="text"
                      placeholder="Search states..."
                      value={stateSearchQuery}
                      onChange={(e) => setStateSearchQuery(e.target.value)}
                      className="w-full bg-proph-black text-proph-white px-4 py-2 pl-10 rounded-lg border border-proph-grey-text/20 focus:border-proph-yellow focus:outline-none text-sm"
                      autoFocus
                    />
                  </div>
                </div>

                {/* State List */}
                <div className="overflow-y-auto max-h-64">
                  {filteredStates.length === 0 ? (
                    <div className="p-4 text-center text-sm text-proph-grey-text">
                      No states found
                    </div>
                  ) : (
                    filteredStates.map((state) => {
                      const isSelected = selectedStates.includes(state);
                      return (
                        <label
                          key={state}
                          className="flex items-center gap-3 p-3 hover:bg-proph-grey-light cursor-pointer border-b border-proph-grey-text/10 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStates([...selectedStates, state]);
                              } else {
                                setSelectedStates(selectedStates.filter(s => s !== state));
                              }
                            }}
                            className="w-4 h-4 rounded border-proph-grey-text/20 bg-proph-black text-proph-yellow focus:ring-proph-yellow focus:ring-2"
                          />
                          <span className="text-sm text-proph-white flex-1">{state}</span>
                          {isSelected && <Check className="w-4 h-4 text-proph-yellow" />}
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-2 border-t border-proph-grey-text/20 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStates([]);
                      setStateSearchQuery('');
                    }}
                    className="flex-1 text-sm text-proph-grey-text hover:text-proph-white py-2 rounded-lg hover:bg-proph-grey-light transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setStateDropdownOpen(false);
                      setStateSearchQuery('');
                    }}
                    className="flex-1 text-sm bg-proph-yellow text-proph-black font-bold py-2 rounded-lg hover:bg-[#E6D436] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Region */}
          <div>
            <p className={`${sectionClass} text-proph-yellow mb-3`}>Region</p>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => toggleSelection(region, selectedRegions, setSelectedRegions)}
                  className={chipClass(selectedRegions.includes(region))}
                >
                  <span className="flex items-center gap-2">
                    {selectedRegions.includes(region) && <Check className={variant === 'bold' ? 'w-5 h-5' : 'w-4 h-4'} />}
                    {region}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Division */}
          <div>
            <p className={`${sectionClass} text-proph-yellow mb-3`}>Division</p>
            <div className="flex flex-wrap gap-2">
              {divisions.map((division) => (
                <button
                  key={division}
                  onClick={() => toggleSelection(division, selectedDivisions, setSelectedDivisions)}
                  className={chipClass(selectedDivisions.includes(division))}
                >
                  <span className="flex items-center gap-2">
                    {selectedDivisions.includes(division) && <Check className={variant === 'bold' ? 'w-5 h-5' : 'w-4 h-4'} />}
                    {division}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Do I Qualify Toggle */}
          <div>
            <p className={`${sectionClass} text-proph-yellow mb-3`}>Filters</p>
            <button
              onClick={() => setQualifyOnly(!qualifyOnly)}
              className={`w-full ${variant === 'bold' ? 'py-4 px-4' : 'py-3 px-3'} rounded-xl border-2 transition-all flex items-center justify-between ${
                qualifyOnly
                  ? 'bg-proph-yellow/20 border-proph-yellow text-proph-yellow'
                  : 'bg-proph-grey-light border-proph-grey-text/20 text-proph-white hover:border-proph-yellow'
              }`}
            >
              <span className="font-semibold">Show only postings I qualify for</span>
              {qualifyOnly && <Check className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`sticky bottom-0 ${modalClass} ${variant === 'bold' ? 'p-6' : 'p-4'} border-t border-proph-grey-text/20 flex gap-3`}>
          <button
            onClick={clearAll}
            className={`flex-1 ${
              variant === 'bold' ? 'py-4' : 'py-3'
            } border-2 border-proph-grey-text text-proph-white font-bold rounded-xl hover:bg-proph-grey-light transition-colors`}
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className={`flex-1 ${
              variant === 'bold' ? 'py-4' : 'py-3'
            } bg-proph-yellow text-proph-black font-black rounded-xl hover:bg-[#E6D436] transition-colors`}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};
