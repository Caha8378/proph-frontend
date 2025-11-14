import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { PlayerCardFinal1 as PlayerCard } from '../../components/player/PlayerCardFinal1';
import { Share2, Camera, Edit } from 'lucide-react';
import { useProfile } from '../../hooks';
import { trackEvent } from '../../api/notifications';
import type { PlayerProfile } from '../../types';
import { UploadImageModal } from '../../components/player/UploadImageModal';
import { EditProfileModal } from '../../components/player/EditProfileModal';
import * as playersService from '../../api/players';
import * as authService from '../../api/auth';

export const ProfilePage: React.FC = () => {
  const { profile, loading, error, refetch } = useProfile(); // Gets current player's profile
  const [uploadImageModalOpen, setUploadImageModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const handleShare = async () => {
    if (!profile) return;
    
    // Track card shared event
    if (profile.id) {
      trackEvent({
        eventType: 'card_shared',
        targetUserId: profile.id,
        metadata: {
          shareMethod: (typeof navigator !== 'undefined' && navigator.share && typeof navigator.share === 'function') ? 'native_share' : 'clipboard',
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    // Generate shareable link
    const link = `https://proph.com/p/${profile.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${(profile as any).name || 'Player'} - Proph Profile`,
        url: link,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };

  const handleImageUpload = async (file: File): Promise<void> => {
    await authService.uploadProfileImage(file);
    // After successful upload, refetch profile
    if (refetch) {
      await refetch();
    }
  };

  const handleProfileUpdate = async (data: {
    gpa?: number | null;
    sat?: number | null;
    act?: number | null;
    highlightVideoLink?: string | null;
    phoneNumber?: string | null;
  }): Promise<void> => {
    // Map frontend field names to backend field names
    // Explicitly convert undefined to null (SQL requires null, not undefined)
    await playersService.updatePlayerProfileEdit({
      gpa: data.gpa !== undefined ? data.gpa : null,
      sat: data.sat !== undefined ? data.sat : null,
      act: data.act !== undefined ? data.act : null,
      highlightVideo: data.highlightVideoLink !== undefined ? data.highlightVideoLink : null,
      phone_number: data.phoneNumber !== undefined ? data.phoneNumber : null,
    });
    // After successful update, refetch profile
    if (refetch) {
      await refetch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-proph-black pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-proph-grey-text">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-proph-black pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-proph-error">{error || 'Failed to load profile'}</p>
          </div>
        </main>
      </div>
    );
  }

  // Type guard: Check if profile is a PlayerProfile (has required PlayerProfile fields)
  const isPlayerProfile = (p: any): p is PlayerProfile => {
    return p && typeof p.name === 'string' && typeof p.position === 'string' && typeof p.school === 'string';
  };

  if (!isPlayerProfile(profile)) {
    return (
      <div className="min-h-screen bg-proph-black pb-20">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-proph-error">This page is only available for players</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Player Card */}
        <div className="flex justify-center">
          <PlayerCard player={profile} />
        </div>

        {/* Share Button */}
        <div className="w-full max-w-[600px] mx-auto">
          <button 
            className="w-full bg-proph-yellow text-proph-black font-black py-4 md:py-5 rounded-xl hover:bg-[#E6D436] transition-colors text-base md:text-lg" 
            onClick={handleShare}
          >
            <span className="flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5 md:w-6 md:h-6" />
              Share My Proph
            </span>
          </button>
        </div>

        {/* Profile Settings */}
        <div className="space-y-4 max-w-[600px] mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-proph-white">
            Profile Settings
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setUploadImageModalOpen(true)}
              className="bg-proph-grey border border-proph-purple/20 rounded-lg p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 hover:border-proph-purple/40 transition-colors"
            >
              <Camera className="w-6 h-6 md:w-8 md:h-8 text-proph-yellow" />
              <span className="text-sm md:text-base font-semibold text-proph-white">
                Update Photo
              </span>
            </button>

            <button 
              onClick={() => setEditProfileModalOpen(true)}
              className="bg-proph-grey border border-proph-purple/20 rounded-lg p-4 md:p-6 flex flex-col items-center gap-2 md:gap-3 hover:border-proph-purple/40 transition-colors"
            >
              <Edit className="w-6 h-6 md:w-8 md:h-8 text-proph-yellow" />
              <span className="text-sm md:text-base font-semibold text-proph-white">
                Edit Profile
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <UploadImageModal
        open={uploadImageModalOpen}
        currentPhoto={profile?.photo}
        onClose={() => setUploadImageModalOpen(false)}
        onSubmit={handleImageUpload}
      />

      <EditProfileModal
        open={editProfileModalOpen}
        profile={profile}
        onClose={() => setEditProfileModalOpen(false)}
        onSubmit={handleProfileUpdate}
      />

      <BottomNav
        hasApplicationUpdate={false}
        hasProfileUpdate={false}
      />
    </div>
  );
};
