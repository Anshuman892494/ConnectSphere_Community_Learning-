import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MapPin, Calendar, Clock, Edit2, X } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('Profile');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    avatar: '',
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
      // Remove coverImage from the API call or just send what we have
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
      <div className="max-w-[1100px] mx-auto p-6 animate-pulse">
        <div className="flex gap-4">
          <div className="w-[128px] h-[128px] bg-gray-200 rounded" />
          <div className="flex-1 space-y-4 py-2">
            <div className="w-1/3 h-8 bg-gray-200 rounded" />
            <div className="w-1/4 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="pt-10 max-w-[1100px] mx-auto">
        <EmptyState title="User not found" message="The user you are looking for does not exist." />
      </div>
    );
  }

  // Calculate mock stats based on posts
  const reputation = 1 + posts.reduce((acc, p) => acc + (p.likes?.length || 0) * 10, 0);
  const answers = posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0);
  const questions = posts.length;
  const reached = '~' + Math.floor((reputation * 13) / 1000) + 'k';

  return (
    <div className="max-w-[1100px] mx-auto text-[13px] text-gray-800 p-4 sm:p-6 font-sans">
      
      {/* Profile Header Block */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-32 h-32 flex-shrink-0 relative rounded overflow-hidden shadow-sm border border-gray-300 bg-white">
          {profileUser.avatar ? (
            <img src={profileUser.avatar} alt={profileUser.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-purple-600 text-white flex items-center justify-center text-[48px] font-bold uppercase">
              {profileUser.username.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-[34px] font-medium text-gray-900 leading-tight">
              {profileUser.username}
            </h1>
            {isOwnProfile && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1 border border-gray-400 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors shadow-sm bg-white"
              >
                <Edit2 size={14} /> <span className="font-medium text-[12px]">Edit profile</span>
              </button>
            )}
          </div>
          
          <div className="text-[21px] text-gray-600 mb-2 font-medium">
            {profileUser.role === 'admin' ? 'Community Administrator' : 'Software Developer'}
          </div>

          <ul className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500">
            <li className="flex items-center gap-1"><MapPin size={16} /> Earth</li>
            <li className="flex items-center gap-1"><Calendar size={16} /> Member for {Math.floor(Math.random() * 5) + 1} years, {Math.floor(Math.random() * 11) + 1} months</li>
            <li className="flex items-center gap-1"><Clock size={16} /> Last seen this week</li>
          </ul>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {['Profile', 'Activity', 'Saves', 'Settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-[100px] font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#F48024] text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Profile' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Stats */}
          <div className="w-full lg:w-[250px] flex-shrink-0">
            <h2 className="text-[21px] text-gray-900 mb-2 font-medium">Stats</h2>
            <div className="border border-gray-300 rounded p-3 bg-white grid grid-cols-2 gap-3 mb-6 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[17px] font-medium text-gray-900">{reputation.toLocaleString()}</span>
                <span className="text-gray-500">reputation</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-medium text-gray-900">{reached}</span>
                <span className="text-gray-500">reached</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-medium text-gray-900">{answers}</span>
                <span className="text-gray-500">answers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-medium text-gray-900">{questions}</span>
                <span className="text-gray-500">questions</span>
              </div>
            </div>
            
            <h2 className="text-[21px] text-gray-900 mb-2 font-medium">Top tags</h2>
            <div className="border border-gray-300 rounded p-3 bg-white shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[#39739D] bg-[#E1ECF4] px-1.5 py-0.5 rounded-[3px] text-[12px] hover:bg-[#D0E3F1] cursor-pointer">javascript</span>
                <div className="text-gray-500 flex gap-4"><span className="text-gray-900 font-bold">12</span> <span>score</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#39739D] bg-[#E1ECF4] px-1.5 py-0.5 rounded-[3px] text-[12px] hover:bg-[#D0E3F1] cursor-pointer">reactjs</span>
                <div className="text-gray-500 flex gap-4"><span className="text-gray-900 font-bold">8</span> <span>score</span></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#39739D] bg-[#E1ECF4] px-1.5 py-0.5 rounded-[3px] text-[12px] hover:bg-[#D0E3F1] cursor-pointer">css</span>
                <div className="text-gray-500 flex gap-4"><span className="text-gray-900 font-bold">5</span> <span>score</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: About & Posts */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[21px] text-gray-900 mb-2 font-medium">About</h2>
            <div className="mb-8 text-[15px] leading-relaxed text-gray-900 whitespace-pre-line">
              {profileUser.bio ? (
                profileUser.bio
              ) : (
                <span className="text-gray-400 italic">
                  {isOwnProfile ? 'Your about me is currently blank.' : 'Apparently, this user prefers to keep an air of mystery about them.'}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[21px] text-gray-900 font-medium">Top posts</h2>
            </div>
            
            <div className="border border-gray-300 rounded bg-white shadow-sm overflow-hidden">
              {posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-[15px]">
                  You have not created any posts yet.
                </div>
              ) : (
                <div className="flex flex-col">
                  {posts.slice(0, 5).map((post, idx) => (
                    <div key={post._id} className={`flex items-center p-3 hover:bg-gray-50 ${idx !== posts.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="w-[48px] flex-shrink-0 text-right pr-3">
                        <span className={`inline-block px-2 py-1 rounded text-[12px] ${post.likes?.length > 5 ? 'bg-green-600 text-white' : post.likes?.length > 0 ? 'border border-green-600 text-green-700' : 'text-gray-500'}`}>
                          {post.likes?.length || 0}
                        </span>
                      </div>
                      <Link to="/" className="flex-1 text-[#0074CC] hover:text-[#0A95FF] truncate font-medium">
                        {post.caption || 'Untitled Post'}
                      </Link>
                      <div className="text-gray-500 text-[12px] w-[90px] text-right flex-shrink-0">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'Profile' && (
        <div className="border border-gray-300 rounded p-8 text-center bg-white shadow-sm">
          <EmptyState title="Not implemented" message={`The ${activeTab} tab is currently under construction.`} />
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-[500px] rounded shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F8F9F9]">
              <h2 className="text-[21px] font-medium text-gray-900">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-900 p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              
              <div>
                <label className="block font-bold text-[15px] text-gray-900 mb-1">Profile Image URL</label>
                <input 
                  type="text" 
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 focus:border-[#0074CC] focus:ring-4 focus:ring-[#0074CC]/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[15px] text-gray-900 mb-1">About Me</label>
                <textarea 
                  rows={5}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 focus:border-[#0074CC] focus:ring-4 focus:ring-[#0074CC]/20 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#0A95FF] hover:bg-[#0074CC] text-white font-bold py-2 px-3 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-[#0074CC] hover:bg-[#E1ECF4] py-2 px-3 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
