import React, { useEffect, useState } from 'react';
import type { Posting } from '../../types';
import { X, ArrowLeft } from 'lucide-react';
import { useNotification } from '../../hooks';

interface CreatePostingModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (posting: Partial<Posting>) => Promise<void> | void;
}

export const CreatePostingModal: React.FC<CreatePostingModalProps> = ({ open, onClose, onPublish }) => {
  const { showNotification } = useNotification();
  const [form, setForm] = useState<Partial<Posting>>({
    position: '',
    requirements: { gpa: undefined, height: '', class: [] },
    deadline: '2026-06-01',
    description: '',
  } as Partial<Posting>);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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
    try {
      setSaving(true);
      await onPublish(form);
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

            {/* Class - Checkbox Grid */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Class *</label>
              <div className="grid grid-cols-2 gap-3">
                {[2025, 2026, 2027, 2028].map((year) => {
                  const selected = (form.requirements?.class as number[] | undefined) || [];
                  const isSelected = selected.includes(year);
                  return (
                    <button
                      key={year}
                      type="button"
                      className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-colors ${
                        isSelected 
                          ? 'border-proph-yellow bg-proph-yellow/20 text-proph-white' 
                          : 'border-proph-grey-text/20 bg-proph-black text-proph-white'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        const current = new Set(selected);
                        if (current.has(year)) {
                          current.delete(year);
                        } else {
                          current.add(year);
                        }
                        handleReqChange('class', Array.from(current));
                      }}
                    >
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-proph-yellow" />}
                      <span className="text-sm font-medium">{year}</span>
                    </button>
                  );
                })}
              </div>
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

            {/* Height */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Height Requirement</label>
              <input
                type="text"
                value={form.requirements?.height || ''}
                onChange={(e) => handleReqChange('height', e.target.value)}
                className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white"
                placeholder={`e.g., 6'2" or taller`}
              />
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


