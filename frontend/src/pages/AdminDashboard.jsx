import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, BarChart2, MessageSquare, ShieldAlert, Award } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AppCard from '../components/layout/AppCard';
import AppLoader from '../components/common/AppLoader';
import AppTable from '../components/layout/AppTable';
import AppBadge from '../components/common/AppBadge';
import AppButton from '../components/common/AppButton';

const AdminDashboard = () => {
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await API.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      addToast('Failed to fetch administrative metrics', 'error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await API.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      addToast('Failed to fetch users database', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId, currentBlockedState) => {
    const actionWord = currentBlockedState ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${actionWord} this user?`)) return;

    try {
      const response = await API.put(`/admin/users/${userId}/block`);
      addToast(response.data.message, 'success');
      
      // Update local state list
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: !currentBlockedState } : u))
      );
      
      // Refresh statistics counters
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${actionWord} user`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Stats Cards */}
      {isLoadingStats ? (
        <AppLoader type="spinner" />
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Members</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                    {stats.metrics?.totalUsers}
                  </p>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <UserCheck size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold">
                Premium: {stats.metrics?.premiumUsers} VIP
              </p>
            </AppCard>

            <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Forum Questions</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                    {stats.metrics?.totalQuestions}
                  </p>
                </div>
                <div className="p-2 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-xl">
                  <MessageSquare size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold">
                Answers: {stats.metrics?.totalAnswers} posted
              </p>
            </AppCard>

            <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Social Posts</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                    {stats.metrics?.totalPosts}
                  </p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <BarChart2 size={20} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold">Photo/Video uploads</p>
            </AppCard>

            <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase">Security Logins</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                    {stats.metrics?.totalLogins}
                  </p>
                </div>
                <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl">
                  <ShieldAlert size={20} />
                </div>
              </div>
              <p className="text-[10px] text-rose-500 mt-2 font-bold">
                Failed Attempts: {stats.metrics?.failedLogins} flagged
              </p>
            </AppCard>
          </div>
        )
      )}

      {/* Users Accounts List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          User Directory & Moderation Controls
        </h3>

        <AppTable
          headers={['Username', 'Email', 'Role', 'Points', 'Status', 'Actions']}
          data={users}
          isLoading={isLoadingUsers}
          emptyTitle="Directory empty"
          emptyMessage="No users in the database."
          renderRow={(u) => (
            <>
              <td className="px-6 py-4 font-bold text-xs">
                {u.username}
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">
                {u.email}
              </td>
              <td className="px-6 py-4">
                <AppBadge variant={u.role === 'admin' ? 'danger' : 'primary'}>
                  {u.role}
                </AppBadge>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-amber-500">
                {u.points} XP
              </td>
              <td className="px-6 py-4">
                <AppBadge variant={u.isBlocked ? 'danger' : 'success'}>
                  {u.isBlocked ? 'Blocked' : 'Active'}
                </AppBadge>
              </td>
              <td className="px-6 py-4">
                {u.role !== 'admin' ? (
                  <AppButton
                    onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                    variant={u.isBlocked ? 'success' : 'danger'}
                    size="sm"
                    className="py-1 px-3"
                  >
                    {u.isBlocked ? 'Unban User' : 'Ban User'}
                  </AppButton>
                ) : (
                  <span className="text-xs text-slate-400 italic">No Actions</span>
                )}
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
