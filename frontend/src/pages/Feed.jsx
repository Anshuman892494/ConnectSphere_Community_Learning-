import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Trash2, X, PlusSquare } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('Interesting');

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

  useEffect(() => {
    const handleOpenModal = () => setIsCreateModalOpen(true);
    window.addEventListener('open-create-post-modal', handleOpenModal);
    return () => window.removeEventListener('open-create-post-modal', handleOpenModal);
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      addToast('Please enter a question', 'warning');
      return;
    }

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
      addToast('Question asked successfully!', 'success');
    } catch (err) {
      addToast('Failed to publish question', 'error');
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
      addToast('Error updating vote status', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      addToast('Question deleted successfully!', 'success');
    } catch (err) {
      addToast('Failed to delete question', 'error');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex justify-center max-w-[1100px] mx-auto text-[13px] text-gray-800">
      {/* Main Content Column */}
      <div className="flex-1 max-w-[750px] mr-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-[27px] text-gray-900">Top Questions</h1>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0A95FF] hover:bg-[#0074CC] text-white px-3 py-2 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] text-[13px] transition-colors"
          >
            Ask Question
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-end mb-4 border-b border-gray-200">
          <div className="flex border border-gray-400 rounded bg-white text-[13px] mb-[-1px]">
            {['Interesting', 'Bountied', 'Hot', 'Week', 'Month'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 border-r border-gray-400 last:border-r-0 hover:bg-gray-50 transition-colors ${activeTab === tab ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex p-4 border-b border-gray-200 gap-4">
                <div className="w-[80px] h-16 bg-gray-200 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No questions yet"
            message="Be the first to ask a question on ConnectSphere."
          />
        ) : (
          <div className="border-t border-gray-200">
            {posts.map((post) => {
              const isLiked = post.likes.includes(user?._id);
              const postOwnerName = post.user?.username || 'Unknown User';
              const votes = post.likes?.length || 0;
              const answers = post.comments?.length || 0;
              const views = Math.floor(Math.random() * 100) + votes * 2; // Mock views
              const tags = postType === 'text' ? ['javascript', 'react'] : ['media', 'discussion'];

              return (
                <div key={post._id} className="flex p-4 border-b border-gray-200 gap-4 hover:bg-gray-50 transition-colors relative">
                  
                  {/* Left Stats Block */}
                  <div className="flex flex-col items-end flex-shrink-0 w-[108px] gap-1 text-[13px] text-gray-500">
                    <div className="text-gray-900 text-sm">
                      <span className="font-medium">{votes}</span> votes
                    </div>
                    <div className={`px-1 py-0.5 rounded ${answers > 0 ? 'text-green-700 border border-green-600' : ''}`}>
                      <span className="font-medium">{answers}</span> answers
                    </div>
                    <div className="text-gray-500">
                      {views} views
                    </div>
                    <div className="mt-2 flex gap-1">
                      <button onClick={() => handleLike(post._id)} className={`border px-1 py-0.5 rounded text-[10px] ${isLiked ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`} title="Upvote">
                        ▲
                      </button>
                    </div>
                  </div>

                  {/* Right Content Block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[17px] text-[#0074CC] hover:text-[#0A95FF] mb-1 font-medium leading-tight line-clamp-2 cursor-pointer">
                        {post.caption}
                      </h3>
                      
                      {(user?.role === 'admin' || post.user?._id === user?._id || post.user === user?._id) && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-gray-400 hover:text-red-600 ml-2 mt-1"
                          title="Delete Post"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-[13px] text-[#3B4045] line-clamp-2 mb-2 leading-relaxed">
                      {post.mediaUrl ? 'View attached media for more context on this question.' : 'I am working on a project and I encountered this issue. Can someone explain why this is happening?'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-1">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {tags.map(tag => (
                          <span key={tag} className="text-[#39739D] bg-[#E1ECF4] hover:bg-[#D0E3F1] px-1.5 py-1 rounded-[3px] text-[12px] cursor-pointer">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center text-[12px] text-gray-500 ml-4 gap-2 flex-shrink-0">
                        {post.user?.avatar ? (
                          <img src={post.user.avatar} alt={postOwnerName} className="w-4 h-4 rounded-sm object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-sm bg-purple-600 text-white flex items-center justify-center font-bold text-[8px] uppercase">
                            {postOwnerName.charAt(0)}
                          </div>
                        )}
                        <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer">
                          {postOwnerName}
                        </span>
                        <span className="font-bold text-gray-600" title="Reputation score">
                          {Math.floor(Math.random() * 500) + 10}
                        </span>
                        <span>asked {formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Sidebar Column */}
      <div className="hidden lg:block w-[300px] flex-shrink-0">
        
        {/* Yellow Info Block */}
        <div className="border border-[#E6E4C4] bg-[#FDF7E2] rounded-[3px] shadow-sm mb-4">
          <ul className="text-[13px] text-gray-800">
            <li className="bg-[#FBF3D5] font-bold py-3 px-4 border-b border-[#E6E4C4]">
              The Overflow Blog
            </li>
            <li className="flex items-start px-4 py-3 border-b border-[#E6E4C4]">
              <span className="text-gray-900 mr-2 mt-0.5">✏️</span>
              <span className="hover:text-[#0074CC] cursor-pointer">Designing a better interface for our users</span>
            </li>
            <li className="bg-[#FBF3D5] font-bold py-3 px-4 border-b border-[#E6E4C4]">
              Featured on Meta
            </li>
            <li className="flex items-start px-4 py-3">
              <span className="text-[#0074CC] mr-2 mt-0.5">💬</span>
              <span className="hover:text-[#0074CC] cursor-pointer">Updating our Community Guidelines and Code of Conduct</span>
            </li>
          </ul>
        </div>

        {/* Hot Network Questions */}
        <div className="mb-4">
          <h4 className="text-[15px] text-gray-800 mb-3 ml-2">Hot Network Questions</h4>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="w-4 h-4 bg-blue-100 text-blue-800 flex items-center justify-center font-bold rounded-sm text-[8px] mr-2 flex-shrink-0 mt-0.5">S</div>
              <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer leading-tight">How to perfectly align a div using Tailwind CSS?</span>
            </li>
            <li className="flex items-start">
              <div className="w-4 h-4 bg-orange-100 text-orange-800 flex items-center justify-center font-bold rounded-sm text-[8px] mr-2 flex-shrink-0 mt-0.5">M</div>
              <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer leading-tight">Is there a mathematical formula for aesthetic design?</span>
            </li>
            <li className="flex items-start">
              <div className="w-4 h-4 bg-green-100 text-green-800 flex items-center justify-center font-bold rounded-sm text-[8px] mr-2 flex-shrink-0 mt-0.5">W</div>
              <span className="text-[#0074CC] hover:text-[#0A95FF] cursor-pointer leading-tight">Best practices for React directory structure in 2026</span>
            </li>
          </ul>
        </div>

      </div>

      {/* ASK QUESTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[800px] rounded shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#F8F9F9] rounded-t">
              <h2 className="text-[21px] font-medium text-gray-900">Ask a public question</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto flex-1">
              <div className="bg-[#EBF4FB] border border-[#A6CEED] p-4 rounded mb-6 text-[#3B4045]">
                <h3 className="font-bold mb-2">Writing a good question</h3>
                <p className="mb-2">You're ready to ask a programming-related question and this form will help guide you through the process.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Summarize your problem in a one-line title.</li>
                  <li>Describe your problem in more detail.</li>
                  <li>Describe what you tried and what you expected to happen.</li>
                </ul>
              </div>

              <div className="border border-gray-300 p-6 rounded bg-white mb-6">
                <label className="block font-bold text-[15px] text-gray-900 mb-1">Title</label>
                <p className="text-[12px] text-gray-500 mb-2">Be specific and imagine you're asking a question to another person.</p>
                <input
                  type="text"
                  placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:border-[#0074CC] focus:ring-4 focus:ring-[#0074CC]/20 outline-none"
                  required
                />
              </div>

              <div className="border border-gray-300 p-6 rounded bg-white mb-6">
                <label className="block font-bold text-[15px] text-gray-900 mb-1">What are the details of your problem?</label>
                <p className="text-[12px] text-gray-500 mb-2">Introduce the problem and expand on what you put in the title. Minimum 20 characters.</p>
                
                <div className="flex gap-4 mb-4">
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="border border-gray-300 rounded p-2 text-sm focus:border-[#0074CC] outline-none"
                  >
                    <option value="text">Standard Text Question</option>
                    <option value="photo">Include Image Snippet</option>
                    <option value="video">Include Video Demonstration</option>
                  </select>
                  
                  {postType !== 'text' && (
                    <input
                      type="text"
                      placeholder="Media URL..."
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="flex-1 border border-gray-300 rounded p-2 focus:border-[#0074CC] outline-none"
                    />
                  )}
                </div>

                <textarea
                  placeholder="Describe your issue here..."
                  rows={8}
                  className="w-full border border-gray-300 rounded p-3 font-mono text-sm focus:border-[#0074CC] focus:ring-4 focus:ring-[#0074CC]/20 outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !caption.trim()}
                  className="bg-[#0A95FF] hover:bg-[#0074CC] text-white font-bold py-2 px-3 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post your question'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-red-700 hover:bg-red-50 py-2 px-3 rounded transition-colors"
                >
                  Discard draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
