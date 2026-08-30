import React from 'react';
import { isDemoMode, isFirebaseConfigured } from '../../services/firebase';
import { isCloudinaryConfigured } from '../../services/cloudinaryService';
import { Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

export const DemoBanner: React.FC = () => {
  const { userProfile, switchDemoUserRole } = useAuth();

  if (!isDemoMode && isFirebaseConfigured && isCloudinaryConfigured) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-semibold shadow-inner flex flex-wrap items-center justify-between gap-2 border-b border-amber-400">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
        <span>
          <strong>DEMO MODE ACTIVE:</strong> Running in local demonstration state. Cloud services (.env) can be configured for production.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-900 flex items-center gap-1 font-bold">
          <UserCheck className="w-3.5 h-3.5" /> Role Switcher:
        </span>
        <div className="flex gap-1 bg-slate-950/15 p-0.5 rounded-lg border border-slate-950/20">
          {(['DONOR', 'NGO', 'ADMIN'] as UserRole[]).map((r) => {
            const active = userProfile?.role === r;
            return (
              <button
                key={r}
                onClick={() => switchDemoUserRole(r)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                  active
                    ? 'bg-slate-950 text-amber-400 shadow-sm'
                    : 'text-slate-900 hover:bg-slate-950/20'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
