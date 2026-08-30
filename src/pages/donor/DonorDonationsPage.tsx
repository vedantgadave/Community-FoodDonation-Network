import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Donation, DonationStatus } from '../../types';
import { getDonationsByDonor, updateDonationStatus } from '../../services/donationService';
import { DonationCard } from '../../components/donation/DonationCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Package, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const DonorDonationsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Cancel Modal State
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchDonations = () => {
    if (userProfile) {
      setLoading(true);
      getDonationsByDonor(userProfile.uid)
        .then(setDonations)
        .catch((err) => showToast(err.message || 'Failed to load donations', 'error'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [userProfile]);

  const handleConfirmCancel = async () => {
    if (!selectedDonation || !userProfile) return;
    setCancelling(true);

    try {
      await updateDonationStatus(selectedDonation.id, 'CANCELLED', userProfile);
      showToast('Donation cancelled successfully', 'info');
      setSelectedDonation(null);
      fetchDonations();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel donation', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const filteredDonations = donations.filter((d) => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" /> My Food Donation Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your created listings, view pickup status timelines, and cancel eligible donations.
          </p>
        </div>
        <Link to="/donor/donate">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post New Donation
          </Button>
        </Link>
      </div>

      {/* Status Tab Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {st} ({st === 'ALL' ? donations.length : donations.filter((d) => d.status === st).length})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton count={3} type="card" />
      ) : filteredDonations.length === 0 ? (
        <EmptyState
          title="No donations found"
          description="There are no donation records matching the selected status filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              userProfile={userProfile}
              onCancel={(d) => setSelectedDonation(d)}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedDonation)}
        onClose={() => setSelectedDonation(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Food Donation?"
        message={`Are you sure you want to cancel '${selectedDonation?.foodName}'? Once cancelled, NGOs will no longer be able to accept this donation.`}
        confirmText="Yes, Cancel Donation"
        isDanger
        isLoading={cancelling}
      />
    </div>
  );
};
