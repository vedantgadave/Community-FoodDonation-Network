import React from 'react';
import { Input } from '../ui/Input';
import { ShieldAlert, Flame, Snowflake, Sparkles, ThermometerSnowflake, Check } from 'lucide-react';

export const STORAGE_OPTIONS = [
  { id: 'Hot Insulated Containers', title: 'Hot Insulated', desc: 'Maintained above 60°C in thermal warmers', icon: Flame },
  { id: 'Refrigerated (Chilled)', title: 'Refrigerated', desc: 'Kept chilled in commercial refrigeration below 5°C', icon: Snowflake },
  { id: 'Frozen Storage', title: 'Frozen Storage', desc: 'Deep frozen in hygienic sealed food bags', icon: ThermometerSnowflake },
  { id: 'Ambient Room Temperature', title: 'Ambient Room Temp', desc: 'Covered cleanly at indoor room temperature', icon: Sparkles },
];

export const PACKAGING_OPTIONS = [
  'Sealed Metal Trays',
  'Individual Boxes / Foils',
  'Hygiene Plastic Wrapped',
  'Loose Kitchen Vessels',
];

interface SafetyStepProps {
  preparedAt: string;
  setPreparedAt: (val: string) => void;
  pickupDeadline: string;
  setPickupDeadline: (val: string) => void;
  storageCondition: string;
  setStorageCondition: (val: string) => void;
  packagingCondition: string;
  setPackagingCondition: (val: string) => void;
  safetyConfirmed: boolean;
  setSafetyConfirmed: (val: boolean) => void;
}

export const SafetyStep: React.FC<SafetyStepProps> = ({
  preparedAt,
  setPreparedAt,
  pickupDeadline,
  setPickupDeadline,
  storageCondition,
  setStorageCondition,
  packagingCondition,
  setPackagingCondition,
  safetyConfirmed,
  setSafetyConfirmed,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
          Step 02 / Quality & Preservation
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Is the food safe to distribute?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Accurate storage and prep records allow NGOs to evaluate safe distribution windows.
        </p>
      </div>

      {/* Safety Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
            🛡 Food safety matters
          </h4>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            Please provide accurate information about when the food was prepared and how it has been stored. This helps NGOs decide whether the food can be safely collected and served.
          </p>
        </div>
      </div>

      {/* Timing Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Prepared Date / Time *"
          type="datetime-local"
          value={preparedAt}
          onChange={(e) => setPreparedAt(e.target.value)}
          helperText="Approximate time food was prepared"
          required
        />

        <Input
          label="Pickup Deadline *"
          type="datetime-local"
          value={pickupDeadline}
          onChange={(e) => setPickupDeadline(e.target.value)}
          helperText="Must be collected before this deadline"
          required
        />
      </div>

      {/* Storage Temperature Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Storage Temperature / Environment *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STORAGE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = storageCondition === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStorageCondition(opt.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {opt.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packaging Format Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Packaging Format *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PACKAGING_OPTIONS.map((pkg) => {
            const isSelected = packagingCondition === pkg;

            return (
              <button
                key={pkg}
                type="button"
                onClick={() => setPackagingCondition(pkg)}
                className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {pkg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Confirmation Checklist Cards */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Safety Declaration *
        </label>

        <div className="space-y-2">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
            <span>Food has been prepared hygienically in a clean, sanitized kitchen</span>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
            <span>Food has been stored safely at proper temperature since preparation</span>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
            <input
              type="checkbox"
              checked={safetyConfirmed}
              onChange={(e) => setSafetyConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              required
            />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
              “I confirm that the donated food is suitable for donation and has been handled hygienically.”
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
