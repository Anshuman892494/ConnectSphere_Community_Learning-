import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { UserPlus, UserCheck, Edit2, ShieldAlert, Award, Clock } from 'lucide-react';
import API from '../services/api';
import { updateUser } from '../store/authSlice';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import AppTextarea from '../components/common/AppTextarea';
import AppCard from '../components/layout/AppCard';
import AppAvatar from '../components/common/AppAvatar';
import AppBadge from '../components/common/AppBadge';
import AppLoader from '../components/common/AppLoader';
import EmptyState from '../components/common/EmptyState';

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  
  // Edit Profile form fields
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const profileId = id || currentUser?._id;
      
      // Fetch main profile details
      const response = await API.get(`/users/profile/${profileId}`);
      setProfileUser(response.data);
      setBio(response.data.bio || '');
      setAvatar(response.data.avatar || '');

      // If viewing self, fetch friends & pending friend requests
      if (profileId === currentUser?._id) {
        const friendsRes = await API.get('/users/friends');
        setFriendsList(friendsRes.data.friends || []);
        setFriendRequests(friendsRes.data.friendRequests || []);
      } else {
        setFriendsList(response.data.friends || []);
      }
    } catch (err) {
      addToast('Failed to load profile metadata', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, currentUser?._id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await API.put('/users/profile', { bio, avatar });
      setProfileUser((prev) => ({ ...prev, bio: response.data.bio, avatar: response.data.avatar }));
      dispatch(updateUser({ bio: response.data.bio, avatar: response.data.avatar }));
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile settings', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await API.post(`/users/friend-request/${profileUser._id}`);
      addToast('Friend request sent!', 'success');
      fetchProfileData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send request', 'error');
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await API.post(`/users/friend-accept/${requestId}`);
      addToast('Friend request accepted! +10 Points Awarded', 'success');
      
      // Update local state lists
      setFriendRequests((prev) => prev.filter((r) => r._id !== requestId));
      fetchProfileData();
    } catch (err) {
      addToast('Failed to accept request', 'error');
    }
  };

  if (isLoading) return <AppLoader type="spinner" />;
  if (!profileUser) return <EmptyState title="User Profile Not Found" message="The user you are trying to view does not exist." />;

  const isSelf = profileUser._id === currentUser?._id;
  const isFriend = currentUser?.friends?.includes(profileUser._id) || profileUser.friends?.some(f => f._id === currentUser?._id);

  return (
    <div className="space-y-6">
      {/* Banner / Header Card */}
      <AppCard className="p-6 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard glassmorphism">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <AppAvatar
            name={profileUser.username}
            src={profileUser.avatar}
            size="xl"
            isPremium={profileUser.subscription?.status === 'premium'}
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                {profileUser.username}
              </h2>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <AppBadge variant={profileUser.role === 'admin' ? 'danger' : 'primary'}>
                  {profileUser.role === 'admin' ? 'Admin 🛡️' : 'Member 🎓'}
                </AppBadge>
                {profileUser.subscription?.status === 'premium' && (
                  <AppBadge variant="warning">PREMIUM 👑</AppBadge>
                )}
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
              {profileUser.bio || 'This member has not written a biography yet.'}
            </p>

            {/* Score Grid details */}
            <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
              <div className="text-center sm:text-left">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Total Points</p>
                <p className="text-sm font-black text-amber-500 flex items-center gap-1">
                  <Award size={14} />
                  {profileUser.points} XP
                </p>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-darkborder" />
              <div className="text-center sm:text-left">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Reputation</p>
                <p className="text-sm font-black text-emerald-500">
                  {profileUser.reputation} REP
                </p>
              </div>
            </div>
          </div>

          {/* Social controls actions */}
          <div className="flex-shrink-0">
            {isSelf ? (
              <AppButton
                onClick={() => setIsEditing(!isEditing)}
                variant="secondary"
                className="flex items-center gap-1.5"
              >
                <Edit2 size={14} />
                Edit Profile
              </AppButton>
            ) : isFriend ? (
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-xl border border-emerald-200/50">
                <UserCheck size={16} />
                Friends Connected
              </div>
            ) : (
              <AppButton
                onClick={handleSendFriendRequest}
                variant="primary"
                className="flex items-center gap-1.5"
              >
                <UserPlus size={16} />
                Connect Friend
              </AppButton>
            )}
          </div>
        </div>
      </AppCard>

      {/* Edit Profile Form Overlay/Drawer */}
      {isSelf && isEditing && (
        <AppCard className="p-6 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Edit Settings</h3>
            
            <AppInput
              label="Avatar Image Link"
              placeholder="Paste direct URL link (jpg, png, etc.)"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />

            <AppTextarea
              label="Biography"
              placeholder="Tell the community about yourself, your learning goals..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-darkborder/50 pt-4">
              <AppButton
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                isLoading={isUpdatingProfile}
              >
                Save Updates
              </AppButton>
            </div>
          </form>
        </AppCard>
      )}

      {/* Two columns: Connections list vs Friend requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Friends Connected */}
        <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            Connections ({friendsList.length})
          </h3>
          {friendsList.length === 0 ? (
            <p className="text-xs text-slate-400">No connections yet.</p>
          ) : (
            <div className="space-y-3">
              {friendsList.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-darkbg/20 border border-slate-100 dark:border-darkborder/40"
                >
                  <div className="flex items-center gap-2.5">
                    <AppAvatar
                      name={friend.username}
                      src={friend.avatar}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {friend.username}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {friend.points} XP • {friend.reputation} REP
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AppCard>

        {/* Friend Requests (Only for Self) */}
        {isSelf && (
          <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
              Pending Requests ({friendRequests.length})
            </h3>
            {friendRequests.length === 0 ? (
              <p className="text-xs text-slate-400">No pending friend requests.</p>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-darkbg/20 border border-slate-100 dark:border-darkborder/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <AppAvatar
                        name={req.username}
                        src={req.avatar}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {req.username}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {req.reputation} REP
                        </p>
                      </div>
                    </div>
                    <AppButton
                      onClick={() => handleAcceptFriendRequest(req._id)}
                      variant="success"
                      size="sm"
                    >
                      Accept
                    </AppButton>
                  </div>
                ))}
              </div>
            )}
          </AppCard>
        )}
      </div>
    </div>
  );
};

export default Profile;
