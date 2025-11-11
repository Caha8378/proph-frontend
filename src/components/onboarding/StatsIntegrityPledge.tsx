import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface StatsIntegrityPledgeProps {
  onContinue: () => void;
}

export const StatsIntegrityPledge: React.FC<StatsIntegrityPledgeProps> = ({ onContinue }) => {
  const [certified, setCertified] = useState(false);

  return (
    <div className="min-h-screen bg-proph-black flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 
            className="text-proph-yellow text-3xl font-black"
            style={{ 
              textShadow: '0 0 10px rgba(255, 236, 60, 0.5)',
              letterSpacing: '-2px'
            }}
          >
            Proph
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-proph-white text-center mb-4">
          Let's Build Your Proph
        </h2>

        {/* Warning Box */}
        <div className="bg-proph-error/10 border-2 border-proph-error rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <h3 className="text-proph-error text-lg font-bold">
              ⚠️ Stats Integrity Matters
            </h3>
          </div>
          
          <div className="space-y-3 text-proph-white text-sm">
            <p>
              Your stats power our AI evaluation and help coaches find you. Accurate stats 
              lead to the right matches.
            </p>
            
            <p className="font-semibold">
              Our team will verify your stats against official sources.
            </p>
            <p className="font-semibold mt-4">
              Inflated stats result in:
            </p>
            <ul className="space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-proph-error">❌</span>
                <span>Account suspension</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-proph-error">❌</span>
                <span>Wrong program matches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-proph-error">❌</span>
                <span>Wasted opportunities</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => setCertified(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-proph-grey-text/30 bg-proph-grey checked:bg-proph-yellow checked:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20 focus:outline-none cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-proph-white font-semibold text-sm">
              I certify my stats are accurate and understand they will be verified
            </span>
          </div>
        </label>

        {/* Helper Text */}
        <p className="text-proph-grey-text text-sm text-center">
          This takes about 3 minutes. Your Proph will be worth the effort!
        </p>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          disabled={!certified}
          className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 ${
            certified
              ? 'bg-proph-yellow text-proph-black hover:bg-[#E6D436] active:scale-[0.98]'
              : 'bg-proph-grey-light text-proph-grey-text cursor-not-allowed opacity-50'
          }`}
        >
          Let's Go
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

