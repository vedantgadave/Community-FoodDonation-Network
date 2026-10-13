import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { FoodType } from '../../types';
import { createDonation } from '../../services/donationService';

// Step & Sub-components
import { DonationStepper, DONATION_STEPS } from '../../components/donation/DonationStepper';
import { DonationPreview } from '../../components/donation/DonationPreview';
import { DonationNavigation } from '../../components/donation/DonationNavigation';
import { FoodDetailsStep, FOOD_CATEGORIES } from '../../components/donation/FoodDetailsStep';
import { SafetyStep, STORAGE_OPTIONS, PACKAGING_OPTIONS } from '../../components/donation/SafetyStep';
import { PickupDetailsStep } from '../../components/donation/PickupDetailsStep';
import { FoodImageStep } from '../../components/donation/FoodImageStep';
import { ReviewStep } from '../../components/donation/ReviewStep';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const CreateDonationPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Wizard Navigation State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Form Fields State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0].id);
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('meals');
  const [foodType, setFoodType] = useState<FoodType>('VEGETARIAN');

  // Safety & Storage State
  const getInitialTime = (hoursOffset: number = 0) => {
    const d = new Date(Date.now() + hoursOffset * 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [preparedAt, setPreparedAt] = useState<string>(() => getInitialTime(0));
  const [pickupDeadline, setPickupDeadline] = useState<string>(() => getInitialTime(6));
  const [storageCondition, setStorageCondition] = useState(STORAGE_OPTIONS[0].id);
  const [packagingCondition, setPackagingCondition] = useState(PACKAGING_OPTIONS[0]);
  const [safetyConfirmed, setSafetyConfirmed] = useState(true);

  // Logistics & Map State
  const [pickupLocation, setPickupLocation] = useState(userProfile?.location || '');
  const [pickupCoordinates, setPickupCoordinates] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [description, setDescription] = useState('');

  // Image Upload State
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Review State
  const [finalDeclarationChecked, setFinalDeclarationChecked] = useState(true);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step Validation
  const validateCurrentStep = (step: number): boolean => {
    setError('');

    if (step === 1) {
      if (!foodName.trim()) {
        setError('Food item name is required.');
        return false;
      }
      if (!quantity || quantity <= 0) {
        setError('Please enter a valid quantity greater than zero.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!preparedAt) {
        setError('Please enter the date and time when the food was prepared.');
        return false;
      }
      if (!pickupDeadline) {
        setError('Pickup deadline is required so NGOs know when surplus expires.');
        return false;
      }
      if (new Date(pickupDeadline) <= new Date(preparedAt)) {
        setError('Pickup deadline must be set to a time after the food preparation time.');
        return false;
      }
      if (!safetyConfirmed) {
        setError('You must explicitly confirm the hygiene and food safety suitability declaration.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!pickupLocation.trim()) {
        setError('Pickup location address and gate directions are required.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (isUploadingImage) {
        setError('Please wait for the photo upload to complete before continuing.');
        return false;
      }
      return true;
    }

    if (step === 5) {
      if (!finalDeclarationChecked) {
        setError('Please confirm the final suitability declaration before submitting.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleContinue = () => {
    if (validateCurrentStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }

      if (currentStep < DONATION_STEPS.length) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep || validateCurrentStep(currentStep)) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep(5)) return;

    if (!userProfile) {
      setError('You must be signed in to post a donation.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createDonation(
        {
          donorId: userProfile.uid,
          donorName: userProfile.name,
          donorPhone: userProfile.phone,
          donorLocation: userProfile.location,
          foodName: foodName.trim(),
          category,
          quantity: Number(quantity),
          unit,
          foodType,
          storageCondition,
          packagingFormat: packagingCondition,
          preparedAt: new Date(preparedAt).toISOString(),
          pickupDeadline: new Date(pickupDeadline).toISOString(),
          pickupLocation: pickupLocation.trim(),
          pickupCoordinates: pickupCoordinates || undefined,
          description: description.trim(),
          imageUrl: imageUrl || undefined,
          imagePublicId: imagePublicId || undefined,
          safetyConfirmed: true,
        },
        userProfile
      );

      showToast('Surplus food donation posted successfully! Nearby NGOs alerted.', 'success');
      navigate('/donor/donations');
    } catch (err: any) {
      setError(err.message || 'Failed to post donation.');
      showToast(err.message || 'Submission error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" /> Quality Verified Food Rescue
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Post Surplus Food
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Give your surplus food another destination in under 60 seconds.
        </p>
      </div>

      {/* 5-Step Stepper Progress Bar */}
      <DonationStepper
        currentStep={currentStep}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Current Active Form Step (65-70%) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {currentStep === 1 && (
            <FoodDetailsStep
              foodName={foodName}
              setFoodName={setFoodName}
              category={category}
              setCategory={setCategory}
              foodType={foodType}
              setFoodType={setFoodType}
              quantity={quantity}
              setQuantity={setQuantity}
              unit={unit}
              setUnit={setUnit}
              description={description}
              setDescription={setDescription}
            />
          )}

          {currentStep === 2 && (
            <SafetyStep
              preparedAt={preparedAt}
              setPreparedAt={setPreparedAt}
              pickupDeadline={pickupDeadline}
              setPickupDeadline={setPickupDeadline}
              storageCondition={storageCondition}
              setStorageCondition={setStorageCondition}
              packagingCondition={packagingCondition}
              setPackagingCondition={setPackagingCondition}
              safetyConfirmed={safetyConfirmed}
              setSafetyConfirmed={setSafetyConfirmed}
            />
          )}

          {currentStep === 3 && (
            <PickupDetailsStep
              pickupLocation={pickupLocation}
              setPickupLocation={setPickupLocation}
              pickupCoordinates={pickupCoordinates}
              setPickupCoordinates={setPickupCoordinates}
            />
          )}

          {currentStep === 4 && (
            <FoodImageStep
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              setImagePublicId={setImagePublicId}
              setIsUploadingImage={setIsUploadingImage}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              foodName={foodName}
              quantity={quantity}
              unit={unit}
              foodType={foodType}
              category={category}
              preparedAt={preparedAt}
              pickupDeadline={pickupDeadline}
              pickupLocation={pickupLocation}
              pickupCoordinates={pickupCoordinates}
              storageCondition={storageCondition}
              packagingCondition={packagingCondition}
              description={description}
              imageUrl={imageUrl}
              finalDeclarationChecked={finalDeclarationChecked}
              setFinalDeclarationChecked={setFinalDeclarationChecked}
            />
          )}

          {/* Navigation Controls */}
          <DonationNavigation
            currentStep={currentStep}
            totalSteps={DONATION_STEPS.length}
            onBack={handleBack}
            onContinue={handleContinue}
            isSubmitting={loading}
            canContinue={!isUploadingImage}
          />
        </div>

        {/* Right Column: Live Contextual Donation Preview Sidebar (30-35%) */}
        <aside className="lg:col-span-4 hidden lg:block">
          <DonationPreview
            foodName={foodName}
            quantity={quantity}
            unit={unit}
            foodType={foodType}
            category={category}
            storageCondition={storageCondition}
            preparedAt={preparedAt}
            pickupDeadline={pickupDeadline}
            pickupLocation={pickupLocation}
            imageUrl={imageUrl}
          />
        </aside>

      </div>
    </div>
  );
};
