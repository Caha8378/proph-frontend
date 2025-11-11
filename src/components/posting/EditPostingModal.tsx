import React, { useEffect, useState } from 'react';
import type { Posting } from '../../types';
import { X, ArrowLeft } from 'lucide-react';

interface EditPostingModalProps {
  posting: Posting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPosting: Partial<Posting>) => void;
  onClosePosting: (postingId: string) => void;
}

export const EditPostingModal: React.FC<EditPostingModalProps> = ({ posting, isOpen, onClose, onSave, onClosePosting }) => {
  const [form, setForm] = useState<Partial<Posting>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      position: posting.position,
      requirements: { ...posting.requirements, class: (posting as any).requirements?.class || [] },
      deadline: posting.deadline,
      description: posting.description,
    });
  }, [isOpen, posting]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const handleReqChange = (key: string, value: any) => setForm(prev => ({ ...prev, requirements: { ...(prev.requirements || {}), [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const confirmClosePosting = () => {
    if (window.confirm('Mark this posting as filled? It will no longer accept applications.')) {
      onClosePosting(posting.id);
    }
  };

  const selectedClasses: number[] = ((form.requirements as any)?.class || []) as number[];

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
            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Position *</label>
              <select value={(form.position as string) || posting.position} onChange={(e) => handleChange('position', e.target.value)} className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white">
                {['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Class - Checkbox Grid */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Class *</label>
              <div className="grid grid-cols-2 gap-3">
                {[2025, 2026, 2027, 2028].map((year) => {
                  const isSelected = selectedClasses.includes(year);
                  return (
                    <label key={year} className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-proph-yellow bg-proph-yellow/10' : 'border-proph-grey-text/20 bg-proph-black'}`} onClick={() => {
                      const current = new Set(selectedClasses);
                      if (current.has(year)) current.delete(year); else current.add(year);
                      handleReqChange('class', Array.from(current));
                    }}>
                      <input type="checkbox" className="sr-only" checked={isSelected} readOnly />
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-proph-yellow" />}
                      <span className="text-sm font-medium text-proph-white">{year}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* GPA */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Minimum GPA</label>
              <input type="number" step="0.1" min="0" max="4" value={(form.requirements?.gpa ?? posting.requirements.gpa) as any} onChange={(e) => handleReqChange('gpa', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white" placeholder="e.g., 3.0" />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Height Requirement</label>
              <input type="text" value={(form.requirements?.height ?? posting.requirements.height) as any} onChange={(e) => handleReqChange('height', e.target.value)} className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white" placeholder={`e.g., 6'2" +`} />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-proph-white mb-2">Application Deadline *</label>
              <input type="date" value={(form.deadline as string) || posting.deadline.split('T')[0] || ''} onChange={(e) => handleChange('deadline', e.target.value)} className="w-full bg-proph-black border border-proph-grey-text/20 rounded-lg p-3 text-proph-white" />
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


