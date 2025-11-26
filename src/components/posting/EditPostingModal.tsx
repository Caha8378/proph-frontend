import React, { useEffect, useState } from 'react';
import type { Posting } from '../../types';
import { X, ArrowLeft, Info } from 'lucide-react';
import { useNotification } from '../../hooks';

// Helper functions for height conversion
const inchesToFeetAndInches = (totalInches: number | undefined | null): { feet: number; inches: number } => {
  if (!totalInches || totalInches <= 0) return { feet: 0, inches: 0 };
  return {
    feet: Math.floor(totalInches / 12),
    inches: totalInches % 12
  };
};

const feetAndInchesToInches = (feet: number, inches: number): number => {
  return (feet * 12) + inches;
};

// Parse height from various formats (inches number, string like "6'2"", etc.)
const parseHeightToInches = (height: any): number | undefined => {
  if (!height) return undefined;
  if (typeof height === 'number') return height;
  if (typeof height === 'string') {
    // Try to parse "6'2"" format
    const match = height.match(/(\d+)'(\d+)"/);
    if (match) {
      const feet = parseInt(match[1], 10);
      const inches = parseInt(match[2], 10);
      return feetAndInchesToInches(feet, inches);
    }
    // Try to parse just a number
    const num = parseInt(height, 10);
    if (!isNaN(num)) return num;
  }
  return undefined;
};

interface EditPostingModalProps {
  posting: Posting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPosting: Partial<Posting>) => void;
  onClosePosting: (postingId: string) => void;
}

export const EditPostingModal: React.FC<EditPostingModalProps> = ({ posting, isOpen, onClose, onSave, onClosePosting }) => {
  const { showNotification } = useNotification();
  const [form, setForm] = useState<Partial<Posting>>({});
  const [heightFeet, setHeightFeet] = useState<number>(0);
  const [heightInches, setHeightInches] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Extract single graduation year from class array or use classYear directly
    const classYear = posting.requirements?.classYear || 
      (Array.isArray(posting.requirements?.class) && posting.requirements.class.length > 0 
        ? posting.requirements.class[0] 
        : undefined);
    
    // Parse height from posting (could be in inches, or string format)
    // Check if there's a heightInches field first (from backend), then fall back to height
    const heightInInches = (posting.requirements as any)?.heightInches || 
                          parseHeightToInches(posting.requirements?.height);
    const { feet, inches } = inchesToFeetAndInches(heightInInches);
    
    setForm({
      position: posting.position,
      requirements: { ...posting.requirements, classYear },
      deadline: posting.deadline,
      description: posting.description,
    });
    setHeightFeet(feet);
    setHeightInches(inches);
  }, [isOpen, posting]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isGeneralPosting = posting?.is_general === true;

  const handleChange = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const handleReqChange = (key: string, value: any) => setForm(prev => ({ ...prev, requirements: { ...(prev.requirements || {}), [key]: value } }));

  const handleSave = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      
      // For general postings, only send description
      if (isGeneralPosting) {
        const formToSave = {
          description: form.description || posting.description,
        };
        await onSave(formToSave);
      } else {
        // Convert height to inches before saving
        const heightInInches = (heightFeet > 0 || heightInches > 0) 
          ? feetAndInchesToInches(heightFeet, heightInches) 
          : undefined;
        
        const formToSave = {
          ...form,
          requirements: {
            ...form.requirements,
            heightInches: heightInInches, // Store as heightInches for API
          }
        };
        
        await onSave(formToSave);
      }
      
      showNotification('Posting updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error updating posting:', err);
      showNotification(err.message || 'Failed to update posting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmClosePosting = () => {
    if (window.confirm('Mark this posting as filled? It will no longer accept applications.')) {
      onClosePosting(posting.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-full max-w-md h-[85vh] bg-proph-grey rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-proph-grey-text/10 bg-proph-grey">
            <button className="p-2 rounded-lg hover:bg-proph-grey-light" onClick={onClose} aria-label="Back">
              <ArrowLeft className="w-5 h-5 text-proph-white" />
            </button>
            <div className="text-proph-white font-bold">Edit Posting</div>
            <button className="p-2 rounded-lg hover:bg-proph-grey-light" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5 text-proph-white" />
            </button>
          </div>

          {/* Body */}
          <div className="h-[calc(85vh-180px)] overflow-y-auto p-4 space-y-4">
            {/* Warning banner for general postings */}
            {isGeneralPosting && (
              <div className="bg-proph-purple/10 border border-proph-purple rounded-lg p-4 mb-2">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-proph-purple flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-proph-white">General Interest Posting</p>
                    <p className="text-sm text-proph-grey-text mt-1">
                      Only the description can be edited for general interest postings. 
                      Title and requirements are fixed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Position *</label>
              <select 
                value={(form.position as string) || posting.position} 
                onChange={(e) => handleChange('position', e.target.value)} 
                disabled={isGeneralPosting}
                className={`w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white ${isGeneralPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Class - Single Selection */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Graduation Year *</label>
              <select
                value={form.requirements?.classYear !== undefined && form.requirements?.classYear !== null ? String(form.requirements.classYear) : ''}
                onChange={(e) => handleReqChange('classYear', e.target.value === '' ? undefined : Number(e.target.value))}
                disabled={isGeneralPosting}
                className={`w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white focus:outline-none focus:border-proph-yellow transition-colors ${isGeneralPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Select graduation year</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="1">Any Eligibility Next Season</option>
              </select>
            </div>

            {/* GPA */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Minimum GPA</label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="4" 
                value={(form.requirements?.gpa ?? posting.requirements.gpa) as any} 
                onChange={(e) => handleReqChange('gpa', e.target.value === '' ? undefined : Number(e.target.value))} 
                disabled={isGeneralPosting}
                className={`w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white ${isGeneralPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="e.g., 3.0" 
              />
            </div>

            {/* Height - Feet and Inches */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Minimum Height (Optional)</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-proph-grey-text mb-1">Feet</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={heightFeet || ''}
                    onChange={(e) => setHeightFeet(Number(e.target.value) || 0)}
                    disabled={isGeneralPosting}
                    className={`w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white placeholder:text-proph-grey-text ${isGeneralPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Feet"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-proph-grey-text mb-1">Inches</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightInches || ''}
                    onChange={(e) => setHeightInches(Number(e.target.value) || 0)}
                    disabled={isGeneralPosting}
                    className={`w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white placeholder:text-proph-grey-text ${isGeneralPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Inches"
                  />
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Application Deadline *</label>
              <input 
                type="date" 
                value={(() => {
                  // Convert deadline to yyyy-MM-dd format for date input
                  const deadline = (form.deadline as string) || posting.deadline;
                  if (!deadline) return '';
                  try {
                    const date = new Date(deadline);
                    if (isNaN(date.getTime())) return '';
                    return date.toISOString().split('T')[0];
                  } catch {
                    return '';
                  }
                })()}
                onChange={(e) => handleChange('deadline', e.target.value)} 
                disabled={isGeneralPosting}
                className={`w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white ${isGeneralPosting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Description (Optional)</label>
              <textarea maxLength={500} value={(form.description as string) ?? posting.description ?? ''} onChange={(e) => handleChange('description', e.target.value)} className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white min-h-32" placeholder="Tell players about this opportunity..." />
              <div className="text-right text-xs text-proph-grey-text mt-1">{((form.description as string) ?? posting.description ?? '').length}/500</div>
            </div>

            {/* Close Posting action */}
            <button onClick={confirmClosePosting} className="text-left text-proph-error font-semibold">Close Posting</button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-proph-grey-text/10 bg-proph-grey space-y-2 sticky bottom-0">
            <button disabled={saving} onClick={onClose} className="w-full border-2 border-proph-grey-text text-proph-white font-semibold py-3 rounded-xl">Cancel</button>
            <button disabled={saving} onClick={handleSave} className="w-full bg-proph-yellow text-proph-black font-bold py-3 rounded-xl">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};


