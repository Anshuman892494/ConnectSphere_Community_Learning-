import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronUp, ChevronDown, Check, Trash2, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AppButton from '../components/common/AppButton';
import AppTextarea from '../components/common/AppTextarea';
import AppCard from '../components/layout/AppCard';
import AppAvatar from '../components/common/AppAvatar';
import AppBadge from '../components/common/AppBadge';
import AppLoader from '../components/common/AppLoader';
import ErrorState from '../components/common/ErrorState';

const QADetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Answer Form State
  const [answerBody, setAnswerBody] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const fetchQuestionDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await API.get(`/qa/questions/${id}`);
      setQuestion(response.data.question);
      setAnswers(response.data.answers);
    } catch (err) {
      setErrorMsg('Failed to load question details. It might have been moderated or deleted.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionDetails();
  }, [id]);

  const handleQuestionVote = async (voteType) => {
    try {
      const response = await API.post(`/qa/questions/${id}/vote`, { voteType });
      setQuestion((prev) => ({
        ...prev,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
      }));
      addToast(`Question ${voteType} updated`, 'info');
    } catch (err) {
      addToast('Failed to log vote.', 'error');
    }
  };

  const handleAnswerVote = async (answerId, voteType) => {
    try {
      const response = await API.post(`/qa/answers/${answerId}/vote`, { voteType });
      setAnswers((prev) =>
        prev.map((ans) =>
          ans._id === answerId
            ? { ...ans, upvotes: response.data.upvotes, downvotes: response.data.downvotes }
            : ans
        )
      );
      addToast(`Answer ${voteType} updated`, 'info');
    } catch (err) {
      addToast('Failed to log vote.', 'error');
    }
  };

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) {
      addToast('Please write some content to answer', 'warning');
      return;
    }

    setIsSubmittingAnswer(true);
    try {
      const response = await API.post(`/qa/questions/${id}/answers`, { body: answerBody });
      setAnswers((prev) => [...prev, response.data]);
      setAnswerBody('');
      addToast('Answer posted successfully! +5 Points Awarded', 'success');
      fetchQuestionDetails(); // Reload to update resolution state and order
    } catch (err) {
      addToast('Failed to publish answer', 'error');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const response = await API.post(`/qa/answers/${answerId}/accept`);
      addToast(response.data.message, 'success');
      fetchQuestionDetails(); // Reload lists
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to accept answer', 'error');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await API.delete(`/admin/questions/${id}`);
      addToast('Question removed successfully', 'success');
      navigate('/qa');
    } catch (err) {
      addToast('Failed to delete question', 'error');
    }
  };

  if (isLoading) return <AppLoader type="spinner" />;
  if (errorMsg) return <ErrorState title="Question not found" message={errorMsg} onRetry={fetchQuestionDetails} />;
  if (!question) return null;

  const questionScore = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  const isQuestionUpvoted = question.upvotes?.includes(user?._id);
  const isQuestionDownvoted = question.downvotes?.includes(user?._id);
  const questionOwnerName = question.user?.username || 'Member';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/qa"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to board
        </Link>

        {user?.role === 'admin' && (
          <AppButton
            onClick={handleDeleteQuestion}
            variant="danger"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Moderator Remove
          </AppButton>
        )}
      </div>

      {/* Main Question Card Layout */}
      <AppCard className="p-6 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
        <div className="flex gap-4">
          {/* Vote Controls Column */}
          <div className="flex flex-col items-center gap-1 w-10">
            <button
              onClick={() => handleQuestionVote('upvote')}
              className={`p-1.5 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
                isQuestionUpvoted
                  ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/20'
                  : 'border-slate-200 dark:border-darkborder text-slate-400'
              }`}
            >
              <ChevronUp size={20} />
            </button>
            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              {questionScore}
            </span>
            <button
              onClick={() => handleQuestionVote('downvote')}
              className={`p-1.5 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
                isQuestionDownvoted
                  ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-darkborder text-slate-400'
              }`}
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Question Details Column */}
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {question.title}
              {question.resolved && (
                <AppBadge variant="success" className="px-2 py-0.5">
                  Resolved ✔
                </AppBadge>
              )}
            </h2>

            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {question.body}
            </p>

            {/* Question tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex gap-1.5">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 dark:bg-darkborder text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-slate-200/50 dark:border-darkborder/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author details */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-darkborder/40 pt-3 text-xs text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <AppAvatar
                  name={questionOwnerName}
                  src={question.user?.avatar}
                  size="sm"
                  isPremium={question.user?.subscription?.status === 'premium'}
                />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{questionOwnerName}</p>
                  <p className="text-[10px] text-slate-400">
                    Reputation: {question.user?.reputation} REP
                  </p>
                </div>
              </div>
              <div>
                <span>Asked: {new Date(question.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      {/* Answers Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Answers ({answers.length})
        </h3>

        <div className="space-y-4">
          {answers.map((answer) => {
            const isAnswerUpvoted = answer.upvotes?.includes(user?._id);
            const isAnswerDownvoted = answer.downvotes?.includes(user?._id);
            const score = (answer.upvotes?.length || 0) - (answer.downvotes?.length || 0);
            const answerOwnerName = answer.user?.username || 'Member';
            const isQuestionOwner = question.user?._id === user?._id;

            return (
              <AppCard
                key={answer._id}
                className={`p-5 border bg-white dark:bg-darkcard ${
                  answer.accepted
                    ? 'border-emerald-500 dark:border-emerald-500/80 shadow-emerald-500/5'
                    : 'border-slate-100 dark:border-darkborder'
                }`}
              >
                <div className="flex gap-4">
                  {/* Upvotes/Downvotes controls */}
                  <div className="flex flex-col items-center gap-1 w-10">
                    <button
                      onClick={() => handleAnswerVote(answer._id, 'upvote')}
                      className={`p-1 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
                        isAnswerUpvoted
                          ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950/20'
                          : 'border-slate-200 dark:border-darkborder text-slate-400'
                      }`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {score}
                    </span>
                    <button
                      onClick={() => handleAnswerVote(answer._id, 'downvote')}
                      className={`p-1 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
                        isAnswerDownvoted
                          ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-darkborder text-slate-400'
                      }`}
                    >
                      <ChevronDown size={16} />
                    </button>

                    {/* Checkmark acceptance status */}
                    {answer.accepted && (
                      <div className="mt-3 bg-emerald-500 text-white rounded-full p-1 shadow" title="Accepted Answer">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Answer details */}
                  <div className="flex-1 space-y-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {answer.body}
                    </p>

                    {/* Acceptance trigger (only for question owner, if not already accepted) */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-darkborder/40 pt-3 text-xs text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-2">
                        <AppAvatar
                          name={answerOwnerName}
                          src={answer.user?.avatar}
                          size="sm"
                          isPremium={answer.user?.subscription?.status === 'premium'}
                        />
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{answerOwnerName}</p>
                          <p className="text-[10px] text-slate-400">
                            Reputation: {answer.user?.reputation} REP
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>Answered: {new Date(answer.createdAt).toLocaleDateString()}</span>
                        
                        {isQuestionOwner && !answer.accepted && (
                          <AppButton
                            onClick={() => handleAcceptAnswer(answer._id)}
                            variant="success"
                            size="sm"
                            className="flex items-center gap-1 py-1 px-2.5 rounded-xl text-xs"
                          >
                            <Check size={12} />
                            Accept
                          </AppButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AppCard>
            );
          })}
        </div>
      </div>

      {/* Answer Form */}
      <AppCard className="p-5 border border-slate-100 dark:border-darkborder bg-white dark:bg-darkcard">
        <form onSubmit={handleAddAnswer} className="space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Submit Your Answer</h3>
          <AppTextarea
            placeholder="Write your answer details. Share code examples, logic steps, and references..."
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
            rows={4}
            required
          />
          <div className="flex justify-end pt-2">
            <AppButton
              type="submit"
              variant="primary"
              isLoading={isSubmittingAnswer}
            >
              Post Answer
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  );
};

export default QADetails;
