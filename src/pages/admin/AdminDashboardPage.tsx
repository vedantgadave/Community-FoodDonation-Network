import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import { getAllDonationsAdmin } from '../../services/donationService';
import { UserProfile, Donation } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  Utensils, 
  Package, 
  Clock, 
  HeartHandshake, 
  Truck, 
  CheckCircle2, 
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllDonationsAdmin()])
      .then(([uList, dList]) => {
        setUsers(uList);
        setDonations(dList);
      })
      .catch((err) => showToast(err.message || 'Admin load failed', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const stats = {
    totalUsers: users.length,
    donors: users.filter((u) => u.role === 'DONOR').length,
    ngos: users.filter((u) => u.role === 'NGO').length,
    totalDonations: donations.length,
    available: donations.filter((d) => d.status === 'AVAILABLE').length,
    accepted: donations.filter((d) => d.status === 'ACCEPTED').length,
    pickedUp: donations.filter((d) => d.status === 'PICKED_UP').length,
    completed: donations.filter((d) => d.status === 'COMPLETED').length,
    cancelled: donations.filter((d) => d.status === 'CANCELLED').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-800/40">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-purple-300 font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-purple-400" /> Platform Admin Moderation Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            System Operations & Metrics
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80 mt-1">
            Monitor real-time network activity, manage registered accounts, and enforce platform safety rules.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="outline" className="border-purple-700 text-white hover:bg-purple-900">
              Manage Users ({stats.totalUsers})
            </Button>
          </Link>
          <Link to="/admin/donations">
            <Button variant="primary">
              All Donations ({stats.totalDonations})
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} type="card" />
      ) : (
        <>
          {/* USER STATS */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
              User & Entity Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Accounts</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Food Donors</span>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.donors}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                  <Utensils className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Partner NGOs</span>
                  <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{stats.ngos}</p>
                </div>
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-xl">
                  <Building className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* DONATION LIFECYCLE STATS */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
              Donation Lifecycle Breakdown
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Listings</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.totalDonations}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase">Available</span>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.available}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase">Accepted</span>
                <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.accepted}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase">Picked Up</span>
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{stats.pickedUp}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase">Completed</span>
                <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">{stats.completed}</p>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
