import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/userService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Building, Mail, Phone, MapPin, User, ShieldCheck } from 'lucide-react';
import { RoleSwitcher } from '../../components/common/RoleSwitcher';

export const NgoProfilePage: React.FC = () => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(userProfile?.name || '');
  const [orgName, setOrgName] = useState(userProfile?.organizationName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setSaving(true);
    try {
      await updateUserProfile(userProfile.uid, {
        name,
        organizationName: orgName,
        phone,
        location,
      });
      showToast('NGO profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Role Management Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" /> Account Role & Permissions
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Switch to your Donor profile if you have surplus food to post, or remain as NGO to accept donations.
        </p>
        <div className="max-w-xs pt-1">
          <RoleSwitcher />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-16 h-16 rounded-full bg-teal-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-md">
            {userProfile?.organizationName?.charAt(0).toUpperCase() || userProfile?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              NGO Organization Profile
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Active Role: <span className="text-teal-600 font-bold">{userProfile?.role}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Organization / NGO Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            leftIcon={<Building className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Contact Person Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Registered Email"
            value={userProfile?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            helperText="Organization email cannot be modified directly"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Direct Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Primary Distribution Hub"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="primary" type="submit" isLoading={saving}>
              Save NGO Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
