import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MessageSquare, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import AppTextarea from '../components/common/AppTextarea';
import AppCard from '../components/layout/AppCard';
import AppAvatar from '../components/common/AppAvatar';
import AppBadge from '../components/common/AppBadge';
import AppLoader from '../components/common/AppLoader';
import EmptyState from '../components/common/EmptyState';
import AppModal from '../components/layout/AppModal';

const QAList = () => {
  const { addToast } = useToast();
  
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  // Ask Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = async (search = '', tag = '') => {
    try {
      setIsLoading(true);
      let url = '/qa/questions';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (tag) params.push(`tag=${encodeURIComponent(tag)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await API.get(url);
      setQuestions(response.data);
    } catch (err) {
      addToast('Failed to load questions.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(searchTerm, selectedTag);
  }, [selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions(searchTerm, selectedTag);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      addToast('Please enter title and body content', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await API.post('/qa/questions', {
        title: newTitle,
        body: newBody,
        tags: newTags,
      });
      setQuestions((prev) => [response.data, ...prev]);
      setNewTitle('');
      setNewBody('');
      setNewTags('');
      setIsModalOpen(false);
      addToast('Question posted successfully! +5 Points Awarded', 'success');
      fetchQuestions(); // Refresh list to get populated user fields
    } catch (err) {
      addToast('Failed to post question', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract a list of hot tags from current loaded questions
  const getHotTags = () => {
    const tagCounts = {};
    questions.forEach((q) => {
      if (q.tags) {
        q.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 6);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Q&A Column */}
      <div className="flex-1 space-y-6">
        {/* Sub Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b border-slate-100 dark:border-darkborder pb-5">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search questions (e.g. 'React hooks', 'recursion')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkborder bg-white dark:bg-darkcard text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
              />
            </div>
            <AppButton type="submit" variant="secondary">
              Search
            </AppButton>
          </form>

          <AppButton
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="flex items-center gap-1.5 w-full sm:w-auto"
          >
            <Plus size={16} />
            Ask Question
          </AppButton>
        </div>

        {/* Selected Tag Filter Banner */}
        {selectedTag && (
          <div className="bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 p-3 rounded-xl flex items-center justify-between border border-primary-200/50">
            <span className="text-xs font-semibold">
              Filtering questions with tag: <strong className="uppercase">{selectedTag}</strong>
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className="text-xs font-bold hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Questions Cards */}
        {isLoading ? (
          <AppLoader type="skeleton" rows={4} />
        ) : questions.length === 0 ? (
          <EmptyState
            title="No questions found"
            message="We couldn't find any questions matching your filters. Try checking your spelling or ask a new question!"
            actionLabel="Ask a Question"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-darkborder/50 bg-white dark:bg-darkcard rounded-xl border border-slate-100 dark:border-darkborder shadow-sm">
            {questions.map((question) => {
              const score = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
              const authorName = question.user?.username || 'Member';
              
              return (
                <div key={question._id} className="p-5 flex gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  {/* Stats Counter */}
                  <div className="flex flex-col items-center justify-center text-center w-12 flex-shrink-0 bg-slate-50 dark:bg-darkbg/50 p-2.5 rounded-xl border border-slate-100 dark:border-darkborder/50">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{score}</span>
                    <span className="text-[9px] uppercase tracking-wide text-slate-400">Votes</span>
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/qa/${question._id}`}
                        className="text-sm font-bold text-slate-800 hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400 transition-colors"
                      >
                        {question.title}
                      </Link>
                      {question.resolved && (
                        <CheckCircle size={14} className="text-emerald-500" title="Resolved" />
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {question.body}
                    </p>

                    {/* Tags List */}
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {question.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="bg-slate-100 hover:bg-primary-50 dark:bg-darkborder dark:hover:bg-primary-950/20 text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all border border-slate-200/50 dark:border-darkborder/50"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100/50 dark:border-darkborder/30 pt-2">
                      <div className="flex items-center gap-1">
                        <AppAvatar
                          name={authorName}
                          src={question.user?.avatar}
                          size="xs"
                        />
                        <span>
                          Asked by <strong>{authorName}</strong> on{' '}
                          {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Sidebar Tags widgets */}
      <div className="w-full lg:w-72 space-y-6">
        <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
          <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            🔥 Hot Tags
          </h3>
          {getHotTags().length === 0 ? (
            <p className="text-xs text-slate-400">No tags used yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {getHotTags().map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs uppercase font-bold border transition-all ${
                    selectedTag === tag
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-darkborder/40 dark:hover:bg-slate-700 border-slate-200/50 dark:border-darkborder/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </AppCard>
      </div>

      {/* Ask Question Dialog Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ask the Community"
      >
        <form onSubmit={handleAskQuestion} className="space-y-4">
          <AppInput
            label="Question Title"
            placeholder="e.g. How to prevent memory leaks in useEffect?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <AppTextarea
            label="Explain Details"
            placeholder="Provide context, input codes, and expected vs actual behavior..."
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={4}
            required
          />

          <AppInput
            label="Tags (Comma Separated)"
            placeholder="e.g. react, hooks, javascript"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />

          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-darkborder/50 pt-4 mt-4">
            <AppButton
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Post Question
            </AppButton>
          </div>
        </form>
      </AppModal>
    </div>
  );
};

export default QAList;
