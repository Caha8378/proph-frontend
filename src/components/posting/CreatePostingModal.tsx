import React, { useEffect, useState } from 'react';
import type { Posting } from '../../types';
import { X, ArrowLeft } from 'lucide-react';
import { useNotification } from '../../hooks';

// Helper function for height conversion
const feetAndInchesToInches = (feet: number, inches: number): number => {
  return (feet * 12) + inches;
};

interface CreatePostingModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (posting: Partial<Posting>) => Promise<void> | void;
}

export const CreatePostingModal: React.FC<CreatePostingModalProps> = ({ open, onClose, onPublish }) => {
  const { showNotification } = useNotification();
  const [form, setForm] = useState<Partial<Posting>>({
    position: '',
    requirements: { gpa: undefined, height: '', classYear: undefined },
    deadline: '2026-06-01',
    description: '',
  } as Partial<Posting>);
  const [heightFeet, setHeightFeet] = useState<number>(0);
  const [heightInches, setHeightInches] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Reset form when opening
    setForm({
      position: '',
      requirements: { gpa: undefined, height: '', classYear: undefined },
      deadline: '2026-06-01',
      description: '',
    } as Partial<Posting>);
    setHeightFeet(0);
    setHeightInches(0);
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleReqChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, requirements: { ...(prev.requirements || {}), [key]: value } }));
  };

  const handlePublish = async () => {
    if (saving) return;
    
    // Validate required fields
    if (!form.position) {
      showNotification('Position is required', 'error');
      return;
    }
    if (!form.requirements?.classYear) {
      showNotification('Graduation year is required', 'error');
      return;
    }
    if (!form.deadline) {
      showNotification('Application deadline is required', 'error');
      return;
    }
    
    try {
      setSaving(true);
      // Convert height to inches before publishing
      const heightInInches = (heightFeet > 0 || heightInches > 0) 
        ? feetAndInchesToInches(heightFeet, heightInches) 
        : undefined;
      
      const formToPublish = {
        ...form,
        requirements: {
          ...form.requirements,
          heightInches: heightInInches, // Store as heightInches for API
        }
      };
      
      await onPublish(formToPublish);
      showNotification('Posting created successfully!', 'success');
    } catch (err: any) {
      console.error('Error creating posting:', err);
      showNotification(err.message || 'Failed to create posting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-full max-w-md h-[85vh] bg-proph-grey rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10 animate-slide-up flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-proph-grey-text/10 bg-proph-grey flex-shrink-0">
            <button className="p-2 rounded-lg hover:bg-proph-grey-light" onClick={onClose} aria-label="Close">
              <ArrowLeft className="w-5 h-5 text-proph-white" />
            </button>
            <div className="text-proph-white font-bold">Create Posting</div>
            <button className="p-2 rounded-lg hover:bg-proph-grey-light" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5 text-proph-white" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Position *</label>
              <input
                type="text"
                maxLength={20}
                value={form.position || ''}
                onChange={(e) => handleChange('position', e.target.value)}
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white"
                placeholder="ex: point guard, stretch big"
              />
            </div>

            {/* Class - Single Selection */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Graduation Year *</label>
              <select
                value={form.requirements?.classYear || ''}
                onChange={(e) => handleReqChange('classYear', e.target.value === '' ? undefined : Number(e.target.value))}
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white focus:outline-none focus:border-proph-yellow transition-colors"
              >
                <option value="">Select graduation year</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
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
                value={form.requirements?.gpa ?? ''}
                onChange={(e) =>
                  handleReqChange(
                    'gpa',
                    e.target.value === '' ? undefined : Number(e.target.value)
                  )
                }
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white"
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
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white"
                    placeholder="6"
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
                    className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white"
                    placeholder="2"
                  />
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Application Deadline *</label>
              <input
                type="date"
                value={form.deadline || ''}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Description (Optional)</label>
              <textarea maxLength={500} value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white min-h-32" placeholder="Tell players about this opportunity..." />
              <div className="text-right text-xs text-proph-grey-text mt-1">{(form.description || '').length}/500</div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-proph-grey-text/10 bg-proph-grey flex-shrink-0">
            <button disabled={saving} onClick={handlePublish} className="w-full bg-proph-yellow text-proph-black font-bold py-3 rounded-xl">Publish Posting</button>
          </div>
        </div>
      </div>
    </div>
  );
};


