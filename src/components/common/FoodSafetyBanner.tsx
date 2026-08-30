import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface FoodSafetyBannerProps {
  compact?: boolean;
}

export const FoodSafetyBanner: React.FC<FoodSafetyBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          <strong>Food Safety Notice:</strong> Only safe and suitable food should be donated. Handling, storage, transportation, and distribution must comply with applicable food safety standards. The platform does not certify or guarantee food safety.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/40 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <ShieldCheck className="w-48 h-48" />
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 shrink-0">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-base font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            Food Safety & Hygiene Guidelines
          </h4>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Only fresh, hygienic, and safe surplus food should be offered for donation. Donors and receiving NGOs are responsible for adhering to local food safety, hygiene, and safe temperature transportation standards.
          </p>
          <p className="text-xs text-emerald-300/70 mt-2 italic">
            * Note: Community Food Donation Network provides the connection platform and does not certify, test, or inspect food items.
          </p>
        </div>
      </div>
    </div>
  );
};
