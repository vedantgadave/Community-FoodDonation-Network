import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

interface ImageUploaderProps {
  onImageUploaded: (url: string, publicId?: string) => void;
  onImageRemoved?: () => void;
  onUploadingStateChange?: (isUploading: boolean) => void;
  initialImageUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  onImageRemoved,
  onUploadingStateChange,
  initialImageUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadedSuccessfully, setUploadedSuccessfully] = useState<boolean>(Boolean(initialImageUrl));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setUploadedSuccessfully(false);
    setUploading(true);
    if (onUploadingStateChange) onUploadingStateChange(true);
    setProgress(0);

    // Show immediate local preview
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);

    try {
      const result = await uploadImageToCloudinary(file, (percent) => setProgress(percent));
      setPreviewUrl(result.url);
      setUploadedSuccessfully(true);
      onImageUploaded(result.url, result.publicId);
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Please try again.');
      setPreviewUrl(initialImageUrl || null);
      setUploadedSuccessfully(false);
    } finally {
      setUploading(false);
      if (onUploadingStateChange) onUploadingStateChange(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    setUploadedSuccessfully(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onImageRemoved) onImageRemoved();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Food Image <span className="text-slate-400 font-normal lowercase">(optional — JPG, PNG, WEBP, max 5MB)</span>
        </label>
        {uploadedSuccessfully && !uploading && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Image ready
          </span>
        )}
      </div>

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
              disabled={uploading}
              className="p-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center p-4">
              <div className="w-full bg-slate-700 rounded-full h-2.5 max-w-xs mb-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-white font-semibold flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                Uploading to Cloudinary... {progress}%
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/40 scale-[1.01]'
              : error
              ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
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
              {isDragOver ? 'Drop image here to upload' : 'Click or drag food image here'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              JPG, PNG, WEBP up to 5MB (SVG, GIF, PDF rejected)
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
};
