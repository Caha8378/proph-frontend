import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface School {
  id?: string;
  name: string;
  division: string;
  conference?: string;
  email_domain?: string;
  logo_url?: string;
  isManual?: boolean;
}

interface GenderRoleStepProps {
  selectedSchool: School | null;
  name?: string;
  genderCoached: 'mens' | 'womens' | null;
  role: string | null;
  customRole?: string;
  userEmail: string;
  onNameChange: (name: string) => void;
  onGenderChange: (gender: 'mens' | 'womens') => void;
  onRoleChange: (role: string) => void;
  onCustomRoleChange: (customRole: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const GenderRoleStep: React.FC<GenderRoleStepProps> = ({
  selectedSchool,
  name = '',
  genderCoached,
  role,
  customRole,
  userEmail,
  onNameChange,
  onGenderChange,
  onRoleChange,
  onCustomRoleChange,
  onBack,
  onSubmit,
}) => {
  const getEmailDomain = (): string => {
    return userEmail.split('@')[1] || '';
  };

  const getVerificationStatus = (): {
    verified: boolean;
    message: string;
    icon: React.ReactNode;
  } => {
    if (!selectedSchool) {
      return {
        verified: false,
        message: 'Your account will be manually reviewed. You\'ll be able to browse players while we verify.',
        icon: <Clock className="w-4 h-4 text-proph-yellow flex-shrink-0" />,
      };
    }

    const emailDomain = getEmailDomain();
    const isEdu = emailDomain.endsWith('.edu');
    const domainMatches = selectedSchool.email_domain && emailDomain === selectedSchool.email_domain;

    if (isEdu && domainMatches) {
      return {
        verified: true,
        message: 'Your .edu email will be verified automatically. You\'ll have full access immediately.',
        icon: <CheckCircle className="w-5 h-5 text-proph-yellow flex-shrink-0" />,
      };
    }

    return {
      verified: false,
      message: 'Your account will be manually reviewed (24-48 hours). You\'ll be able to browse players while we verify.',
      icon: <Clock className="w-5 h-5 text-proph-yellow flex-shrink-0" />,
    };
  };

  const verificationStatus = getVerificationStatus();

  const canSubmit = (name?.trim() || '') !== '' && genderCoached !== null && role !== null && (role !== 'Other' || customRole?.trim());

  return (
    <>
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-proph-yellow" />
        <div className="w-2 h-2 rounded-full bg-proph-yellow" />
      </div>
      <p className="text-proph-grey-text text-sm text-center mb-4">Step 2 of 2</p>

      <h2 className="text-2xl font-black text-proph-white mb-1">
        Your Role
      </h2>
      <p className="text-proph-grey-text mb-2">
        Tell us about your position
      </p>

      {/* Selected School Summary */}
      {selectedSchool && (
        <div className="bg-proph-grey-light rounded-lg p-3 mb-6 flex items-center gap-3">
          <img
            src={selectedSchool.logo_url || '/defualt.webp'}
            alt={selectedSchool.name}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/defualt.webp';
            }}
          />
          <div>
            <p className="text-proph-white font-semibold text-sm">
              {selectedSchool.name}
            </p>
            <p className="text-proph-grey-text text-xs">
              {selectedSchool.division} • {selectedSchool.conference || 'Independent'}
            </p>
          </div>
        </div>
      )}

      {/* Gender Coached */}
      <div className="mb-2">
        <label className="block text-proph-white font-semibold text-sm mb-2">
          Gender Coached <span className="text-proph-error">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div
            onClick={() => onGenderChange('mens')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onGenderChange('mens');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Select Men's Basketball"
            className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
              genderCoached === 'mens'
                ? 'border-proph-yellow bg-proph-yellow/5'
                : 'border-proph-grey-light hover:border-proph-yellow/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-proph-white text-lg mb-1">
                  Men's Basketball
                </p>
                <p className="text-proph-grey-text text-sm">
                  Coach men's program
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  genderCoached === 'mens'
                    ? 'border-proph-yellow bg-proph-yellow'
                    : 'border-proph-grey-text'
                }`}
              >
                {genderCoached === 'mens' && (
                  <div className="w-3 h-3 rounded-full bg-proph-black" />
                )}
              </div>
            </div>
          </div>

          <div
            onClick={() => onGenderChange('womens')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onGenderChange('womens');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Select Women's Basketball"
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              genderCoached === 'womens'
                ? 'border-proph-yellow bg-proph-yellow/5'
                : 'border-proph-grey-light hover:border-proph-yellow/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-proph-white text-lg mb-1">
                  Women's Basketball
                </p>
                <p className="text-proph-grey-text text-sm">
                  Coach women's program
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  genderCoached === 'womens'
                    ? 'border-proph-yellow bg-proph-yellow'
                    : 'border-proph-grey-text'
                }`}
              >
                {genderCoached === 'womens' && (
                  <div className="w-3 h-3 rounded-full bg-proph-black" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Name Input */}
      <div className="mb-6">
        <label className="block text-proph-white font-semibold text-sm mb-2">
          Full Name <span className="text-proph-error">*</span>
        </label>
        <input
          type="text"
          value={name || ''}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter your full name"
          className="w-full bg-proph-black border border-proph-grey-light rounded-lg px-4 py-3 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
        />
      </div>

      {/* Role */}
      <div className="mb-2">
        <label className="block text-proph-white font-semibold text-sm mb-2">
          Your Role <span className="text-proph-error">*</span>
        </label>
        <select
          value={role || ''}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full bg-proph-black border border-proph-grey-light rounded-lg px-4 py-3 text-proph-white focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
        >
          <option value="">Select your role...</option>
          <option value="Head Coach">Head Coach</option>
          <option value="Assistant Coach">Assistant Coach</option>
          <option value="Associate Head Coach">Associate Head Coach</option>
          <option value="Director of Operations">Director of Operations</option>
          <option value="Director of Player Development">Director of Player Development</option>
          <option value="Graduate Assistant">Graduate Assistant</option>
          <option value="Recruiting Coordinator">Recruiting Coordinator</option>
          <option value="Video Coordinator">Video Coordinator</option>
          <option value="Other">Other</option>
        </select>
        <p className="text-proph-grey-text text-xs mt-1">Select your primary coaching role</p>

        {role === 'Other' && (
          <input
            type="text"
            value={customRole || ''}
            onChange={(e) => onCustomRoleChange(e.target.value)}
            placeholder="Please specify your role"
            className="w-full bg-proph-black border border-proph-grey-light rounded-lg px-4 py-3 text-proph-white mt-2 placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
          />
        )}
      </div>

      {/* Verification Status Indicator */}
      <div className="bg-proph-yellow/10 border border-proph-yellow rounded-lg p-3 mb-6">
        <div className="flex items-start gap-2">
          {verificationStatus.icon}
          <p className="text-proph-white text-xs">{verificationStatus.message}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-proph-grey-light text-proph-white py-3 rounded-lg hover:bg-proph-grey-light/80 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex-1 py-3 rounded-lg font-black transition-all ${
            canSubmit
              ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
              : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
          }`}
        >
          Complete Setup →
        </button>
      </div>
    </>
  );
};

