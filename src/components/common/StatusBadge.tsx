import React from 'react';
import { DonationStatus } from '../../types';
import { DONATION_STATUSES } from '../../constants';

interface StatusBadgeProps {
  status: DonationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = DONATION_STATUSES[status] || {
    label: status,
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-xs font-bold';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs tracking-wide uppercase ${config.badgeBg} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75 animate-pulse" />
      {config.label}
    </span>
  );
};
