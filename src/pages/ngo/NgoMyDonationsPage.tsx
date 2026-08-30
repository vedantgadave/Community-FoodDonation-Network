import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Donation } from '../../types';
import { getDonationsByNgo, updateDonationStatus } from '../../services/donationService';
import { DonationCard } from '../../components/donation/DonationCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { HeartHandshake, CheckCircle2, Truck } from 'lucide-react';

export const NgoMyDonationsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const fetchMyDonations = () => {
    if (userProfile) {
      setLoading(true);
      getDonationsByNgo(userProfile.uid)
        .then(setDonations)
        .catch((err) => showToast(err.message || 'Error loading NGO accepted donations', 'error'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, [userProfile]);

  const handleStatusUpdate = async (donation: Donation, nextStatus: any) => {
    if (!userProfile) return;
    try {
      await updateDonationStatus(donation.id, nextStatus, userProfile);
      showToast(`Status updated to ${nextStatus}`, 'success');
      fetchMyDonations();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const activeDonations = donations.filter((d) => ['ACCEPTED', 'PICKED_UP'].includes(d.status));
  const completedDonations = donations.filter((d) => d.status === 'COMPLETED');

  const displayedList = activeTab === 'ACTIVE' ? activeDonations : completedDonations;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-teal-600" /> NGO Accepted Food Rescue Missions
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track active pickups assigned to your NGO and view past completed distribution missions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'ACTIVE'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" /> Active Pickups ({activeDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'COMPLETED'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Completed History ({completedDonations.length})
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} type="card" />
      ) : displayedList.length === 0 ? (
        <EmptyState
          title={activeTab === 'ACTIVE' ? 'No active pickups' : 'No completed history yet'}
          description={
            activeTab === 'ACTIVE'
              ? 'You have not accepted any food donations currently needing pickup.'
              : 'Completed food distributions will appear here once marked as completed.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              userProfile={userProfile}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
