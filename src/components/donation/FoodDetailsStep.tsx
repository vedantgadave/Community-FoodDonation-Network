import React from 'react';
import type { FoodType } from '../../types';
import { Input } from '../ui/Input';
import { Utensils, Building2, GraduationCap, Package, Users, MoreHorizontal, Check } from 'lucide-react';

export const FOOD_CATEGORIES = [
  { id: 'Wedding / Banquet Surplus', title: 'Wedding / Banquet', desc: 'Surplus catering from weddings, banquets & parties', icon: Utensils },
  { id: 'Restaurant / Hotel Surplus', title: 'Restaurant / Hotel', desc: 'Prepared meals, buffet remainder, or kitchen overflow', icon: Building2 },
  { id: 'College Canteen / Hostel', title: 'College Canteen / Hostel', desc: 'Hostel mess surplus, cafeteria batches, or dining halls', icon: GraduationCap },
  { id: 'Bakery & Packaged Food', title: 'Bakery & Packaged', desc: 'Fresh baked bread, sealed pastries, buns & packaged food', icon: Package },
  { id: 'Community Individual Contribution', title: 'Community Contribution', desc: 'Home contribution, residential society, or festive drive', icon: Users },
  { id: 'Other', title: 'Other Surplus', desc: 'Corporate cafeteria, hospital kitchen, or other sources', icon: MoreHorizontal },
];

export const QUANTITY_UNITS = [
  { value: 'meals', label: 'Meals / Servings' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'litres', label: 'Litres (L)' },
  { value: 'boxes', label: 'Packets / Boxes' },
  { value: 'plates', label: 'Plates' },
  { value: 'other', label: 'Other' },
];

interface FoodDetailsStepProps {
  foodName: string;
  setFoodName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  foodType: FoodType;
  setFoodType: (val: FoodType) => void;
  quantity: number;
  setQuantity: (val: number) => void;
  unit: string;
  setUnit: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export const FoodDetailsStep: React.FC<FoodDetailsStepProps> = ({
  foodName,
  setFoodName,
  category,
  setCategory,
  foodType,
  setFoodType,
  quantity,
  setQuantity,
  unit,
  setUnit,
  description,
  setDescription,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
          Step 01 / Basic Information
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          What are you donating?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tell us a little about the surplus food so nearby NGOs know what they can collect.
        </p>
      </div>

      {/* Food Item Name */}
      <div>
        <Input
          label="Food item *"
          placeholder="e.g. Fresh Gourmet Veg Biryani & Curry Packages"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          helperText="Be specific so NGOs can quickly understand what is available."
          required
        />
      </div>

      {/* Food Category Selectable Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Food Category *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {FOOD_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {cat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary Type Segmented Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Dietary Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFoodType('VEGETARIAN')}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              foodType === 'VEGETARIAN'
                ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20 text-emerald-900 dark:text-emerald-100 font-bold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="flex items-center gap-2 text-xs font-bold">
              <span className="text-base">🥬</span> Vegetarian
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              100% Veg
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFoodType('NON_VEGETARIAN')}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              foodType === 'NON_VEGETARIAN'
                ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-600/20 text-amber-900 dark:text-amber-100 font-bold'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="flex items-center gap-2 text-xs font-bold">
              <span className="text-base">🥩</span> Non-Vegetarian
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              Contains Meat
            </span>
          </button>
        </div>
      </div>

      {/* Connected Quantity & Unit */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Quantity *
        </label>
        <div className="flex rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
          <input
            type="number"
            min="1"
            placeholder="50"
            value={quantity || ''}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 bg-transparent outline-none"
            required
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            {QUANTITY_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Anything else NGOs should know? <span className="font-normal text-slate-400 lowercase">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Packed in food-grade foil containers, mild spice level, best consumed with warm curry..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
};
