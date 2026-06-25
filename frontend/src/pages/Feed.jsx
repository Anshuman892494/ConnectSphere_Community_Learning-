import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Heart, MessageSquare, Image, Video, Send, Trash2 } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import AppTextarea from '../components/common/AppTextarea';
import AppSelect from '../components/common/AppSelect';
import AppCard from '../components/layout/AppCard';
import AppAvatar from '../components/common/AppAvatar';
import AppLoader from '../components/common/AppLoader';
import EmptyState from '../components/common/EmptyState';

const Feed = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Post Creation fields
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      addToast('Please enter a caption', 'warning');
      return;
    }

    // Default mock images if user selects photo/video but leaves URL blank
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
      addToast('Post created! +5 Points Awarded', 'success');
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
      await API.delete(`/admin/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      addToast('Post deleted by Admin moderation', 'success');
    } catch (err) {
      addToast('Failed to delete post', 'error');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Area: Main Feed */}
      <div className="flex-1 space-y-6">
        {/* Post Creation Form */}
        <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard glassmorphism">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Share Knowledge or Updates</h3>
            
            <AppTextarea
              placeholder="What are you learning today? Type details here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              required
            />

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <AppSelect
                label="Attachment Type"
                value={postType}
                onChange={(e) => {
                  setPostType(e.target.value);
                  if (e.target.value === 'text') setMediaUrl('');
                }}
                options={[
                  { value: 'text', label: 'Plain Text' },
                  { value: 'photo', label: 'Photo Image' },
                  { value: 'video', label: 'Video Clip' },
                ]}
              />

              {postType !== 'text' && (
                <AppInput
                  label="Media Link (Optional)"
                  placeholder="Paste URL or leave blank for a mock default"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-darkborder/50 pt-3">
              <AppButton
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Publish Post
              </AppButton>
            </div>
          </form>
        </AppCard>

        {/* Posts List */}
        {isLoading ? (
          <AppLoader type="skeleton" rows={3} />
        ) : posts.length === 0 ? (
          <EmptyState
            title="Feed is empty"
            message="No posts yet! Be the first to share an update with the ConnectSphere community."
          />
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked = post.likes.includes(user?._id);
              const postOwnerName = post.user?.username || 'Unknown User';
              
              return (
                <AppCard key={post._id} className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AppAvatar
                        name={postOwnerName}
                        src={post.user?.avatar}
                        size="md"
                        isPremium={post.user?.subscription?.status === 'premium'}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {postOwnerName}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-xs">
                            @{postOwnerName.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString()} at{' '}
                          {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Post Caption */}
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    {post.caption}
                  </p>

                  {/* Post Media Content */}
                  {post.type === 'photo' && post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-darkborder/50 bg-slate-50 dark:bg-slate-900 max-h-96 flex items-center justify-center">
                      <img
                        src={post.mediaUrl}
                        alt="Shared Photo Attachment"
                        className="object-cover max-h-96 w-full"
                      />
                    </div>
                  )}

                  {post.type === 'video' && post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-darkborder/50 bg-slate-50 dark:bg-slate-900">
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  )}

                  {/* Post Actions Footer */}
                  <div className="flex items-center gap-6 border-t border-slate-100 dark:border-darkborder/40 pt-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                        isLiked
                          ? 'text-rose-500 hover:text-rose-600'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{post.likes?.length || 0} Likes</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentsPostId(
                          activeCommentsPostId === post._id ? null : post._id
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      <MessageSquare size={16} />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>
                  </div>

                  {/* Active Comments Area */}
                  {activeCommentsPostId === post._id && (
                    <div className="mt-4 border-t border-slate-100 dark:border-darkborder/40 pt-4 space-y-4">
                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                          {post.comments.map((comment) => (
                            <div key={comment._id} className="flex gap-2.5 items-start bg-slate-50/50 dark:bg-darkbg/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-darkborder/30">
                              <AppAvatar
                                name={comment.user?.username}
                                src={comment.user?.avatar}
                                size="sm"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {comment.user?.username}
                                  </span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <AppInput
                          placeholder="Write a comment reply..."
                          value={commentTexts[post._id] || ''}
                          onChange={(e) =>
                            setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post._id);
                          }}
                        />
                        <AppButton
                          onClick={() => handleAddComment(post._id)}
                          variant="secondary"
                          className="px-3"
                        >
                          <Send size={14} />
                        </AppButton>
                      </div>
                    </div>
                  )}
                </AppCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Area: Extra side widget details (e.g. system leader board overview) */}
      <div className="hidden lg:block w-72 space-y-6">
        <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            💡 Learning Tips
          </h3>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <span>📚</span>
              <span>Post helpful codes, summaries, and explanations to increase reputation.</span>
            </li>
            <li className="flex gap-2">
              <span>💬</span>
              <span>Ask structured questions in the board. Be descriptive and add helpful tags.</span>
            </li>
            <li className="flex gap-2">
              <span>🎁</span>
              <span>Send point gifts to users who answered your questions or shared good posts.</span>
            </li>
          </ul>
        </AppCard>
      </div>
    </div>
  );
};

export default Feed;
