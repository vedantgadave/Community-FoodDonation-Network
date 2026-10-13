import React from 'react';
import { Button } from '../ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DonationNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  isSubmitting?: boolean;
  canContinue?: boolean;
}

export const DonationNavigation: React.FC<DonationNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onContinue,
  isSubmitting = false,
  canContinue = true,
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1 || isSubmitting}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back
      </Button>

      {isLastStep ? (
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          isLoading={isSubmitting}
          className="bg-emerald-700 hover:bg-emerald-800 px-6 py-3 text-sm font-bold shadow-md shadow-emerald-700/20"
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          {isSubmitting ? 'Publishing...' : '🍽 Post Surplus Food'}
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!canContinue}
          className="px-6 py-2.5 text-sm font-bold"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue
        </Button>
      )}
    </div>
  );
};
