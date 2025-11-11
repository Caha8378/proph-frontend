import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface HighStat {
  statName: string;
  value: number;
  threshold: number;
}

interface ConsolidatedHighStatWarningProps {
  highStats: HighStat[];
  onConfirm: (confirmed: boolean) => void;
}

export const ConsolidatedHighStatWarning: React.FC<ConsolidatedHighStatWarningProps> = ({
  highStats,
  onConfirm,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Reset confirmation when high stats change
    setConfirmed(false);
    onConfirm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highStats.length]);

  const handleConfirmChange = (checked: boolean) => {
    setConfirmed(checked);
    onConfirm(checked);
  };

  if (highStats.length === 0) {
    return null;
  }

  // Format stat names for display (e.g., "PPG and RPG" or "PPG, RPG, and APG")
  const formatStatNames = (stats: HighStat[]): string => {
    if (stats.length === 1) {
      return stats[0].statName;
    } else if (stats.length === 2) {
      return `${stats[0].statName} and ${stats[1].statName}`;
    } else {
      const names = stats.map(s => s.statName);
      const last = names.pop();
      return `${names.join(', ')}, and ${last}`;
    }
  };

  const statNamesText = formatStatNames(highStats);

  return (
    <div className="mt-4 mb-4 flex items-start gap-3 bg-proph-yellow/10 border border-proph-yellow rounded-lg p-4">
      <AlertCircle className="w-5 h-5 text-proph-yellow flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-proph-yellow font-semibold text-sm mb-2">
          Unusually High Stats Detected
        </p>
        <p className="text-proph-white text-sm mb-3">
          Your {statNamesText} {highStats.length === 1 ? 'stat is' : 'stats are'} unusually high. 
          Please confirm that these stats are true and honest, and that they match your official 
          stats from MaxPreps or your school.
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => handleConfirmChange(e.target.checked)}
            className="w-4 h-4 rounded border-2 border-proph-yellow/50 bg-proph-grey checked:bg-proph-yellow checked:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20 focus:outline-none cursor-pointer"
          />
          <span className="text-proph-white text-sm">
            I confirm these stats are accurate
          </span>
        </label>
      </div>
    </div>
  );
};

