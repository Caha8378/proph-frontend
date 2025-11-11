import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useNotification } from '../../hooks';
import type { PlayerProfile } from '../../types';
import * as playersService from '../../api/players';

interface EditProfileModalProps {
  open: boolean;
  profile: PlayerProfile | null;
  onClose: () => void;
  onSubmit: (data: {
    gpa?: number | null;
    sat?: number | null;
    act?: number | null;
    highlightVideoLink?: string | null;
    phoneNumber?: string | null;
  }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  profile,
  onClose,
  onSubmit,
}) => {
  const { showNotification } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state - initialize with existing values or empty
  const [gpa, setGpa] = useState<string>('');
  const [sat, setSat] = useState<string>('');
  const [act, setAct] = useState<string>('');
  const [highlightVideoLink, setHighlightVideoLink] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    if (open) {
      const o = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = o;
      };
    }
  }, [open]);

  // Fetch and pre-fill form with existing profile data when modal opens
  useEffect(() => {
    if (open) {
      const fetchEditInfo = async () => {
        try {
          setLoading(true);
          const editInfo = await playersService.getPlayerEditInfo();
          
          // Pre-fill form with fetched data
          setGpa(editInfo.gpa != null ? String(editInfo.gpa) : '');
          setSat(editInfo.sat != null ? String(editInfo.sat) : '');
          setAct(editInfo.act != null ? String(editInfo.act) : '');
          setHighlightVideoLink(editInfo.highlight_video_link || '');
          setPhoneNumber(editInfo.phone_number || '');
        } catch (err: any) {
          console.error('Error fetching edit info:', err);
          // Fallback to profile data if API fails
          if (profile) {
            const profileGpa = (profile as any).gpa;
            const profileSat = (profile as any).sat;
            const profileAct = (profile as any).act;
            
            setGpa(profileGpa != null ? String(profileGpa) : '');
            setSat(profileSat != null ? String(profileSat) : '');
            setAct(profileAct != null ? String(profileAct) : '');
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchEditInfo();
    }
  }, [open, profile]);

  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Convert form values to numbers or null
      const submitData = {
        gpa: gpa.trim() === '' ? null : parseFloat(gpa) || null,
        sat: sat.trim() === '' ? null : parseInt(sat) || null,
        act: act.trim() === '' ? null : parseInt(act) || null,
        highlightVideoLink: highlightVideoLink.trim() === '' ? null : highlightVideoLink.trim() || null,
        phoneNumber: phoneNumber.trim() === '' ? null : phoneNumber.trim() || null,
      };

      await onSubmit(submitData);
      showNotification('Profile updated successfully!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-full max-w-md animate-slide-up" style={{ height: '80vh' }}>
          <div className="flex h-full flex-col bg-proph-grey rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10">
            {/* Header */}
            <div className="p-4 bg-proph-grey border-b border-proph-grey-text/10 relative">
              <button
                onClick={onClose}
                className="absolute right-3 top-3 p-2 rounded-lg hover:bg-proph-grey-light"
                disabled={submitting}
              >
                <X className="w-5 h-5 text-proph-white" />
              </button>
              <h2 className="text-xl font-bold text-proph-white pr-8">
                Edit Profile
              </h2>
              <p className="text-sm text-proph-grey-text mt-1">
                All fields are optional. Leave blank to keep current values.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-proph-yellow" />
                </div>
              ) : (
              <div className="space-y-4">
                {/* Academic Info Section */}
                <div>
                  <h3 className="text-lg font-bold text-proph-white mb-3">
                    Academic Information
                  </h3>
                  <p className="text-xs text-proph-grey-text mb-3">
                    Note: Academic information is only visible to coaches. Some postings have academic requirements.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-proph-white font-semibold text-sm mb-1">
                        GPA
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4.0"
                        value={gpa}
                        onChange={(e) => setGpa(e.target.value)}
                        placeholder=""
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                    </div>
                    <div>
                      <label className="block text-proph-white font-semibold text-sm mb-1">
                        SAT
                      </label>
                      <input
                        type="number"
                        min="400"
                        max="1600"
                        value={sat}
                        onChange={(e) => setSat(e.target.value)}
                        placeholder=""
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                    </div>
                    <div>
                      <label className="block text-proph-white font-semibold text-sm mb-1">
                        ACT
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={act}
                        onChange={(e) => setAct(e.target.value)}
                        placeholder=""
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Media Section */}
                <div>
                  <h3 className="text-lg font-bold text-proph-white mb-3">
                    Contact & Media
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-proph-white font-semibold text-sm mb-1">
                        Highlight Video URL
                      </label>
                      <input
                        type="url"
                        value={highlightVideoLink}
                        onChange={(e) => setHighlightVideoLink(e.target.value)}
                        placeholder=""
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                    </div>
                    <div>
                      <label className="block text-proph-white font-semibold text-sm mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder=""
                        className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg px-3 py-2 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-2 focus:ring-proph-yellow/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-proph-grey p-4 space-y-2">
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className={`w-full bg-proph-yellow text-proph-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 ${
                  submitting ? 'opacity-80' : 'hover:bg-[#E6D436]'
                }`}
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                disabled={submitting}
                onClick={onClose}
                className="w-full border-2 border-proph-grey-text text-proph-white font-semibold py-3 rounded-xl hover:bg-proph-grey-light transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

