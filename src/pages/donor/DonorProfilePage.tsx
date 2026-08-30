import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/userService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';

export const DonorProfilePage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [organizationName, setOrganizationName] = useState(userProfile?.organizationName || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setSaving(true);
    try {
      await updateUserProfile(userProfile.uid, {
        name,
        phone,
        organizationName,
        location,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-md">
            {userProfile?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Donor Profile & Contact Details
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Role: <span className="text-emerald-600 font-bold">{userProfile?.role}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Email Address"
            value={userProfile?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            helperText="Email address cannot be changed directly"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Contact"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Organization / Venue Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              leftIcon={<Building className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <Input
            label="Default Pickup Address / Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            required
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="primary" type="submit" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
