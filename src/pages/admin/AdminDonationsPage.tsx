import React, { useState, useEffect } from 'react';
import { getAllDonationsAdmin } from '../../services/donationService';
import type { Donation } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Package, Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDonationsPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    getAllDonationsAdmin()
      .then(setDonations)
      .catch((err) => showToast(err.message || 'Error fetching donations', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = donations.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      d.foodName.toLowerCase().includes(term) ||
      d.donorName.toLowerCase().includes(term) ||
      d.pickupLocation.toLowerCase().includes(term) ||
      (d.acceptedByName && d.acceptedByName.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Package className="w-6 h-6 text-purple-600" /> Platform Food Donations Audit
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete network audit log of all posted surplus food listings across all lifecycle states.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Input
          placeholder="Search food item, donor, or NGO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      {loading ? (
        <LoadingSkeleton count={4} type="table" />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">Food Item</th>
                  <th className="py-3.5 px-4">Quantity & Type</th>
                  <th className="py-3.5 px-4">Donor Information</th>
                  <th className="py-3.5 px-4">Assigned NGO</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div>{d.foodName}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {d.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-emerald-600">{d.quantity} {d.unit}</div>
                      <div className="text-[10px] text-slate-400">{d.foodType}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{d.donorName}</div>
                      <div className="text-[10px] text-slate-400">{d.pickupLocation}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {d.acceptedByName || 'Unassigned'}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/ngo/donations/${d.id}`)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
