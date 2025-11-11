import React, { useState } from 'react';
import { X } from 'lucide-react';

type VerificationSource = 'maxpreps' | 'hudl' | 'school' | 'later';

interface VerificationSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (source: VerificationSource, url?: string) => void;
}

export const VerificationSourceModal: React.FC<VerificationSourceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedSource, setSelectedSource] = useState<VerificationSource | null>(null);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | undefined>();

  if (!isOpen) return null;

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setUrlError('URL is required');
      return false;
    }
    
    try {
      const urlObj = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (selectedSource === 'maxpreps' && !hostname.includes('maxpreps')) {
        setUrlError('Please enter a valid MaxPreps URL');
        return false;
      }
      if (selectedSource === 'hudl' && !hostname.includes('hudl')) {
        setUrlError('Please enter a valid Hudl URL');
        return false;
      }
      
      setUrlError(undefined);
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = () => {
    if (selectedSource === 'later') {
      onSubmit('later');
      return;
    }

    if (selectedSource && url) {
      if (validateUrl(url)) {
        onSubmit(selectedSource, url);
      }
    }
  };

  const getPlaceholder = (source: VerificationSource): string => {
    switch (source) {
      case 'maxpreps':
        return 'maxpreps.com/athlete/...';
      case 'hudl':
        return 'hudl.com/profile/...';
      case 'school':
        return 'yourschool.com/athletics/...';
      default:
        return '';
    }
  };

  const getHelperText = (source: VerificationSource): string => {
    switch (source) {
      case 'maxpreps':
        return 'Find your profile at MaxPreps.com';
      case 'hudl':
        return 'Find your profile at Hudl.com';
      case 'school':
        return 'Link to your school\'s official athletics page';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-proph-grey rounded-2xl p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-proph-grey-light rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-proph-white" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-black text-proph-white mb-3">
          🔍 Where Can We Verify Your Stats?
        </h2>

        {/* Subtitle */}
        <p className="text-proph-grey-text text-sm mb-6">
          To ensure fair evaluations for all players, we verify stats against official 
          sources. This protects you and coaches from inaccurate data.
        </p>

        {/* Section Header */}
        <p className="font-semibold text-proph-white mb-4">
          Provide a link to your official stats page:
        </p>

        {/* Radio Options */}
        <div className="space-y-3 mb-6">
          {/* MaxPreps */}
          <label className="flex items-start gap-3 p-4 bg-proph-black rounded-xl border-2 border-transparent hover:border-proph-yellow/30 cursor-pointer transition-colors">
            <input
              type="radio"
              name="verificationSource"
              value="maxpreps"
              checked={selectedSource === 'maxpreps'}
              onChange={() => {
                setSelectedSource('maxpreps');
                setUrl('');
                setUrlError(undefined);
              }}
              className="mt-1 w-5 h-5 text-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
            <div className="flex-1">
              <span className="text-proph-white font-semibold">MaxPreps (Recommended)</span>
              {selectedSource === 'maxpreps' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) validateUrl(e.target.value);
                    }}
                    placeholder={getPlaceholder('maxpreps')}
                    className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                  {urlError && (
                    <p className="text-proph-error text-xs mt-1">{urlError}</p>
                  )}
                  <p className="text-proph-grey-text text-xs mt-1">
                    {getHelperText('maxpreps')}
                  </p>
                </div>
              )}
            </div>
          </label>

          {/* Hudl */}
          <label className="flex items-start gap-3 p-4 bg-proph-black rounded-xl border-2 border-transparent hover:border-proph-yellow/30 cursor-pointer transition-colors">
            <input
              type="radio"
              name="verificationSource"
              value="hudl"
              checked={selectedSource === 'hudl'}
              onChange={() => {
                setSelectedSource('hudl');
                setUrl('');
                setUrlError(undefined);
              }}
              className="mt-1 w-5 h-5 text-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
            <div className="flex-1">
              <span className="text-proph-white font-semibold">Hudl</span>
              {selectedSource === 'hudl' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) validateUrl(e.target.value);
                    }}
                    placeholder={getPlaceholder('hudl')}
                    className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                  {urlError && (
                    <p className="text-proph-error text-xs mt-1">{urlError}</p>
                  )}
                  <p className="text-proph-grey-text text-xs mt-1">
                    {getHelperText('hudl')}
                  </p>
                </div>
              )}
            </div>
          </label>

          {/* School */}
          <label className="flex items-start gap-3 p-4 bg-proph-black rounded-xl border-2 border-transparent hover:border-proph-yellow/30 cursor-pointer transition-colors">
            <input
              type="radio"
              name="verificationSource"
              value="school"
              checked={selectedSource === 'school'}
              onChange={() => {
                setSelectedSource('school');
                setUrl('');
                setUrlError(undefined);
              }}
              className="mt-1 w-5 h-5 text-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
            <div className="flex-1">
              <span className="text-proph-white font-semibold">School Athletics Page</span>
              {selectedSource === 'school' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) validateUrl(e.target.value);
                    }}
                    placeholder={getPlaceholder('school')}
                    className="w-full bg-proph-grey border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                  />
                  {urlError && (
                    <p className="text-proph-error text-xs mt-1">{urlError}</p>
                  )}
                  <p className="text-proph-grey-text text-xs mt-1">
                    {getHelperText('school')}
                  </p>
                </div>
              )}
            </div>
          </label>

          {/* Provide Later */}
          <label className="flex items-start gap-3 p-4 bg-proph-black rounded-xl border-2 border-transparent hover:border-proph-yellow/30 cursor-pointer transition-colors">
            <input
              type="radio"
              name="verificationSource"
              value="later"
              checked={selectedSource === 'later'}
              onChange={() => {
                setSelectedSource('later');
                setUrl('');
                setUrlError(undefined);
              }}
              className="mt-1 w-5 h-5 text-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
            />
            <div className="flex-1">
              <span className="text-proph-white font-semibold">I'll provide later</span>
              <p className="text-proph-grey-text text-xs mt-1">
                (Your profile will show 'Under Review' until verified)
              </p>
            </div>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-proph-grey-light text-proph-white font-semibold py-2.5 px-4 rounded-lg hover:bg-proph-grey-light/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedSource || (selectedSource !== 'later' && !url)}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
              selectedSource && (selectedSource === 'later' || url)
                ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
                : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
            }`}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

