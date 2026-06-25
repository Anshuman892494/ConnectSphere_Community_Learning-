import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AppCard from '../components/layout/AppCard';
import AppLoader from '../components/common/AppLoader';
import AppTable from '../components/layout/AppTable';
import AppBadge from '../components/common/AppBadge';

const SecurityMonitoring = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSecurityLogs = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/auth/security-logs');
      setLogs(response.data);
    } catch (err) {
      addToast('Failed to load security monitoring log history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview Intro Card */}
      <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard glassmorphism flex items-start gap-4">
        <div className="p-2.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl">
          <ShieldCheck size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Security Monitoring Center</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Review the latest access records for your account. If you spot unauthorized logins or unrecognized IP locations, we recommend changing your security password immediately.
          </p>
        </div>
      </AppCard>

      {/* Security Logs List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Login Activity Logs
        </h3>

        <AppTable
          headers={['Status', 'IP address', 'Browser / Agent', 'Time']}
          data={logs}
          isLoading={isLoading}
          emptyTitle="No log data"
          emptyMessage="Your login records are currently empty."
          renderRow={(log) => (
            <>
              <td className="px-6 py-4">
                <AppBadge variant={log.status === 'success' ? 'success' : 'danger'}>
                  {log.status === 'success' ? 'Successful' : 'Failed Attempt'}
                </AppBadge>
              </td>
              <td className="px-6 py-4 text-xs font-mono font-bold">
                {log.ipAddress}
              </td>
              <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-500 dark:text-slate-400" title={log.userAgent}>
                {log.userAgent}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                {new Date(log.timestamp).toLocaleDateString()} at{' '}
                {new Date(log.timestamp).toLocaleTimeString()}
              </td>
            </>
          )}
        />
      </div>
    </div>
  );
};

export default SecurityMonitoring;
