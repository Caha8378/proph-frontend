import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface HighStatWarningProps {
  statName: string;
  value: number;
  threshold: number;
  onConfirm: (confirmed: boolean) => void;
}

export const HighStatWarning: React.FC<HighStatWarningProps> = ({
  statName,
  value,
  threshold: _threshold,
  onConfirm,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirmChange = (checked: boolean) => {
    setConfirmed(checked);
    onConfirm(checked);
  };

  return (
    <div className="mt-2 flex items-start gap-2 bg-proph-yellow/10 border border-proph-yellow rounded-lg p-3">
      <AlertCircle className="w-5 h-5 text-proph-yellow flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-proph-yellow font-semibold text-sm mb-1">
          This stat seems unusually high
        </p>
        <p className="text-proph-white text-sm mb-2">
          {value} {statName} is higher than 95% of high school players. 
          Double-check this is your official stat from MaxPreps or your school.
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => handleConfirmChange(e.target.checked)}
            className="w-4 h-4 rounded border-2 border-proph-yellow/50 bg-proph-grey checked:bg-proph-yellow checked:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20 focus:outline-none cursor-pointer"
          />
          <span className="text-proph-white text-xs">
            I confirm this stat is accurate
          </span>
        </label>
      </div>
    </div>
  );
};

