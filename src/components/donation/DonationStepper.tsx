import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  number: number;
  title: string;
  subtitle: string;
}

export const DONATION_STEPS: StepItem[] = [
  { number: 1, title: 'Food Details', subtitle: 'What are you donating?' },
  { number: 2, title: 'Safety & Storage', subtitle: 'Is it safe to distribute?' },
  { number: 3, title: 'Pickup Details', subtitle: 'Where can it be collected?' },
  { number: 4, title: 'Food Photo', subtitle: 'Show the donated food' },
  { number: 5, title: 'Review & Submit', subtitle: 'Check everything' },
];

interface DonationStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export const DonationStepper: React.FC<DonationStepperProps> = ({
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  const currentStepData = DONATION_STEPS.find(s => s.number === currentStep) || DONATION_STEPS[0];
  const percentCompleted = Math.round((currentStep / DONATION_STEPS.length) * 100);

  return (
    <div>
      {/* Desktop Horizontal Stepper */}
      <div className="hidden md:grid grid-cols-5 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        {DONATION_STEPS.map((step) => {
          const isCompleted = step.number < currentStep || completedSteps.includes(step.number);
          const isActive = step.number === currentStep;
          const isClickable = Boolean(onStepClick && (isCompleted || step.number <= currentStep));

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.number)}
              className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all duration-200 ${
                isClickable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60' : 'cursor-default opacity-70'
              } ${isActive ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isActive
                    ? 'bg-emerald-800 dark:bg-emerald-600 text-white ring-4 ring-emerald-600/20 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `0${step.number}`}
              </div>

              <div className="min-w-0 overflow-hidden">
                <span
                  className={`block text-[10px] font-extrabold uppercase tracking-wider leading-none mb-1 ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isCompleted
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Step 0{step.number}
                </span>
                <span
                  className={`block text-xs font-bold truncate leading-tight ${
                    isActive
                      ? 'text-slate-900 dark:text-slate-100'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {step.title}
                </span>
                <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                  {step.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Compact Progress Bar */}
      <div className="md:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Step {currentStep} of {DONATION_STEPS.length}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {currentStepData.title}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {percentCompleted}%
          </span>
        </div>

        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>
    </div>
  );
};
