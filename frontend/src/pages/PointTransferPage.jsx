import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Send, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import API from '../services/api';
import { updateUser } from '../store/authSlice';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import AppCard from '../components/layout/AppCard';
import AppLoader from '../components/common/AppLoader';
import AppTable from '../components/layout/AppTable';

const PointTransferPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();

  const [receiverUsername, setReceiverUsername] = useState('');
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchTransferHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await API.get('/transfers/history');
      setHistory(response.data);
    } catch (err) {
      addToast('Failed to load transaction history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchTransferHistory();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    const pts = parseInt(points);

    if (isNaN(pts) || pts <= 0) {
      addToast('Please enter a valid positive points value', 'warning');
      return;
    }

    if (user.points < pts) {
      addToast(`Insufficient points. You only have ${user.points} points.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await API.post('/transfers', {
        receiverUsername,
        points: pts,
        description,
      });

      // Update Redux state
      dispatch(updateUser({ points: response.data.senderPoints }));
      addToast(response.data.message, 'success');
      
      // Clear form
      setReceiverUsername('');
      setPoints('');
      setDescription('');
      
      // Refresh history log
      fetchTransferHistory();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to complete transaction', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-1 space-y-6">
          <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard glassmorphism">
            <form onSubmit={handleTransfer} className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Point Transfers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can gift your points to other community members to reward helpful answers or posts.
              </p>

              <div className="bg-slate-50 dark:bg-darkbg/40 p-3 rounded-xl border border-slate-100 dark:border-darkborder">
                <span className="text-xs text-slate-500 dark:text-slate-400">Your Current Balance</span>
                <p className="text-lg font-black text-amber-500">{user?.points || 0} XP</p>
              </div>

              <AppInput
                label="Recipient Username"
                placeholder="e.g. johndoe"
                value={receiverUsername}
                onChange={(e) => setReceiverUsername(e.target.value)}
                required
              />

              <AppInput
                label="Amount of Points"
                type="number"
                placeholder="e.g. 50"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
              />

              <AppInput
                label="Message / Reason"
                placeholder="e.g. Thanks for the quick React help!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <AppButton
                type="submit"
                variant="primary"
                className="w-full flex items-center justify-center gap-1.5"
                isLoading={isSubmitting}
              >
                <Send size={14} />
                Send Points
              </AppButton>
            </form>
          </AppCard>
        </div>

        {/* Right Column: Transaction Logs */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Transfer Logs
          </h3>

          <AppTable
            headers={['Type', 'User details', 'Amount', 'Date', 'Message']}
            data={history}
            isLoading={isLoadingHistory}
            emptyTitle="No transfer logs"
            emptyMessage="You have not completed any peer point transactions yet."
            renderRow={(tx) => {
              const isSender = tx.sender?._id === user?._id;
              return (
                <>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        isSender ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {isSender ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {isSender ? 'Sent' : 'Received'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-xs">
                    {isSender ? `To: ${tx.receiver?.username}` : `From: ${tx.sender?.username}`}
                  </td>
                  <td className="px-6 py-4 text-xs font-black">
                    {isSender ? '-' : '+'}{tx.points} XP
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs italic text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {tx.description}
                  </td>
                </>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PointTransferPage;
