import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { useNotification } from '../../hooks';

interface UploadImageModalProps {
  open: boolean;
  currentPhoto?: string;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
}

export const UploadImageModal: React.FC<UploadImageModalProps> = ({
  open,
  currentPhoto,
  onClose,
  onSubmit,
}) => {
  const { showNotification } = useNotification();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const o = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = o;
      };
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setPreview(currentPhoto || null);
      setSelectedFile(null);
    }
  }, [open, currentPhoto]);

  if (!open) return null;

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('Please select a valid image file', 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showNotification('Please select an image to upload', 'error');
      return;
    }

    try {
      setUploading(true);
      await onSubmit(selectedFile);
      showNotification('Profile photo updated successfully!', 'success');
      onClose();
      // Refresh the page to show the new photo
      window.location.reload();
    } catch (err: any) {
      console.error('Error uploading image:', err);
      showNotification(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !uploading) onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-full max-w-md animate-slide-up" style={{ height: '60vh' }}>
          <div className="flex h-full flex-col bg-proph-grey rounded-t-2xl overflow-hidden border-t border-proph-grey-text/10">
            {/* Header */}
            <div className="p-4 bg-proph-grey border-b border-proph-grey-text/10 relative">
              <button
                onClick={onClose}
                className="absolute right-3 top-3 p-2 rounded-lg hover:bg-proph-grey-light"
                disabled={uploading}
              >
                <X className="w-5 h-5 text-proph-white" />
              </button>
              <h2 className="text-xl font-bold text-proph-white pr-8">
                Update Profile Photo
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-proph-yellow bg-proph-yellow/10'
                      : 'border-proph-grey-text/20 hover:border-proph-grey-text/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  {preview ? (
                    <div className="space-y-3">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-proph-white text-sm">Click or drag to change photo</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-10 h-10 text-proph-grey-text mx-auto" />
                      <div>
                        <p className="text-proph-white font-semibold text-sm mb-1">
                          Drag and drop your photo here
                        </p>
                        <p className="text-proph-grey-text text-xs">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-proph-grey p-4 space-y-2">
              <button
                disabled={uploading || !selectedFile}
                onClick={handleSubmit}
                className={`w-full bg-proph-yellow text-proph-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 ${
                  uploading || !selectedFile
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#E6D436]'
                }`}
              >
                {uploading && <Loader2 className="w-5 h-5 animate-spin" />}
                {uploading ? 'Uploading...' : 'Update Photo'}
              </button>
              <button
                disabled={uploading}
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

