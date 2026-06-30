import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Heart, MessageSquare, Send, Trash2, X, Bookmark, MoreHorizontal } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/common/EmptyState';
import { useLanguage } from '../contexts/LanguageContext';

const Feed = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Post Creation fields
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Comment tracking
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (err) {
      addToast('Failed to retrieve social feed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Listen to the sidebar 'Create' button click event
  useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener('open-create-post-modal', handleOpenModal);
    return () => window.removeEventListener('open-create-post-modal', handleOpenModal);
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      addToast('Please enter a caption', 'warning');
      return;
    }

    // Default mock images if user leaves URL blank
    let finalMediaUrl = mediaUrl.trim();
    if (postType === 'photo' && !finalMediaUrl) {
      finalMediaUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60';
    } else if (postType === 'video' && !finalMediaUrl) {
      finalMediaUrl = 'https://assets.mixkit.co/videos/preview/mixkit-keyboard-typing-close-up-1582-large.mp4';
    }

    setIsSubmitting(true);
    try {
      const response = await API.post('/posts', {
        type: postType,
        mediaUrl: finalMediaUrl,
        caption,
      });
      setPosts((prev) => [response.data, ...prev]);
      setCaption('');
      setMediaUrl('');
      setPostType('text');
      setIsCreateModalOpen(false);
      addToast('Post created successfully!', 'success');
    } catch (err) {
      addToast('Failed to publish post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await API.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: response.data.likes } : p))
      );
    } catch (err) {
      addToast('Error updating like status', 'error');
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;

    try {
      const response = await API.post(`/posts/${postId}/comment`, { text });
      setPosts((prev) => prev.map((p) => (p._id === postId ? response.data : p)));
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
      addToast('Comment added', 'success');
    } catch (err) {
      addToast('Failed to add comment', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      addToast('Post deleted successfully!', 'success');
    } catch (err) {
      addToast('Failed to delete post', 'error');
    }
  };

  // Mock data for Stories
  const mockStories = [
    { id: 1, name: 'your_story', avatar: user?.avatar, isSelf: true },
    { id: 2, name: 'alex_dev', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60' },
    { id: 3, name: 'sarah_k', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60' },
    { id: 4, name: 'sneha_r', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60' },
    { id: 5, name: 'rahul_v', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60' },
    { id: 6, name: 'emma_w', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60' },
    { id: 7, name: 'tech_ninja', avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=60' }
  ];

  // Mock data for right suggestions
  const mockSuggestions = [
    { id: 1, username: 'dev_guru', relation: 'New to ConnectSphere', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60' },
    { id: 2, username: 'coder_bee', relation: 'Followed by alex_dev', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60' },
    { id: 3, username: 'tech_lead', relation: 'Popular in Community', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=60' },
    { id: 4, username: 'design_pro', relation: 'Followed by sarah_k', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="flex justify-center max-w-[935px] mx-auto pt-4 relative">
      {/* Main Column: Stories & Feed Posts */}
      <div className="w-full max-w-[600px] flex-shrink-0 lg:mr-8">
        
        {/* Stories Tray */}
        <div className="mb-6 p-4 glassmorphism rounded-2xl flex gap-4 overflow-x-auto scrollbar-none border border-white/20 dark:border-neutral-800/40 shadow-md">
          {mockStories.map((story) => (
            <div 
              key={story.id} 
              className="flex flex-col items-center flex-shrink-0 cursor-pointer"
              onClick={() => addToast(`${story.name}'s story clicked (demo)`, 'info')}
            >
              <div className={`h-16 w-16 rounded-full p-[2px] ${story.isSelf ? 'border border-neutral-300 dark:border-neutral-700' : 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-650'}`}>
                <div className="h-full w-full rounded-full bg-white/90 dark:bg-neutral-900/90 p-[2px]">
                  {story.avatar ? (
                    <img
                      src={story.avatar}
                      alt={story.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-250 flex items-center justify-center font-bold text-sm uppercase">
                      {story.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-neutral-500 mt-1.5 truncate max-w-[70px]">
                {story.isSelf ? 'Your Story' : story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="glassmorphism rounded-2xl p-4 space-y-4 border border-white/20 dark:border-neutral-800/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 animate-pulse" />
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-1/6 animate-pulse" />
                  </div>
                </div>
                <div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No Posts Yet"
            message="No posts yet! Be the first to share an update with the ConnectSphere community."
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isLiked = post.likes.includes(user?._id);
              const postOwnerName = post.user?.username || 'Unknown User';
              
              return (
                <article key={post._id} className="glassmorphism rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-neutral-800/40 transition-all duration-300 hover:shadow-indigo-500/5">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-3.5 border-b border-neutral-100 dark:border-neutral-900">
                    <div className="flex items-center gap-3">
                      {post.user?.avatar ? (
                        <img
                          src={post.user.avatar}
                          alt={postOwnerName}
                          className="h-8 w-8 rounded-full object-cover border border-neutral-100 dark:border-neutral-800"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black flex items-center justify-center font-bold text-xs uppercase">
                          {postOwnerName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer">
                            {postOwnerName}
                          </span>
                          <span className="text-neutral-450 dark:text-neutral-500 text-xs">•</span>
                          <span className="text-neutral-450 dark:text-neutral-500 text-xs">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          @{postOwnerName.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    {(user?.role === 'admin' || post.user?._id === user?._id || post.user === user?._id) && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-neutral-450 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Post Media Content */}
                  {post.type === 'photo' && post.mediaUrl && (
                    <div className="bg-neutral-50 dark:bg-neutral-950 max-h-[500px] flex items-center justify-center border-b border-neutral-100 dark:border-neutral-900">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="object-contain w-full max-h-[500px]"
                      />
                    </div>
                  )}

                  {post.type === 'video' && post.mediaUrl && (
                    <div className="bg-neutral-50 dark:bg-neutral-950 max-h-[500px] flex items-center justify-center border-b border-neutral-100 dark:border-neutral-900">
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-full max-h-[500px] object-contain"
                      />
                    </div>
                  )}

                  {/* Post Actions Footer */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`transition-transform active:scale-90 cursor-pointer ${
                            isLiked ? 'text-rose-500' : 'text-neutral-800 dark:text-neutral-200 hover:text-neutral-500'
                          }`}
                        >
                          <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        
                        <button
                          onClick={() =>
                            setActiveCommentsPostId(
                              activeCommentsPostId === post._id ? null : post._id
                            )
                          }
                          className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 transition-colors cursor-pointer"
                        >
                          <MessageSquare size={24} />
                        </button>

                        <button 
                          onClick={() => addToast('Link copied to clipboard!', 'success')}
                          className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 transition-colors cursor-pointer"
                        >
                          <Send size={24} />
                        </button>
                      </div>

                      <button 
                        onClick={() => addToast('Post saved to bookmarks!', 'success')}
                        className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 transition-colors cursor-pointer"
                      >
                        <Bookmark size={24} />
                      </button>
                    </div>

                    {/* Likes Count */}
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {post.likes?.length || 0} {t('likes')}
                    </div>

                    {/* Caption Section */}
                    <div className="text-sm text-neutral-850 dark:text-neutral-200 leading-relaxed">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 mr-2 hover:underline cursor-pointer">
                        {postOwnerName}
                      </span>
                      {post.caption}
                    </div>

                    {/* Comments Toggle */}
                    {post.comments && post.comments.length > 0 && (
                      <button
                        onClick={() =>
                          setActiveCommentsPostId(
                            activeCommentsPostId === post._id ? null : post._id
                          )
                        }
                        className="text-xs text-neutral-500 dark:text-neutral-400 hover:underline block"
                      >
                        {activeCommentsPostId === post._id 
                          ? 'Hide comments' 
                          : `View all ${post.comments.length} comments`}
                      </button>
                    )}

                    {/* Comments Drawer / List */}
                    {activeCommentsPostId === post._id && (
                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 space-y-3">
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                            {post.comments.map((comment) => (
                              <div key={comment._id} className="flex gap-2.5 items-start text-xs">
                                {comment.user?.avatar ? (
                                  <img
                                    src={comment.user.avatar}
                                    alt={comment.user?.username}
                                    className="h-6 w-6 rounded-full object-cover border border-neutral-100"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-[9px] uppercase">
                                    {comment.user?.username ? comment.user.username.charAt(0) : 'U'}
                                  </div>
                                )}
                                <div className="flex-1 leading-snug">
                                  <div>
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 mr-1.5 hover:underline cursor-pointer">
                                      {comment.user?.username}
                                    </span>
                                    <span className="text-neutral-700 dark:text-neutral-300">
                                      {comment.text}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-neutral-400 block mt-0.5">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="flex items-center border-t border-neutral-200/50 dark:border-neutral-800/50 pt-2.5 gap-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentTexts[post._id] || ''}
                            onChange={(e) =>
                              setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post._id);
                            }}
                            className="w-full text-xs bg-neutral-100/50 dark:bg-neutral-900/30 px-3 py-2 rounded-xl border border-neutral-200/50 dark:border-neutral-800/40 text-neutral-850 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 transition-all duration-200"
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            disabled={!commentTexts[post._id]?.trim()}
                            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 disabled:opacity-30 cursor-pointer px-1"
                          >
                            {t('postButton')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: User Profile Switch & Suggestions */}
      <div className="hidden lg:block w-[320px] flex-shrink-0">
        <div className="sticky top-6 space-y-4">
          
          {/* User Account block */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-14 w-14 rounded-full object-cover border border-neutral-200 dark:border-neutral-850"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-neutral-850 text-white dark:bg-neutral-200 dark:text-black flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                  {user.username.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate hover:underline cursor-pointer">
                  {user.username}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                  {user.role === 'admin' ? 'Administrator' : 'ConnectSphere Member'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => addToast('Logged in as ' + user.username, 'info')}
              className="text-xs font-bold text-sky-500 hover:text-sky-700 cursor-pointer"
            >
              Switch
            </button>
          </div>

          {/* Suggestions Header */}
          <div className="flex items-center justify-between pt-4">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              {t('suggestions')}
            </span>
            <button 
              onClick={() => addToast('Feature coming soon!', 'info')}
              className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-neutral-500"
            >
              {t('seeAll')}
            </button>
          </div>

          {/* Suggestions List */}
          <div className="space-y-3.5">
            {mockSuggestions.map((sug) => (
              <div key={sug.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={sug.avatar}
                    alt={sug.username}
                    className="h-8 w-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-850"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer">
                      {sug.username}
                    </span>
                    <span className="text-[10px] text-neutral-450 dark:text-neutral-500">
                      {sug.relation}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => addToast(`Followed ${sug.username}!`, 'success')}
                  className="text-xs font-bold text-sky-500 hover:text-sky-700 cursor-pointer"
                >
                  {t('follow')}
                </button>
              </div>
            ))}
          </div>

          {/* Extra Links Footer */}
          <footer className="text-[11px] text-neutral-400 dark:text-neutral-600 pt-8 leading-normal space-y-4">
            <div>
              {t('about')} • {t('help')} • {t('press')} • API • {t('jobs')} • {t('privacy')} • {t('terms')} • {t('locations')} • {t('language')}
            </div>
            <div>
              © 2026 CONNECTSPHERE FROM ELEVANCE SKILLS
            </div>
          </footer>
        </div>
      </div>

      {/* CREATE POST POPUP MODAL (Instagram-Style) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          {/* Close button outside modal */}
          <button 
            onClick={() => setIsCreateModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-neutral-350 cursor-pointer"
          >
            <X size={28} />
          </button>

          <div className="glassmorphism bg-white/90 dark:bg-neutral-900/90 w-full max-w-[700px] h-[500px] rounded-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 dark:border-neutral-800/40 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Left side: Media preview */}
            <div className="w-full md:w-3/5 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center p-4 relative min-h-[200px] md:min-h-0">
              {postType === 'photo' && mediaUrl ? (
                <img 
                  src={mediaUrl} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain"
                />
              ) : postType === 'video' && mediaUrl ? (
                <video 
                  src={mediaUrl} 
                  controls 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full border border-dashed border-neutral-400 flex items-center justify-center text-neutral-400">
                    <PlusSquare size={24} />
                  </div>
                  <div className="text-xs text-neutral-400">
                    {postType === 'text' 
                      ? 'No preview for Text Posts' 
                      : 'Provide a Media Link to see preview'}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Info details & form */}
            <form onSubmit={handleCreatePost} className="w-full md:w-2/5 flex flex-col h-full bg-white dark:bg-neutral-900 justify-between">
              {/* Modal Header */}
              <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-850 flex items-center justify-between font-semibold text-sm text-neutral-850 dark:text-neutral-100">
                <span>{t('createPost')}</span>
                <button
                  type="submit"
                  disabled={isSubmitting || !caption.trim()}
                  className="text-sky-500 hover:text-sky-700 disabled:opacity-40 font-bold cursor-pointer"
                >
                  {isSubmitting ? 'Sharing...' : t('share')}
                </button>
              </div>

              {/* Form Content body */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {/* Profile header */}
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-7 w-7 rounded-full object-cover border border-neutral-200"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.username.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                    {user.username}
                  </span>
                </div>

                {/* Caption Input */}
                <textarea
                  placeholder={t('writeCaption')}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  required
                  className="w-full text-sm bg-transparent border-none text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none resize-none"
                />

                <hr className="border-neutral-100 dark:border-neutral-850" />

                {/* Attachment Type dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {t('postFormat')}
                  </label>
                  <select
                    value={postType}
                    onChange={(e) => {
                      setPostType(e.target.value);
                      if (e.target.value === 'text') setMediaUrl('');
                    }}
                    className="w-full text-xs border border-neutral-200 dark:border-neutral-800 rounded bg-transparent p-2 text-neutral-800 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="text">{t('plainText')}</option>
                    <option value="photo">{t('photoImage')}</option>
                    <option value="video">{t('videoClip')}</option>
                  </select>
                </div>

                {/* Optional Media URL input */}
                {postType !== 'text' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {t('mediaLink')}
                    </label>
                    <input
                      type="text"
                      placeholder="Paste image/video URL..."
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full text-xs border border-neutral-200 dark:border-neutral-800 rounded bg-transparent p-2 text-neutral-855 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
