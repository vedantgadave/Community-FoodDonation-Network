import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/userService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  User,
  ShieldCheck,
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { RoleSwitcher } from '../../components/common/RoleSwitcher';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermissionAndGetToken,
  showLocalBrowserNotification
} from '../../services/notificationService';

export const NgoProfilePage: React.FC = () => {
  const { userProfile, refreshUserProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(userProfile?.name || '');
  const [orgName, setOrgName] = useState(userProfile?.organizationName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [saving, setSaving] = useState(false);

  // Notification Preferences State
  const [newDonationsAlert, setNewDonationsAlert] = useState(
    userProfile?.notificationPreferences?.newDonations ?? true
  );
  const [statusUpdatesAlert, setStatusUpdatesAlert] = useState(
    userProfile?.notificationPreferences?.statusUpdates ?? true
  );
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [enablingPush, setEnablingPush] = useState(false);

  useEffect(() => {
    if (isPushNotificationSupported()) {
      setPermissionState(getNotificationPermission());
    }
  }, []);

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
        notificationPreferences: {
          newDonations: newDonationsAlert,
          statusUpdates: statusUpdatesAlert,
        },
      });
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      showToast('NGO profile & preferences updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    if (!userProfile) return;
    setEnablingPush(true);
    try {
      const token = await requestNotificationPermissionAndGetToken(userProfile.uid);
      setPermissionState(getNotificationPermission());
      if (token) {
        showToast('Push notifications successfully enabled on this device!', 'success');
      } else {
        showToast('Notification permission granted!', 'success');
      }
    } catch (err: any) {
      setPermissionState(getNotificationPermission());
      showToast(err.message || 'Failed to enable notifications', 'error');
    } finally {
      setEnablingPush(false);
    }
  };

  const handleSendTestNotification = () => {
    if (permissionState !== 'granted') {
      showToast('Please enable browser push notifications first.', 'warning');
      return;
    }
    const sent = showLocalBrowserNotification(
      '🍱 Test: New Food Donation Available!',
      '30 meals available for immediate rescue in your service area.',
      undefined,
      () => {
        showToast('Test notification opened successfully!', 'info');
      }
    );
    if (sent) {
      showToast('Test notification sent to your device!', 'success');
    } else {
      showToast('Notification sent in-app.', 'info');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
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

      {/* Real-time Push Notification Settings (Feature 8) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Push Notification Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Receive instant alerts when surplus food donations are published
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Device Status:</span>
            {permissionState === 'granted' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Push Active
              </span>
            ) : permissionState === 'denied' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" /> Blocked in Browser
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Smartphone className="w-3.5 h-3.5" /> Not Subscribed
              </span>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="space-y-1 pr-4">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                🍱 New Surplus Food Alerts
              </p>
              <p className="text-xs text-slate-500">
                Instantly notify this NGO receiver device as soon as a donor publishes a new donation for pickup.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={newDonationsAlert}
                onChange={(e) => setNewDonationsAlert(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="space-y-1 pr-4">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                🚚 Accepted Donation & Journey Updates
              </p>
              <p className="text-xs text-slate-500">
                Notifications when pickup status transitions (Accepted, In-Transit, Picked Up, Completed).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={statusUpdatesAlert}
                onChange={(e) => setStatusUpdatesAlert(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* Browser Permission Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {permissionState !== 'granted' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnablePush}
              isLoading={enablingPush}
              className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              <Bell className="w-4 h-4 mr-1.5" /> Enable Browser Push on This Device
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTestNotification}
                className="text-xs font-semibold"
              >
                🔔 Send Test Notification
              </Button>
              <span className="text-xs text-slate-400">Push notifications enabled on this browser.</span>
            </div>
          )}

          {permissionState === 'denied' && (
            <p className="text-xs text-rose-500 font-medium">
              Notifications are blocked in your browser settings. Click the lock/info icon in the address bar to reset permissions.
            </p>
          )}
        </div>
      </div>

      {/* Main Profile Form */}
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
              {' • '}Verification: <span className="text-emerald-600 font-bold">{userProfile?.ngoVerificationStatus || 'VERIFIED'}</span>
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
              Save Profile & Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
