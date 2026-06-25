import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Heart, MessageSquare, Send, Trash2 } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Area: Main Feed */}
      <div className="flex-1 space-y-6">
        {/* Post Creation Form */}
        <div className="p-5 border border-slate-200 dark:border-darkborder bg-white dark:bg-darkcard rounded-2xl shadow-sm">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Share Knowledge or Updates</h3>
            
            <textarea
              placeholder="What are you learning today? Type details here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-darkborder rounded-xl bg-white dark:bg-darkbg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Attachment Type
                </label>
                <select
                  value={postType}
                  onChange={(e) => {
                    setPostType(e.target.value);
                    if (e.target.value === 'text') setMediaUrl('');
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-darkborder rounded-xl bg-white dark:bg-darkbg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="text">Plain Text</option>
                  <option value="photo">Photo Image</option>
                  <option value="video">Video Clip</option>
                </select>
              </div>

              {postType !== 'text' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Media Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Paste URL or leave blank for default"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-darkborder rounded-xl bg-white dark:bg-darkbg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-darkborder/50 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
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
                <div key={post._id} className="p-5 border border-slate-200 dark:border-darkborder bg-white dark:bg-darkcard rounded-2xl shadow-sm">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {post.user?.avatar ? (
                        <img
                          src={post.user.avatar}
                          alt={postOwnerName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                          {postOwnerName.charAt(0)}
                        </div>
                      )}
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

                    {/* Moderation / Owner Controls */}
                    {(user?.role === 'admin' || post.user?._id === user?._id || post.user === user?._id) && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
                        alt="Post media"
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
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
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
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
                              {comment.user?.avatar ? (
                                <img
                                  src={comment.user.avatar}
                                  alt={comment.user?.username}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                                  {comment.user?.username ? comment.user.username.charAt(0) : 'U'}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {comment.user?.username}
                                  </span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-650 dark:text-slate-305 mt-1">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Write a comment reply..."
                          value={commentTexts[post._id] || ''}
                          onChange={(e) =>
                            setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post._id);
                          }}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-darkborder rounded-xl bg-white dark:bg-darkbg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-darkborder dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Area: Extra side widget details */}
      <div className="hidden lg:block w-72 space-y-6">
        <div className="p-5 border border-slate-200 dark:border-darkborder bg-white dark:bg-darkcard rounded-2xl shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            💡 Learning Tips
          </h3>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <span>📚</span>
              <span>Post helpful codes, summaries, and explanations to build community reputation.</span>
            </li>
            <li className="flex gap-2">
              <span>💬</span>
              <span>Ask questions or share updates to start interesting discussions.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Feed;
