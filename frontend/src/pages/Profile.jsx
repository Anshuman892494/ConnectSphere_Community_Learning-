import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Camera, Edit2, MapPin, Calendar, Link as LinkIcon, X } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { updateUser } from '../store/authSlice';
import EmptyState from '../components/common/EmptyState';

const Profile = () => {
  const { username } = useParams();
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    avatar: '',
    coverImage: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = loggedInUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(`/users/${username}`);
      setProfileUser(response.data.user);
      setPosts(response.data.posts);
      setEditForm({
        avatar: response.data.user.avatar || '',
        coverImage: response.data.user.coverImage || '',
        bio: response.data.user.bio || ''
      });
    } catch (err) {
      addToast('Failed to load profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await API.put('/users/profile', editForm);
      setProfileUser((prev) => ({ ...prev, ...response.data }));
      dispatch(updateUser(response.data));
      setIsEditModalOpen(false);
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center max-w-[935px] mx-auto pt-4 relative animate-pulse px-4">
        <div className="w-full space-y-4">
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full" />
          <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="pt-10">
        <EmptyState title="User not found" message="The user you are looking for does not exist." />
      </div>
    );
  }

  return (
    <div className="max-w-[935px] mx-auto pb-10">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 lg:h-80 w-full rounded-b-2xl md:rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-100 to-sky-100 dark:from-indigo-900/30 dark:to-sky-900/30 shadow-sm border-b border-neutral-200 dark:border-neutral-800">
        {profileUser.coverImage ? (
          <img src={profileUser.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <Camera size={48} className="text-indigo-500" />
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="px-4 md:px-8 relative -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-end gap-5">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-neutral-950 bg-white dark:bg-neutral-900 flex-shrink-0 overflow-hidden shadow-lg relative">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-5xl font-black text-white uppercase">
                  {profileUser.username.charAt(0)}
                </div>
              )}
            </div>
            <div className="pb-2 md:pb-4 hidden md:block">
              <h1 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-white drop-shadow-sm">
                {profileUser.username}
              </h1>
              <p className="text-neutral-500 font-bold">@{profileUser.username.toLowerCase()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-2 md:pb-4">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer">
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Mobile Name (shows below avatar on small screens) */}
        <div className="mt-4 md:hidden">
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            {profileUser.username}
          </h1>
          <p className="text-neutral-500 font-bold">@{profileUser.username.toLowerCase()}</p>
        </div>

        {/* Bio and Meta */}
        <div className="mt-6 md:mt-4 max-w-2xl">
          <p className="text-neutral-800 dark:text-neutral-200 text-[15px] leading-relaxed whitespace-pre-line font-medium">
            {profileUser.bio || (isOwnProfile ? 'Add a bio to tell people about yourself.' : 'No bio provided.')}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-neutral-500 dark:text-neutral-450">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            {profileUser.role === 'admin' && (
              <div className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Administrator
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 mt-5 text-sm">
            <div><span className="font-black text-neutral-900 dark:text-white">124</span> <span className="text-neutral-500 font-medium">Following</span></div>
            <div><span className="font-black text-neutral-900 dark:text-white">10.5K</span> <span className="text-neutral-500 font-medium">Followers</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-8 px-4 md:px-8">
          <div className="py-4 border-t-2 border-indigo-500 text-neutral-900 dark:text-white font-bold text-sm -mt-[1px]">
            Posts
          </div>
          <div className="py-4 text-neutral-500 font-bold text-sm cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Replies
          </div>
          <div className="py-4 text-neutral-500 font-bold text-sm cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Media
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 md:px-8 mt-6">
        {posts.length === 0 ? (
          <EmptyState title="No Posts Yet" message={`${isOwnProfile ? 'You haven\'t' : `${profileUser.username} hasn't`} posted anything yet.`} />
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-[600px]">
            {posts.map(post => (
              <div key={post._id} className="glassmorphism rounded-2xl p-4 border border-white/20 dark:border-neutral-800/40 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                    {post.user?.avatar ? (
                      <img src={post.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-black bg-neutral-800 text-white uppercase">
                        {post.user?.username?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-black text-sm text-neutral-900 dark:text-white">{post.user?.username}</div>
                    <div className="text-[11px] font-semibold text-neutral-400">{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {post.type === 'photo' && post.mediaUrl && (
                  <img src={post.mediaUrl} alt="Post" className="w-full rounded-xl mb-3 max-h-[400px] object-cover border border-neutral-100 dark:border-neutral-800" />
                )}
                {post.type === 'video' && post.mediaUrl && (
                  <video src={post.mediaUrl} controls className="w-full rounded-xl mb-3 max-h-[400px] bg-black border border-neutral-100 dark:border-neutral-800" />
                )}
                <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  {post.caption}
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/50 flex gap-4 text-xs font-bold text-neutral-500">
                  <span>{post.likes?.length || 0} Likes</span>
                  <span>{post.comments?.length || 0} Comments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-[500px] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-black text-neutral-900 dark:text-white">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-4 overflow-y-auto flex-1 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider">Cover Image URL</label>
                <input 
                  type="text" 
                  value={editForm.coverImage}
                  onChange={(e) => setEditForm({...editForm, coverImage: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider">Profile Picture URL</label>
                <input 
                  type="text" 
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-wider">Bio</label>
                <textarea 
                  rows={4}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-md mt-2"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
