import type { DonationStatus } from '../types';

export const DONATION_STATUSES: Record<DonationStatus, { label: string; color: string; badgeBg: string; badgeText: string }> = {
  AVAILABLE: {
    label: 'Available',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'Available for NGO Pickup'
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'amber',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'Accepted by NGO'
  },
  PICKED_UP: {
    label: 'Picked Up',
    color: 'blue',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'In Transit / Picked Up'
  },
  COMPLETED: {
    label: 'Completed',
    color: 'green',
    badgeBg: 'bg-green-100 text-green-800 border-green-300',
    badgeText: 'Successfully Distributed'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'rose',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'Cancelled by Donor'
  }
};

export const ALLOWED_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  AVAILABLE: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PICKED_UP'],
  PICKED_UP: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
};

export const isValidStateTransition = (current: DonationStatus, next: DonationStatus): boolean => {
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(next);
};
