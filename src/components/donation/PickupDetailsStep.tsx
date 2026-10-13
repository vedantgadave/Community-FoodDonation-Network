import React from 'react';
import { Input } from '../ui/Input';
import { LocationPicker } from '../map/LocationPicker';
import { MapPin } from 'lucide-react';

interface PickupDetailsStepProps {
  pickupLocation: string;
  setPickupLocation: (val: string) => void;
  pickupCoordinates?: { latitude: number; longitude: number };
  setPickupCoordinates: (coords?: { latitude: number; longitude: number }) => void;
}

export const PickupDetailsStep: React.FC<PickupDetailsStepProps> = ({
  pickupLocation,
  setPickupLocation,
  pickupCoordinates,
  setPickupCoordinates,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
          Step 03 / Logistics & Pickup
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Where can it be collected?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Set the pickup point so an NGO can locate and dispatch transport promptly.
        </p>
      </div>

      <Input
        label="Pickup Address / Dock Location *"
        placeholder="Full address, gate instructions, contact person, or loading dock number"
        value={pickupLocation}
        onChange={(e) => setPickupLocation(e.target.value)}
        leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
        helperText="Be detailed to prevent NGO drivers from losing time at security gates."
        required
      />

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Pin Exact Location on Map
        </label>
        <LocationPicker
          selectedCoordinates={pickupCoordinates}
          onLocationSelected={(coords) => setPickupCoordinates(coords)}
          onLocationCleared={() => setPickupCoordinates(undefined)}
        />
      </div>
    </div>
  );
};
