import React from 'react';
import { ImageUploader } from '../image/ImageUploader';

interface FoodImageStepProps {
  imageUrl: string;
  setImageUrl: (val: string) => void;
  setImagePublicId: (val: string) => void;
  setIsUploadingImage: (val: boolean) => void;
}

export const FoodImageStep: React.FC<FoodImageStepProps> = ({
  imageUrl,
  setImageUrl,
  setImagePublicId,
  setIsUploadingImage,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
          Step 04 / Photo Verification
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Show the food
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          A clear photo helps NGOs understand packaging condition and estimate vehicle capacity.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
        <ImageUploader
          initialImageUrl={imageUrl}
          onImageUploaded={(url, pubId) => {
            setImageUrl(url);
            if (pubId) setImagePublicId(pubId);
          }}
          onImageRemoved={() => {
            setImageUrl('');
            setImagePublicId('');
          }}
          onUploadingStateChange={(uploading) => setIsUploadingImage(uploading)}
        />
      </div>
    </div>
  );
};
