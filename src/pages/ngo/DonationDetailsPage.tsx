import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Donation } from '../../types';
import { getDonationById, acceptDonationTransaction, updateDonationStatus } from '../../services/donationService';
import { stopPickupJourney } from '../../services/journeyService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DonationTimeline } from '../../components/donation/DonationTimeline';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyBanner';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { PickupLocationMap } from '../../components/map/PickupLocationMap';
import { LiveNavigationMap } from '../../components/map/LiveNavigationMap';
import { DonorTrackingCard } from '../../components/donation/DonorTrackingCard';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  AlertTriangle,
  Navigation,
  Compass
} from 'lucide-react';

export const DonationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const fetchDetails = () => {
    if (!id) return;
    setLoading(true);
    getDonationById(id)
      .then(setDonation)
      .catch((err) => showToast(err.message || 'Error fetching donation details', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAccept = async () => {
    if (!donation || !userProfile) return;
    setActionLoading(true);

    try {
      await acceptDonationTransaction(donation.id, userProfile);
      showToast(`Success! You have accepted '${donation.foodName}'.`, 'success');
      fetchDetails();
    } catch (err: any) {
      showToast(err.message || 'Donation has already been accepted by another NGO.', 'error');
      fetchDetails();
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (nextStatus: any) => {
    if (!donation || !userProfile) return;
    setActionLoading(true);

    try {
      await updateDonationStatus(donation.id, nextStatus, userProfile);
      showToast(`Donation status updated to ${nextStatus}`, 'success');
      if (nextStatus === 'PICKED_UP' || nextStatus === 'COMPLETED') {
        setIsNavigating(false);
        await stopPickupJourney(donation.id);
      }
      fetchDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <LoadingSkeleton count={1} type="card" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Donation Listing Not Found</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const isVeg = donation.foodType === 'VEGETARIAN';
  const isAssignedNgo = userProfile?.role === 'NGO' && donation.acceptedBy === userProfile.uid;
  const isDonorOwner = userProfile?.uid === donation.donorId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
        Back to Listings
      </Button>

      {/* DONOR LIVE TRACKING VIEW (When viewed by the Donor) */}
      {isDonorOwner && donation.status !== 'AVAILABLE' && (
        <DonorTrackingCard donation={donation} />
      )}

      {/* ACTIVE NGO NAVIGATION SCREEN */}
      {isNavigating && userProfile && isAssignedNgo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 animate-spin" /> Live Road Navigation to Pickup
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNavigating(false)}
            >
              Exit Navigation Mode
            </Button>
          </div>
          <LiveNavigationMap
            donation={donation}
            currentUser={userProfile}
            onFinishPickup={() => handleStatusUpdate('PICKED_UP')}
            onCloseNavigation={() => setIsNavigating(false)}
          />
        </div>
      )}

      {/* MAIN DONATION DETAILS CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Banner Image Header */}
        <div className="relative h-72 w-full bg-slate-900">
          <img
            src={donation.imageUrl || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80'}
            alt={donation.foodName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md text-white ${isVeg ? 'bg-emerald-600' : 'bg-amber-600'}`}>
              {isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <StatusBadge status={donation.status} size="md" />
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold">{donation.foodName}</h1>
            <p className="text-sm text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              {donation.pickupLocation}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Quantity Available
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {donation.quantity} {donation.unit}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Food Category
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {donation.category || 'General Surplus'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Prepared At
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {new Date(donation.preparedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Pickup Deadline
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {new Date(donation.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Description */}
          {donation.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description & Handling Instructions
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {donation.description}
              </p>
            </div>
          )}

          {/* Lifecycle Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Donation Lifecycle Progress
            </h3>
            <DonationTimeline donation={donation} />
          </div>

          {/* Donor Contact & Map Area */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Donor Contact & Location Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Donor Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{donation.donorName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Contact Phone:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> {donation.donorPhone}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Pickup Location / Address:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{donation.pickupLocation}</span>
              </div>
            </div>

            {/* Static Map when not in active turn-by-turn navigation */}
            {!isNavigating && donation.pickupCoordinates && (
              <div className="pt-2">
                <PickupLocationMap
                  latitude={donation.pickupCoordinates.latitude}
                  longitude={donation.pickupCoordinates.longitude}
                  locationName={donation.pickupLocation}
                />
              </div>
            )}
          </div>

          {/* Safety Declaration */}
          <FoodSafetyBanner compact />

          {/* ACTION BUTTON FOOTER */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              {donation.acceptedByName && (
                <p className="text-xs text-slate-500">
                  Accepted by: <strong className="text-slate-800 dark:text-slate-200">{donation.acceptedByName}</strong>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {userProfile?.role === 'NGO' && donation.status === 'AVAILABLE' && (
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={actionLoading}
                  onClick={handleAccept}
                >
                  Accept Food Donation (Atomic)
                </Button>
              )}

              {/* NAVIGATE TO PICKUP BUTTON */}
              {isAssignedNgo && donation.status === 'ACCEPTED' && !isNavigating && (
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  leftIcon={<Navigation className="w-4 h-4" />}
                  onClick={() => setIsNavigating(true)}
                >
                  Navigate to Pickup
                </Button>
              )}

              {isAssignedNgo && donation.status === 'ACCEPTED' && (
                <Button
                  variant="secondary"
                  size="lg"
                  isLoading={actionLoading}
                  onClick={() => handleStatusUpdate('PICKED_UP')}
                >
                  Mark as Picked Up
                </Button>
              )}

              {isAssignedNgo && donation.status === 'PICKED_UP' && (
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={actionLoading}
                  onClick={() => handleStatusUpdate('COMPLETED')}
                >
                  Mark as Completed & Distributed
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
