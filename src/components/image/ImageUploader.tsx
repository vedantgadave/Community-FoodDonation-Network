import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

interface ImageUploaderProps {
  onImageUploaded: (url: string, publicId?: string) => void;
  onImageRemoved?: () => void;
  initialImageUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  onImageRemoved,
  initialImageUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    // Show immediate local preview
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);

    try {
      const result = await uploadImageToCloudinary(file, (percent) => setProgress(percent));
      setPreviewUrl(result.url);
      onImageUploaded(result.url, result.publicId);
    } catch (err: any) {
      setError(err.message || 'Image upload failed.');
      setPreviewUrl(initialImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onImageRemoved) onImageRemoved();
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
        Food Image (JPEG, PNG, WEBP — Max 5MB)
      </label>

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group shadow-md max-w-md">
          <img
            src={previewUrl}
            alt="Food preview"
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-lg transition-transform hover:scale-110"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center p-4">
              <div className="w-full bg-slate-700 rounded-full h-2.5 max-w-xs mb-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-white font-semibold">Uploading... {progress}%</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 ${
            error
              ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Click or drag food image here
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports JPG, PNG, WEBP up to 5MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
