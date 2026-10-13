import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToNewDonationAlerts, showLocalBrowserNotification } from '../../services/notificationService';
import type { Donation } from '../../types';
import { Bell, ArrowRight, X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState<Donation | null>(null);

  useEffect(() => {
    if (!userProfile || userProfile.role !== 'NGO') return;

    const unsubscribe = subscribeToNewDonationAlerts(userProfile, (donation) => {
      // 1. Show interactive in-app banner for foreground visibility
      setActiveAlert(donation);

      // 2. Only show native OS/browser notification if the tab is hidden/backgrounded
      // This prevents double-alerting when the user is actively viewing the website
      if (document.visibilityState === 'hidden') {
        const portions = donation.quantity ? `${donation.quantity} ${donation.unit || 'portions'}` : 'Surplus food';
        const pickupArea = donation.pickupLocation ? donation.pickupLocation.split(',')[0].trim() : 'Local area';
        showLocalBrowserNotification(
          '🍱 New Food Donation Available!',
          `${portions} available for pickup near ${pickupArea}. Tap to view details.`,
          donation.id,
          () => {
            navigate(`/ngo/donations/${donation.id}`);
          }
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userProfile, navigate]);

  if (!activeAlert) return null;

  return (
    <aside aria-label="New donation alert" className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white dark:bg-slate-900 border-2 border-teal-500 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/50 text-teal-600 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
              🍱 New Surplus Donation!
            </span>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
            {activeAlert.foodName}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {activeAlert.quantity} {activeAlert.unit || 'portions'} • {activeAlert.pickupLocation ? activeAlert.pickupLocation.split(',')[0] : 'Ready for pickup'}
          </p>
          <button
            onClick={() => {
              const id = activeAlert.id;
              setActiveAlert(null);
              navigate(`/ngo/donations/${id}`);
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-black text-teal-600 dark:text-teal-400 hover:underline"
          >
            Review & Accept Donation <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
