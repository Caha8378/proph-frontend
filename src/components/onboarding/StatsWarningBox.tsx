import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const StatsWarningBox: React.FC = () => {
  return (
    <div className="bg-proph-error/10 border-2 border-proph-error rounded-xl p-2 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-proph-error flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-proph-error mb-1">
            Accurate Stats Required
          </h4>
          <p className="text-proph-yellow text-xs font-semibold">
            ✅ Use your OFFICIAL season stats from MaxPreps or your school's 
            athletics page.
          </p>
        </div>
      </div>
    </div>
  );
};

