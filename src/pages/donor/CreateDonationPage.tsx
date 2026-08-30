import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FoodType } from '../../types';
import { createDonation } from '../../services/donationService';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/image/ImageUploader';
import { FoodSafetyBanner } from '../../components/common/FoodSafetyBanner';
import { Utensils, MapPin, Clock, Calendar, FileText, CheckCircle } from 'lucide-react';

export const CreateDonationPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('meals');
  const [foodType, setFoodType] = useState<FoodType>('VEGETARIAN');
  const [preparedAt, setPreparedAt] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState('');
  const [pickupLocation, setPickupLocation] = useState(userProfile?.location || '');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName || !quantity || !pickupLocation || !pickupDeadline) {
      setError('Please fill in all required donation details.');
      return;
    }

    if (!safetyConfirmed) {
      setError('You must explicitly acknowledge and confirm food safety suitability.');
      return;
    }

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
          foodName,
          quantity: Number(quantity),
          unit,
          foodType,
          preparedAt: preparedAt || new Date().toISOString(),
          pickupDeadline: new Date(pickupDeadline).toISOString(),
          pickupLocation,
          description,
          imageUrl: imageUrl || undefined,
          imagePublicId: imagePublicId || undefined,
          safetyConfirmed: true,
        },
        userProfile
      );

      showToast('Surplus food donation posted successfully!', 'success');
      navigate('/donor/donations');
    } catch (err: any) {
      setError(err.message || 'Failed to post donation.');
      showToast(err.message || 'Submission error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
            Food Rescue Listing Form
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Post Surplus Food Donation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provide details about surplus catered food so registered NGOs can accept and arrange pickup.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Food Details Group */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" /> Food Information
            </h3>

            <Input
              label="Food Item / Dish Name *"
              placeholder="e.g. Fresh Gourmet Veg Biryani & Curry Packages"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Quantity *"
                type="number"
                min="1"
                placeholder="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />

              <Select
                label="Unit *"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={[
                  { value: 'meals', label: 'Individual Meals' },
                  { value: 'boxes', label: 'Packed Boxes' },
                  { value: 'kg', label: 'Kilograms (kg)' },
                  { value: 'servings', label: 'Servings / Trays' },
                ]}
              />

              <Select
                label="Food Dietary Type *"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as FoodType)}
                options={[
                  { value: 'VEGETARIAN', label: 'Vegetarian Only' },
                  { value: 'NON_VEGETARIAN', label: 'Non-Vegetarian' },
                ]}
              />
            </div>
          </div>

          {/* Time & Logistics Group */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Logistics & Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Prepared Date / Time"
                type="datetime-local"
                value={preparedAt}
                onChange={(e) => setPreparedAt(e.target.value)}
                helperText="Approximate time food was prepared"
              />

              <Input
                label="Pickup Deadline *"
                type="datetime-local"
                value={pickupDeadline}
                onChange={(e) => setPickupDeadline(e.target.value)}
                helperText="Must be collected before this deadline"
                required
              />
            </div>

            <Input
              label="Pickup Address / Dock Location *"
              placeholder="Full address or pickup dock directions"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Packaging & Additional Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="Mention packaging type (foil wrapped, insulated containers), storage temperature, or special dock access notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload Group */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <ImageUploader
              onImageUploaded={(url, pubId) => {
                setImageUrl(url);
                if (pubId) setImagePublicId(pubId);
              }}
              onImageRemoved={() => {
                setImageUrl('');
                setImagePublicId('');
              }}
            />
          </div>

          {/* Safety Confirmation */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <FoodSafetyBanner compact />

            <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
              <input
                type="checkbox"
                id="donorSafetyConfirmed"
                checked={safetyConfirmed}
                onChange={(e) => setSafetyConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                required
              />
              <label htmlFor="donorSafetyConfirmed" className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                “I confirm that the donated food is suitable for donation and has been handled hygienically.”
              </label>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
              ⚠️ {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => navigate('/donor/dashboard')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Post Surplus Donation
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
