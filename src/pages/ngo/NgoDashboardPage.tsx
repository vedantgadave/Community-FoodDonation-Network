import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Donation } from '../../types';
import { getAvailableDonations, getDonationsByNgo } from '../../services/donationService';
import { DonationCard } from '../../components/donation/DonationCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Search, HeartHandshake, Truck, CheckCircle2, Building, Utensils } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const NgoDashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [availableList, setAvailableList] = useState<Donation[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      Promise.all([
        getAvailableDonations(),
        getDonationsByNgo(userProfile.uid),
      ])
        .then(([avail, myDocs]) => {
          setAvailableList(avail);
          setMyDonations(myDocs);
        })
        .catch((err) => showToast(err.message || 'Failed to load NGO dashboard', 'error'))
        .finally(() => setLoading(false));
    }
  }, [userProfile, showToast]);

  const stats = {
    available: availableList.length,
    accepted: myDonations.filter((d) => d.status === 'ACCEPTED').length,
    pickedUp: myDonations.filter((d) => d.status === 'PICKED_UP').length,
    completed: myDonations.filter((d) => d.status === 'COMPLETED').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-teal-700/40">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-teal-300 font-bold">
            NGO Relief Command Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {userProfile?.organizationName || userProfile?.name}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1">
            Browse available surplus food listings across the community and manage ongoing rescue pickups.
          </p>
        </div>
        <Link to="/ngo/donations">
          <Button variant="secondary" size="lg" leftIcon={<Search className="w-5 h-5" />}>
            Find Available Food
          </Button>
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Available in Network</span>
            <Utensils className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{stats.available}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Accepted Pickups</span>
            <HeartHandshake className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{stats.accepted}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">In Transit</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{stats.pickedUp}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Distributed</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-2">{stats.completed}</p>
        </div>
      </div>

      {/* AVAILABLE DONATIONS PREVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Fresh Available Food Listings
          </h2>
          <Link to="/ngo/donations" className="text-xs font-bold text-teal-600 hover:underline">
            View All ({availableList.length})
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : availableList.length === 0 ? (
          <EmptyState
            title="No food donations available currently"
            description="All posted food listings have been accepted or no new listings have been posted today."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableList.slice(0, 6).map((donation) => (
              <DonationCard key={donation.id} donation={donation} userProfile={userProfile} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
