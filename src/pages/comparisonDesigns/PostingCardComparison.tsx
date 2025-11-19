import React from 'react';
import { PostingCardBold } from '../../components/posting/extraDesigns/PostingCardBold';
import { PostingCardHorizontal } from '../../components/posting/extraDesigns/PostingCardHorizontal';
import { PostingCardMaterial } from '../../components/posting/extraDesigns/PostingCardMaterial';
import type { Posting } from '../../types';

const samplePosting: Posting = {
  id: 'demo-1',
  school: { id: 'utsa', name: 'UTSA Roadrunners', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png', division: 'D1', location: 'San Antonio, TX', conference: 'Conference USA' },
  position: 'Point Guard', requirements: { height: "6'3\"", classYear: 2025, gpa: 3.8 },
  deadline: '2026-01-15', applicantCount: 47, matchScore: 89,
  description: 'Elite guard with leadership skills', coachName: 'Austin Claunch', createdAt: new Date().toISOString(),
};

export const PostingCardComparison: React.FC = () => {
  const handleApply = () => alert('Apply clicked');
  return (
    <div className="min-h-screen bg-proph-black text-proph-white p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Posting Card Variants</h1>
        <p className="text-proph-purple">Dark theme • Prominent logos • Yellow CTAs</p>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-bold">Bold Vertical</h2>
            <p className="text-sm text-proph-purple">Centered large logo • Gradient header • Tag requirements</p>
          </div>
          <PostingCardBold posting={samplePosting} onApply={handleApply} />
        </div>
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-bold">Horizontal Compact</h2>
            <p className="text-sm text-proph-purple">Side-by-side layout • Quick scan • Compact action</p>
          </div>
          <PostingCardHorizontal posting={samplePosting} onApply={handleApply} />
        </div>
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-bold">Material Elevated</h2>
            <p className="text-sm text-proph-purple">Floating logo • Gradient hero • Grid requirements</p>
          </div>
          <PostingCardMaterial posting={samplePosting} onApply={handleApply} />
        </div>
      </div>
    </div>
  );
};


