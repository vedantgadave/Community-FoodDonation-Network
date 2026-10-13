import React from 'react';
import type { FoodType } from '../../types';
import { Utensils, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

interface ReviewStepProps {
  foodName: string;
  quantity: number;
  unit: string;
  foodType: FoodType;
  category: string;
  preparedAt: string;
  pickupDeadline: string;
  pickupLocation: string;
  pickupCoordinates?: { latitude: number; longitude: number };
  storageCondition: string;
  packagingCondition: string;
  description: string;
  imageUrl?: string;
  finalDeclarationChecked: boolean;
  setFinalDeclarationChecked: (val: boolean) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  foodName,
  quantity,
  unit,
  foodType,
  category,
  preparedAt,
  pickupDeadline,
  pickupLocation,
  pickupCoordinates,
  storageCondition,
  packagingCondition,
  description,
  imageUrl,
  finalDeclarationChecked,
  setFinalDeclarationChecked,
}) => {
  const formatTime = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
          Step 05 / Final Review
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Ready to share?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review the details before publishing this surplus listing to certified NGOs.
        </p>
      </div>

      {/* Food Details Summary Card */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Food Information
            </h4>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {category}
          </span>
        </div>

        <div className="flex gap-4 items-start">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Food preview"
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          )}
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {foodName}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {quantity} {unit}
              </span>
              <span>•</span>
              <span
                className={`font-semibold ${
                  foodType === 'VEGETARIAN' ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {foodType === 'VEGETARIAN' ? '🥬 Vegetarian' : '🥩 Non-Vegetarian'}
              </span>
              <span>•</span>
              <span className="text-slate-500">{packagingCondition}</span>
            </div>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                "{description}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Logistics Summary Card */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Safety & Logistics
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Prepared At:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatTime(preparedAt)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Pickup Deadline:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {formatTime(pickupDeadline)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Storage Condition:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {storageCondition}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Listing Status:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready to publish
            </span>
          </div>
        </div>
      </div>

      {/* Pickup Location Card */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Pickup Location
          </h4>
        </div>
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
          {pickupLocation}
        </p>
        {pickupCoordinates && (
          <p className="text-[11px] text-slate-400 font-mono">
            GPS: {pickupCoordinates.latitude.toFixed(5)}, {pickupCoordinates.longitude.toFixed(5)}
          </p>
        )}
      </div>

      {/* Final Safety Declaration Checkbox */}
      <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
        <input
          type="checkbox"
          checked={finalDeclarationChecked}
          onChange={(e) => setFinalDeclarationChecked(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
          required
        />
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
          I declare that this surplus food is hygienically packed, fit for human consumption, and available at the specified pickup dock.
        </span>
      </label>
    </div>
  );
};
