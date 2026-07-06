import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronUp, ChevronDown, Bookmark, Clock, Share2, Flag, Trash2 } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();
  const { t } = useLanguage();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to retrieve question details.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const handleVote = async (voteType) => {
    try {
      const res = await API.post(`/posts/${id}/vote`, { voteType });
      setPost(res.data);
      addToast('Vote updated!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update vote.', 'error');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await API.post(`/posts/${id}/comment`, { text: newAnswer });
      setPost(res.data);
      setNewAnswer('');
      addToast('Answer posted successfully!', 'success');
    } catch (err) {
      addToast('Failed to post answer.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await API.delete(`/posts/${id}`);
      addToast('Question deleted successfully!', 'success');
      navigate('/');
    } catch (err) {
      addToast('Failed to delete question.', 'error');
    }
  };

  const handleDeleteAnswer = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;

    try {
      const res = await API.delete(`/posts/${id}/comment/${commentId}`);
      setPost(res.data);
      addToast('Answer deleted successfully!', 'success');
    } catch (err) {
      addToast('Failed to delete answer.', 'error');
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    // Basic sanitization
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Parse markdown headers
    escaped = escaped.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold mt-3 mb-1 text-gray-900">$1</h4>');
    escaped = escaped.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold mt-4 mb-2 text-gray-900">$1</h3>');
    escaped = escaped.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold mt-5 mb-3 text-gray-900">$1</h2>');

    // Parse code blocks
    escaped = escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-50 border border-gray-200 p-3 rounded font-mono text-[12px] overflow-x-auto my-3 text-gray-800">$2</pre>');

    // Parse inline code
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded font-mono text-[12px] text-red-600">$1</code>');

    // Parse lists
    escaped = escaped.replace(/^\s*\-\s+(.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
    escaped = escaped.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

    // Parse newlines
    escaped = escaped.replace(/\n\n/g, '</p><p class="mb-3">');
    escaped = escaped.replace(/\n/g, '<br/>');

    return `<p class="mb-3">${escaped}</p>`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F48024]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center text-gray-500 py-20">
        Question not found.
      </div>
    );
  }

  const upvotes = post.upvotes?.length ?? post.likes?.length ?? 0;
  const downvotes = post.downvotes?.length ?? 0;
  const voteBalance = upvotes - downvotes;

  const isUpvoted = post.upvotes?.includes(user?._id);
  const isDownvoted = post.downvotes?.includes(user?._id);
  const postOwnerName = post.user?.username || 'Unknown User';

  return (
    <div className="max-w-[1000px] mx-auto text-[13px] text-gray-800">
      {/* Header */}
      <div className="pb-4 mb-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h1 className="text-[24px] text-gray-900 font-normal leading-tight break-words flex-1">
            {post.caption}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="bg-[#0A95FF] hover:bg-[#0074CC] text-white px-3 py-2 rounded text-[13px] transition-colors whitespace-nowrap"
          >
            Ask Question
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Asked <span className="text-gray-800">{new Date(post.createdAt).toLocaleDateString()}</span></span>
          </div>
          <div>
            Active <span className="text-gray-800">{new Date(post.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Voting Column */}
        <div className="flex flex-col items-center flex-shrink-0 w-12 pt-2">
          <button
            onClick={() => handleVote('upvote')}
            className={`p-2 border rounded-full transition-colors ${
              isUpvoted
                ? 'bg-orange-100 border-orange-400 text-orange-600'
                : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-orange-500'
            }`}
            title="This question shows research effort; it is useful and clear"
          >
            <ChevronUp size={24} />
          </button>

          <span className="text-[20px] font-semibold my-2 text-gray-700">{voteBalance}</span>

          <button
            onClick={() => handleVote('downvote')}
            className={`p-2 border rounded-full transition-colors ${
              isDownvoted
                ? 'bg-orange-100 border-orange-400 text-orange-600'
                : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-orange-500'
            }`}
            title="This question does not show any research effort; it is not useful or clear"
          >
            <ChevronDown size={24} />
          </button>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`mt-4 p-2 transition-colors ${isBookmarked ? 'text-orange-500' : 'text-gray-300 hover:text-orange-500'}`}
          >
            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <div className="prose max-w-none mb-6">
            <div
              className="text-[15px] text-[#232629] leading-relaxed break-words markdown-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.description) }}
            />
          </div>

          {post.mediaUrl && (
            <div className="mb-6 rounded-md border border-gray-200 overflow-hidden max-w-lg">
              {post.type === 'video' ? (
                <video src={post.mediaUrl} controls className="w-full object-cover" />
              ) : (
                <img src={post.mediaUrl} alt="Attached context" className="w-full object-cover" />
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-6">
            {post.tags && post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[#39739D] bg-[#E1ECF4] px-1.5 py-1 rounded-[3px] text-[12px]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Share/Delete Actions & Owner info */}
          <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100 mb-6">
            <div className="flex gap-3 text-gray-500">
              <button className="hover:text-gray-800 cursor-pointer flex items-center gap-1">
                <Share2 size={13} /> Share
              </button>
              <button className="hover:text-gray-800 cursor-pointer flex items-center gap-1">
                <Flag size={13} /> Flag
              </button>
              {(user?.role === 'admin' || post.user?._id === user?._id || post.user === user?._id) && (
                <button
                  onClick={handleDeleteQuestion}
                  className="text-red-600 hover:text-red-800 cursor-pointer flex items-center gap-1 font-medium"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>

            {/* Author info card */}
            <div className="bg-[#EBF4FB] border border-[#d6e9f8] rounded p-2.5 w-[200px]">
              <span className="text-xs text-gray-500 block mb-1">
                asked {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                {post.user?.avatar ? (
                  <img src={post.user.avatar} alt={postOwnerName} className="w-8 h-8 rounded-sm object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-sm bg-purple-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                    {postOwnerName.charAt(0)}
                  </div>
                )}
                <div>
                  <Link to={`/profile/${postOwnerName}`} className="text-[#0074CC] hover:text-[#0A95FF] font-medium block">
                    {postOwnerName}
                  </Link>
                  <span className="text-[11px] text-gray-500 font-bold block" title="Mock reputation">
                    {Math.floor(Math.random() * 500) + 10}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="mb-8">
            <h2 className="text-[19px] text-gray-800 font-normal border-b border-gray-100 pb-2 mb-4">
              {post.comments?.length || 0} Answer{(post.comments?.length !== 1) ? 's' : ''}
            </h2>

            <div className="space-y-4">
              {post.comments && post.comments.map((comment) => {
                const commentOwnerName = comment.user?.username || 'Unknown User';
                const isCommentOwner = user?._id === comment.user?._id || user?._id === comment.user;

                return (
                  <div key={comment._id} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-[3px]">
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[14px] text-[#232629] leading-relaxed break-words mb-3 markdown-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.text) }}
                      />

                      <div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex gap-3 text-gray-500">
                          <button className="hover:text-gray-800 cursor-pointer">Share</button>
                          {(user?.role === 'admin' || isCommentOwner || post.user?._id === user?._id) && (
                            <button
                              onClick={() => handleDeleteAnswer(comment._id)}
                              className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {comment.user?.avatar ? (
                            <img src={comment.user.avatar} alt={commentOwnerName} className="w-5 h-5 rounded-sm object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold text-[9px] uppercase">
                              {commentOwnerName.charAt(0)}
                            </div>
                          )}
                          <Link to={`/profile/${commentOwnerName}`} className="text-[#0074CC] hover:text-[#0A95FF] font-medium">
                            {commentOwnerName}
                          </Link>
                          <span className="text-gray-400">
                            answered {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Answer Box */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-[19px] font-normal text-gray-800 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                placeholder="Write your answer here... Supports Markdown formatting."
                rows={8}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full border border-gray-300 rounded p-3 font-mono text-sm focus:border-[#0074CC] focus:ring-4 focus:ring-[#0074CC]/20 outline-none"
                required
              />
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <button
                  type="submit"
                  disabled={isSubmitting || !newAnswer.trim()}
                  className="bg-[#0A95FF] hover:bg-[#0074CC] text-white font-bold py-2 px-4 rounded-[3px] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Posting...' : 'Post Your Answer'}
                </button>
                <p className="text-xs text-gray-500">
                  Provide detailed explanations, code snippets, or reference links.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
