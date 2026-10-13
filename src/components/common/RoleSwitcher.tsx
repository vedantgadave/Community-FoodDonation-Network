import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { UserRole } from '../../types';
import { ArrowLeftRight, Building, Heart, CheckCircle2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RoleSwitcherProps {
  onClose?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onClose, className = '', isCompact = false }) => {
  const { userProfile, switchActiveRole, requestNgoRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [orgName, setOrgName] = useState(userProfile?.organizationName || '');
  const [distributionLocation, setDistributionLocation] = useState(userProfile?.location || '');

  if (!userProfile) return null;
  if (userProfile.role === 'ADMIN') return null; // Admins do not switch via this control

  const isDonor = userProfile.role === 'DONOR';

  const hasNgoAuthorization = userProfile.authorizedRoles?.includes('NGO') || false;
  const verificationStatus = userProfile.ngoVerificationStatus || (userProfile.role === 'NGO' ? 'VERIFIED' : 'NONE');

  const handleRoleSwitch = async (targetRole: UserRole) => {
    if (targetRole === userProfile.role) return;

    if (targetRole === 'NGO' && !hasNgoAuthorization) {
      // Prompt onboarding registration flow
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    try {
      await switchActiveRole(targetRole);
      showToast(`Switched active role to ${targetRole === 'DONOR' ? 'Donor' : 'Receiver / NGO'}`, 'success');
      if (onClose) onClose();
      if (targetRole === 'DONOR') {
        navigate('/donor/dashboard');
      } else {
        navigate('/ngo/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to switch roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAsNgo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !distributionLocation.trim()) {
      showToast('Please provide your organization name and pickup location.', 'error');
      return;
    }

    setLoading(true);
    try {
      await requestNgoRole(orgName.trim(), distributionLocation.trim());
      showToast('Successfully registered as Receiver / NGO! Welcome.', 'success');
      setShowUpgradeModal(false);
      if (onClose) onClose();
      navigate('/ngo/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Current Active Role Indicator */}
      <div className="flex items-center justify-between text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <span className="text-slate-500 dark:text-slate-400">Current Role:</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
          isDonor
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
        }`}>
          {isDonor ? <Heart className="w-3 h-3 text-emerald-600" /> : <Building className="w-3 h-3 text-teal-600" />}
          {isDonor ? 'Donor' : 'Receiver / NGO'}
        </span>
      </div>

      {/* Switch Button */}
      <button
        onClick={() => handleRoleSwitch(isDonor ? 'NGO' : 'DONOR')}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
          isDonor
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        } disabled:opacity-50`}
      >
        <ArrowLeftRight className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span>{isDonor ? 'Switch to Receiver / NGO' : 'Switch to Donor'}</span>
      </button>

      {/* Verification Status Pill if NGO */}
      {hasNgoAuthorization && (
        <div className="flex items-center justify-between px-2 text-[10px] text-slate-500">
          <span>NGO Status:</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> {verificationStatus}
          </span>
        </div>
      )}

      {/* Upgrade to NGO Registration Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold">
                <Building className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Register as Receiver / NGO
                </h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are currently registered as a Food Donor. To accept and claim surplus food donations,
              please provide your organization details. You can easily switch back to your Donor profile at any time!
            </p>

            <form onSubmit={handleRegisterAsNgo} className="space-y-3">
              <Input
                label="Organization / Community Group Name"
                placeholder="e.g. City Harvest Shelter / Helping Hands"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />

              <Input
                label="Distribution Hub / Pickup Address"
                placeholder="e.g. 104 Hope St, Downtown Hub"
                value={distributionLocation}
                onChange={(e) => setDistributionLocation(e.target.value)}
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={loading}
                >
                  Register & Switch Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
