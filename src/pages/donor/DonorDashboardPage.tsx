import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Donation } from '../../types';
import { getDonationsByDonor } from '../../services/donationService';
import { DonationCard } from '../../components/donation/DonationCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, CheckCircle2, Clock, Truck, HeartHandshake } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DonorDashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      getDonationsByDonor(userProfile.uid)
        .then(setDonations)
        .catch((err) => showToast(err.message || 'Failed to load donations', 'error'))
        .finally(() => setLoading(false));
    }
  }, [userProfile, showToast]);

  const stats = {
    total: donations.length,
    available: donations.filter((d) => d.status === 'AVAILABLE').length,
    accepted: donations.filter((d) => d.status === 'ACCEPTED').length,
    pickedUp: donations.filter((d) => d.status === 'PICKED_UP').length,
    completed: donations.filter((d) => d.status === 'COMPLETED').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-700/40">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
            Donor Control Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {userProfile?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Track your active surplus food postings and view community distribution history.
          </p>
        </div>
        <Link to="/donor/donate">
          <Button variant="primary" size="lg" leftIcon={<PlusCircle className="w-5 h-5" />}>
            Post Surplus Food
          </Button>
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Posted</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Available</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{stats.available}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Accepted</span>
            <HeartHandshake className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{stats.accepted}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Picked Up</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{stats.pickedUp}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-2">{stats.completed}</p>
        </div>
      </div>

      {/* RECENT DONATIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            My Active & Recent Food Listings
          </h2>
          <Link to="/donor/donations" className="text-xs font-bold text-emerald-600 hover:underline">
            View All ({donations.length})
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : donations.length === 0 ? (
          <EmptyState
            title="No food donations created yet"
            description="Start reducing surplus food waste by posting your first catered food batch."
            actionText="+ Post Surplus Food"
            onAction={() => window.location.href = '/donor/donate'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.slice(0, 6).map((donation) => (
              <DonationCard key={donation.id} donation={donation} userProfile={userProfile} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
