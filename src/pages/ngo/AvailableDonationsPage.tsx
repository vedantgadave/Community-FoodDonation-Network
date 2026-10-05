import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Donation, DonationFilter } from '../../types';
import { getAvailableDonations, acceptDonationTransaction } from '../../services/donationService';
import { DonationCard } from '../../components/donation/DonationCard';
import { DonationFilterBar } from '../../components/donation/DonationFilterBar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { Search } from 'lucide-react';

export const AvailableDonationsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const [filters, setFilters] = useState<DonationFilter>({
    search: '',
    foodType: 'ALL',
    location: '',
    minQuantity: 0,
  });

  const fetchAvailable = () => {
    setLoading(true);
    getAvailableDonations(filters)
      .then(setDonations)
      .catch((err) => showToast(err.message || 'Failed to fetch available food', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAvailable();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      foodType: 'ALL',
      location: '',
      minQuantity: 0,
    });
  };

  const handleAcceptDonation = async (donation: Donation) => {
    if (!userProfile) return;
    setAcceptingId(donation.id);

    try {
      await acceptDonationTransaction(donation.id, userProfile);
      showToast(`Success! You have accepted '${donation.foodName}'.`, 'success');
      fetchAvailable();
    } catch (err: any) {
      showToast(err.message || 'Donation has already been accepted by another NGO.', 'error');
      fetchAvailable();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Search className="w-6 h-6 text-teal-600" /> Available Surplus Food Listings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Search and filter fresh surplus food postings. Click <strong>Accept Food</strong> to reserve an item for your NGO via atomic transaction lock.
        </p>
      </div>

      {/* FILTER PANEL */}
      <DonationFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* DONATION CARDS GRID */}
      {loading ? (
        <LoadingSkeleton count={6} type="card" />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No matching donations found"
          description="Try broadening your filter criteria or check back later for new food posts."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              userProfile={userProfile}
              onAccept={handleAcceptDonation}
              isAccepting={acceptingId === donation.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
