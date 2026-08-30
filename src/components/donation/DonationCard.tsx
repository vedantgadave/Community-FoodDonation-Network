import React from 'react';
import type { Donation, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../ui/Button';
import { MapPin, Clock, UtensilsCrossed, Building, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DonationCardProps {
  donation: Donation;
  userProfile: UserProfile | null;
  onAccept?: (donation: Donation) => void;
  onCancel?: (donation: Donation) => void;
  onStatusUpdate?: (donation: Donation, newStatus: any) => void;
  isAccepting?: boolean;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  userProfile,
  onAccept,
  onCancel,
  onStatusUpdate,
  isAccepting = false,
}) => {
  const navigate = useNavigate();
  const isVeg = donation.foodType === 'VEGETARIAN';

  const defaultImage = isVeg
    ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Image Header & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={donation.imageUrl || defaultImage}
          alt={donation.foodName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md flex items-center gap-1 ${
              isVeg ? 'bg-emerald-600/90 text-white' : 'bg-amber-600/90 text-white'
            }`}
          >
            <UtensilsCrossed className="w-3 h-3" />
            {isVeg ? 'Vegetarian' : 'Non-Veg'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <StatusBadge status={donation.status} size="sm" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
          <div>
            <h3 className="font-bold text-lg leading-tight line-clamp-1 drop-shadow-md">
              {donation.foodName}
            </h3>
            <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 drop-shadow">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{donation.pickupLocation}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Donor:
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {donation.donorName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
                Quantity
              </span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {donation.quantity} {donation.unit}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> Deadline
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                {donation.pickupDeadline ? new Date(donation.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
              </span>
            </div>
          </div>

          {donation.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {donation.description}
            </p>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ngo/donations/${donation.id}`)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Details
          </Button>

          {/* NGO Acceptance Action */}
          {userProfile?.role === 'NGO' && donation.status === 'AVAILABLE' && onAccept && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isAccepting}
              onClick={() => onAccept(donation)}
            >
              Accept Food
            </Button>
          )}

          {/* NGO Pickup Action */}
          {userProfile?.role === 'NGO' && donation.status === 'ACCEPTED' && donation.acceptedBy === userProfile.uid && onStatusUpdate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusUpdate(donation, 'PICKED_UP')}
            >
              Mark Picked Up
            </Button>
          )}

          {/* NGO Completion Action */}
          {userProfile?.role === 'NGO' && donation.status === 'PICKED_UP' && donation.acceptedBy === userProfile.uid && onStatusUpdate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStatusUpdate(donation, 'COMPLETED')}
            >
              Mark Completed
            </Button>
          )}

          {/* Donor Cancellation Action */}
          {userProfile?.role === 'DONOR' && donation.status === 'AVAILABLE' && donation.donorId === userProfile.uid && onCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(donation)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
