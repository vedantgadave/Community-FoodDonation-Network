import React from 'react';
import { Donation } from '../../types';
import { CheckCircle2, Clock, Truck, HeartHandshake, XCircle, ChevronRight } from 'lucide-react';

interface DonationTimelineProps {
  donation: Donation;
}

export const DonationTimeline: React.FC<DonationTimelineProps> = ({ donation }) => {
  if (donation.status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 flex items-center gap-3">
        <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
        <div>
          <h5 className="text-sm font-bold text-rose-950 dark:text-rose-200">Donation Cancelled</h5>
          <p className="text-xs text-rose-800 dark:text-rose-300">
            This donation was cancelled by the donor on{' '}
            {donation.cancelledAt ? new Date(donation.cancelledAt).toLocaleString() : 'N/A'}.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    {
      key: 'CREATED',
      label: 'Posted',
      time: donation.createdAt,
      done: true,
      icon: Clock,
    },
    {
      key: 'ACCEPTED',
      label: 'Accepted by NGO',
      time: donation.acceptedAt,
      done: ['ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(donation.status),
      icon: HeartHandshake,
    },
    {
      key: 'PICKED_UP',
      label: 'Picked Up',
      time: donation.pickedUpAt,
      done: ['PICKED_UP', 'COMPLETED'].includes(donation.status),
      icon: Truck,
    },
    {
      key: 'COMPLETED',
      label: 'Distributed',
      time: donation.completedAt,
      done: donation.status === 'COMPLETED',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="py-2">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = step.done;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-3 flex-1 min-w-[130px]">
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDone ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {step.time ? new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="hidden md:block w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
