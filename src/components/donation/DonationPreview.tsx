import React from 'react';
import type { FoodType } from '../../types';
import { Heart, Sparkles, Image as ImageIcon } from 'lucide-react';

interface DonationPreviewProps {
  foodName: string;
  quantity: number;
  unit: string;
  foodType: FoodType;
  category: string;
  storageCondition?: string;
  preparedAt?: string;
  pickupDeadline?: string;
  pickupLocation?: string;
  imageUrl?: string;
}

export const DonationPreview: React.FC<DonationPreviewProps> = ({
  foodName,
  quantity,
  unit,
  foodType,
  category,
  storageCondition,
  pickupDeadline,
  pickupLocation,
  imageUrl,
}) => {
  const formatDeadline = (iso?: string) => {
    if (!iso) return 'Not set';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Live Preview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Donation Preview
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Your donation
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Food Photo Thumbnail */}
        <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Donation thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4 text-slate-400 dark:text-slate-500 space-y-1">
              <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs font-medium">No photo added yet (optional)</p>
            </div>
          )}
        </div>

        {/* Live Form Values */}
        <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-start justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Food item</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold text-right max-w-[60%] truncate">
              {foodName.trim() || 'Not added yet'}
            </span>
          </div>

          <div className="flex items-start justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Quantity</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold text-right">
              {quantity ? `${quantity} ${unit}` : 'Not added yet'}
            </span>
          </div>

          <div className="flex items-start justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Category</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold text-right max-w-[60%] truncate">
              {category || 'Not selected'}
            </span>
          </div>

          <div className="flex items-start justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Dietary type</span>
            <span
              className={`font-bold text-right ${
                foodType === 'VEGETARIAN'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {foodType === 'VEGETARIAN' ? '🥬 Vegetarian' : '🥩 Non-Vegetarian'}
            </span>
          </div>

          {storageCondition && (
            <div className="flex items-start justify-between pt-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Storage</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-right">
                {storageCondition}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Pickup deadline</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold text-right">
              {formatDeadline(pickupDeadline)}
            </span>
          </div>

          <div className="flex items-start justify-between pt-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Pickup point</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold text-right max-w-[60%] truncate">
              {pickupLocation?.trim() || 'Location not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Social Impact Callout */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-sm space-y-2 border border-emerald-700/50">
        <div className="flex items-center gap-2 text-emerald-200">
          <Heart className="w-4 h-4 fill-emerald-300 text-emerald-300" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Social Impact</h4>
        </div>
        <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
          💚 Every meal can make a difference. Turning surplus into community meals protects dignity and keeps good food out of landfills.
        </p>
      </div>
    </div>
  );
};
