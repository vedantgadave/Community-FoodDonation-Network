import React, { useState, useEffect } from 'react';
import { getAllUsers, toggleBlockUser, updateNgoVerificationStatus } from '../../services/userService';
import type { UserProfile, UserRole } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { Search, ShieldAlert, UserX, UserCheck, Users, ShieldCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .catch((err) => showToast(err.message || 'Error fetching users', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateVerification = async (user: UserProfile, status: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      await updateNgoVerificationStatus(user.uid, status);
      showToast(`NGO verification status updated to ${status}.`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update verification status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmToggleBlock = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    const nextState = !selectedUser.isBlocked;
    try {
      await toggleBlockUser(selectedUser.uid, nextState);
      showToast(
        `User '${selectedUser.name}' has been ${nextState ? 'blocked' : 'unblocked'}.`,
        nextState ? 'warning' : 'success'
      );
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.includes(term) ||
      (u.organizationName && u.organizationName.toLowerCase().includes(term));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" /> Account Moderation & User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review registered Donors and NGOs. Block inappropriate users to restrict platform write access.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Input
          placeholder="Search name, email, or organization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'DONOR', 'NGO', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <LoadingSkeleton count={4} type="table" />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-4">User Identity</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Organization / Location</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Verification</th>\n                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div>{u.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          u.role === 'DONOR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'NGO'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{u.organizationName || '—'}</div>
                      <div className="text-[10px] text-slate-400">{u.location}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.phone}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.role === 'NGO' ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            u.ngoVerificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : u.ngoVerificationStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {u.ngoVerificationStatus || 'PENDING'}
                          </span>
                          {u.ngoVerificationStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => handleUpdateVerification(u, 'VERIFIED')}
                              disabled={actionLoading}
                              className="text-[10px] font-bold text-teal-600 hover:underline flex items-center gap-0.5"
                            >
                              <ShieldCheck className="w-3 h-3" /> Approve
                            </button>
                          )}
                          {u.ngoVerificationStatus !== 'REJECTED' && u.ngoVerificationStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => handleUpdateVerification(u, 'REJECTED')}
                              disabled={actionLoading}
                              className="text-[10px] font-bold text-rose-500 hover:underline"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isBlocked ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-full text-[10px]">
                          RESTRICTED / BLOCKED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant={u.isBlocked ? 'outline' : 'danger'}
                          size="sm"
                          onClick={() => setSelectedUser(u)}
                          leftIcon={u.isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        >
                          {u.isBlocked ? 'Unblock User' : 'Block User'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Block / Unblock Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onConfirm={handleConfirmToggleBlock}
        title={selectedUser?.isBlocked ? 'Unblock Account?' : 'Restrict / Block Account?'}
        message={
          selectedUser?.isBlocked
            ? `Restoring access for '${selectedUser?.name}' will allow them to resume creating or accepting food donations.`
            : `Blocking '${selectedUser?.name}' will immediately revoke write access and prevent them from creating or accepting food listings.`
        }
        confirmText={selectedUser?.isBlocked ? 'Yes, Unblock' : 'Yes, Block Account'}
        isDanger={!selectedUser?.isBlocked}
        isLoading={actionLoading}
      />
    </div>
  );
};
