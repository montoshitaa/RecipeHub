/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Utensils, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getRecipe, getComments, postComment, deleteComment, deleteRecipe } from '../api/recipes';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Recipe, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion logic confirmations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(false);

  // Comment sub-states
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Ingredient checklist (UX-07) — local state only, resets on page leave
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  // Seed avatar fallback gradient
  const getAvatarBgColor = (name: string) => {
    const bgColors = ['bg-[#c0392b]', 'bg-[#2c3e50]', 'bg-[#16a085]', 'bg-[#d35400]', 'bg-[#27ae60]', 'bg-[#8e44ad]'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return bgColors[sum % bgColors.length];
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  const fetchData = async () => {
    if (!id) return;
    try {
      const recipeData = await getRecipe(id);
      setRecipe(recipeData);

      const commentsData = await getComments(id);
      setComments(commentsData || []);
    } catch (err: any) {
      console.error("Failed to load recipe details", err);
      setError(err?.message || "Recipe not found. It may have been deleted or the API is offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [id]);

  // Handler for adding comments
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token) return;
    if (!newCommentText.trim()) {
      setCommentError('Comment body text cannot be empty.');
      return;
    }

    setSubmittingComment(true);
    setCommentError(null);

    try {
      await postComment(id, {
        content: newCommentText.trim(),
        rating: newCommentRating,
      });

      // Reset box
      setNewCommentText('');
      setNewCommentRating(5);
      toast.success('Comment posted');

      // Refetch comments to maintain accurate state
      const freshComments = await getComments(id);
      setComments(freshComments || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to post comment');
      setCommentError(err?.response?.data?.message || 'Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handler for deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;
    const confirmed = window.confirm("Are you sure you want to delete your review?");
    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      toast.success('Comment deleted');
      // Refetch
      if (id) {
        const freshComments = await getComments(id);
        setComments(freshComments || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete comment');
    }
  };

  // Handler for deleting recipe
  const handleDeleteRecipe = async () => {
    if (!id || !recipe || !token) return;
    setDeletingRecipe(true);
    try {
      await deleteRecipe(id);
      toast.success('Recipe deleted');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete recipe');
      setDeletingRecipe(false);
      setShowDeleteConfirm(false);
    }
  };

  // Computations
  const computedAverageRating = comments.length > 0
    ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse" id="detail-loader">
        {/* Top Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-border-custom bg-surface p-4 sm:p-6 pb-4 gap-4">
          <div className="h-4 bg-neutral-200 w-32"></div>
        </div>

        {/* Main Two-Column split skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Left column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-border-custom bg-neutral-200 aspect-[16/9] w-full max-h-[360px]"></div>
            <div className="space-y-4">
              <div className="h-10 bg-neutral-200 w-3/4"></div>
              <div className="h-16 bg-neutral-200 w-full mb-6"></div>
              <div className="border border-border-custom bg-surface p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1"><div className="h-3 bg-neutral-200 w-12"></div><div className="h-4 bg-neutral-200 w-20"></div></div>
                <div className="space-y-1"><div className="h-3 bg-neutral-200 w-12"></div><div className="h-4 bg-neutral-200 w-20"></div></div>
                <div className="space-y-1"><div className="h-3 bg-neutral-200 w-12"></div><div className="h-4 bg-neutral-200 w-20"></div></div>
                <div className="space-y-1"><div className="h-3 bg-neutral-200 w-12"></div><div className="h-4 bg-neutral-200 w-20"></div></div>
              </div>
            </div>
          </div>
          {/* Right column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-border-custom bg-surface p-5 flex items-start gap-4 h-32">
              <div className="w-14 h-14 bg-neutral-200 shrink-0"></div>
              <div className="space-y-3 flex-grow">
                <div className="h-3 bg-neutral-200 w-1/3"></div>
                <div className="h-6 bg-neutral-200 w-3/4"></div>
                <div className="h-3 bg-neutral-200 w-full"></div>
              </div>
            </div>
            <div className="border border-border-custom bg-surface p-5 space-y-4 h-64">
              <div className="h-6 bg-neutral-200 w-1/2 border-b border-border-custom pb-2"></div>
              <div className="space-y-3 mt-4">
                <div className="h-4 bg-neutral-200 w-full"></div>
                <div className="h-4 bg-neutral-200 w-full"></div>
                <div className="h-4 bg-neutral-200 w-4/5"></div>
                <div className="h-4 bg-neutral-200 w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="border border-border-custom bg-surface p-8 max-w-xl mx-auto my-12 text-center" id="detail-error">
        <p className="font-serif text-2xl font-bold text-text-custom mb-3">Unable to Load Recipe</p>
        <p className="text-sm text-text-muted mb-6">{error || "The recipe details could not be loaded."}</p>
        <Link
          to="/"
          className="btn-primary bg-text-custom hover:opacity-90 inline-flex items-center gap-2 text-white font-mono text-xs uppercase tracking-wider px-6 py-2.5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Return to feed
        </Link>
      </div>
    );
  }

  // Determine owner privileges
  const isRecipeOwner = user && recipe.authorId === user._id;

  return (
    <div className="space-y-12 animate-in fade-in duration-300" id={`recipe-detail-page-${recipe._id}`}>
      {/* Top Header Row with Back button and Admin tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-border-custom py-4 gap-4 bg-surface px-4 sm:px-6">
        <Link
          to="/"
          className="text-text-custom hover:text-accent font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors font-bold group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Catalog
        </Link>

        {isRecipeOwner && (
          <div className="flex items-center gap-3">
            {!showDeleteConfirm ? (
              <>
                <Link
                  to={`/edit/${recipe._id}`}
                  className="btn-secondary border border-border-custom font-mono text-xs px-4 py-2 hover:bg-text-custom hover:text-white transition-colors cursor-pointer text-center uppercase tracking-wider font-bold"
                >
                  Edit recipe
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-primary border border-danger bg-white text-danger hover:bg-danger hover:text-white font-mono text-xs px-4 py-2 transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  Delete
                </button>
              </>
            ) : (
              <div className="p-2 border border-danger/30 bg-red-50 flex items-center gap-3 flex-wrap">
                <span className="text-xs font-mono text-danger font-bold uppercase tracking-wider">
                  Confirm Deletion?
                </span>
                <button
                  type="button"
                  disabled={deletingRecipe}
                  onClick={handleDeleteRecipe}
                  className="btn-primary bg-danger text-white text-xs px-3 py-1.5 uppercase font-mono font-bold cursor-pointer disabled:opacity-50 hover:bg-red-700 transition-colors"
                >
                  {deletingRecipe ? "Deleting..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary border border-border-custom text-xs px-3 py-1.5 uppercase font-mono cursor-pointer hover:bg-white transition-colors bg-[#fcfcfc]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Two-Column split details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left column (60%) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main cover banner image */}
          <div className="border border-border-custom bg-[#f0ede6] overflow-hidden aspect-[16/9] w-full max-h-[360px] relative">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#c0392b] text-white flex items-center justify-center font-serif text-8xl font-bold tracking-tight">
                {getInitials(recipe.title)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Title / Description info block */}
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-custom tracking-tight leading-none mb-4">
              {recipe.title}
            </h1>
            
            <p className="text-lg text-text-muted leading-relaxed font-serif border-l-2 border-accent pl-4 py-1 italic mb-6">
              {recipe.description}
            </p>

            {/* Flat Meta row */}
            <div className="border border-border-custom bg-surface p-5 flex flex-wrap gap-x-8 gap-y-4 justify-between items-center text-xs font-mono tracking-widest text-text-muted uppercase">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] opacity-70">Category</span>
                <span className="font-bold text-text-custom text-[13px]">{recipe.category}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] opacity-70">Difficulty</span>
                <span className="font-bold text-text-custom text-[13px]">{recipe.difficulty}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] opacity-70">Time</span>
                <div className="flex items-center gap-1.5 font-bold text-text-custom text-[13px]">
                  <Clock size={14} />
                  <span>{recipe.time} min</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] opacity-70">Yield</span>
                <div className="flex items-center gap-1.5 font-bold text-text-custom text-[13px]">
                  <Utensils size={14} />
                  <span>{recipe.servings} Servings</span>
                </div>
              </div>
            </div>

            {/* Flat chips for tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs pt-2">
                {recipe.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[11px] uppercase border border-border-custom bg-neutral-100 px-3 py-1 font-bold text-text-custom shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column (40%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Author info card */}
          <div className="border border-border-custom bg-surface p-5 flex items-start gap-4" id="recipe-author-box">
            <div className={`w-14 h-14 shrink-0 flex items-center justify-center text-white text-lg font-bold font-serif ${getAvatarBgColor(recipe.authorName || 'Cook')}`}>
              {getInitials(recipe.authorName || 'Cook')}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted leading-none">
                Published & curated by
              </p>
              <h4 className="font-serif text-lg font-bold text-text-custom leading-tight">
                {recipe.authorName || 'RecipeHub Chef'}
              </h4>
              <p className="text-xs text-text-muted leading-tight font-sans">
                {recipe.description ? 'Gourmet cooking expert eager to share classic kitchen tricks.' : 'Culinary creative on RecipeHub.'}
              </p>
              <p className="text-[10px] font-mono text-text-muted mt-2 pt-1.5 border-t border-border-custom/50 w-full select-none">
                Active catalog since: {new Date(recipe.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Ingredients table card as requested */}
          <div className="border border-border-custom bg-surface p-5 space-y-4">
            <h3 className="font-serif text-lg font-bold border-b border-border-custom pb-2 text-text-custom tracking-tight">
              Ingredients ratio list
            </h3>

            <table className="w-full border-collapse text-left text-sm font-mono leading-relaxed select-text">
              <thead>
                <tr className="border-b border-border-custom text-[11px] text-text-muted uppercase">
                  <th className="py-2 w-10"></th>
                  <th className="py-2 font-bold">Ingredient description</th>
                  <th className="py-2 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients && recipe.ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients.has(idx);
                  return (
                    <tr key={idx} className="border-b border-border-custom/40 last:border-0 hover:bg-neutral-50">
                      <td className="py-2.5 align-middle">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => {
                            const next = new Set(checkedIngredients);
                            if (isChecked) {
                              next.delete(idx);
                            } else {
                              next.add(idx);
                            }
                            setCheckedIngredients(next);
                          }}
                        />
                      </td>
                      <td className={`py-2.5 font-sans font-medium text-text-custom${isChecked ? ' line-through decoration-border-custom/50 text-text-muted/60' : ''}`}>{ing.name}</td>
                      <td className={`py-2.5 text-right text-text-muted font-mono whitespace-nowrap${isChecked ? ' line-through decoration-border-custom/50 text-text-muted/60' : ''}`}>
                        {ing.amount} <span className="text-xs">{ing.unit}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Preparation steps details */}
      <div className="border border-border-custom bg-surface p-6 sm:p-10 space-y-8">
        <h3 className="font-serif text-3xl font-bold border-b border-border-custom pb-4 text-text-custom tracking-tight">
          Preparation Steps
        </h3>

        <div className="space-y-8">
          {recipe.steps && recipe.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex gap-4 sm:gap-6 items-start border-l-2 border-border-custom hover:border-text-custom pl-4 sm:pl-6 py-1 transition-all group"
            >
              <span className="font-mono text-lg sm:text-xl font-bold text-text-custom select-none shrink-0 w-8 flex justify-center pt-0.5">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <p className="text-[17px] text-text-custom leading-relaxed font-sans pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4 bg-border-custom/50" />

      {/* Reviews & reviews feedback section */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8" id="comments-section-split">
        {/* Left comments side - lists existing reviews */}
        <div className="lg:col-span-6 border border-border-custom bg-surface p-6 sm:p-8 space-y-6">
          <div className="border-b border-border-custom pb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-text-custom">
              Reviews & Feedback ({comments.length})
            </h3>
            {computedAverageRating && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono">AVG:</span>
                <span className="text-accent font-bold font-mono text-sm">{computedAverageRating} ★</span>
              </div>
            )}
          </div>

          {comments.length === 0 ? (
            <div className="py-12 text-center text-text-muted italic text-sm font-sans">
              No feedback comments left yet. Be the first to make and review this cooking masterpiece!
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-border-custom/50">
              {comments.map((comment, index) => {
                const isCommentOwner = user && comment.userId === user._id;

                return (
                  <div
                    key={comment._id}
                    className={`block ${index > 0 ? 'pt-6' : ''}`}
                    id={`recipe-comment-${comment._id}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center text-white font-serif text-xs font-bold leading-none ${getAvatarBgColor(comment.userName)}`}>
                          {getInitials(comment.userName)}
                        </div>
                        <div>
                          <span className="font-sans font-bold text-sm text-text-custom mr-2">
                            {comment.userName}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted uppercase">
                            · {new Date(comment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <StarRating rating={comment.rating} size="sm" />
                        {isCommentOwner && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-xs font-mono uppercase text-danger hover:underline font-bold cursor-pointer pr-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-text-custom text-sm leading-relaxed font-sans pl-11">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right review input box context */}
        <div className="lg:col-span-4 border border-border-custom bg-surface p-5 space-y-4 height-fit">
          <h3 className="font-serif text-lg font-bold border-b border-border-custom pb-2 text-text-custom">
            Add your review
          </h3>

          {token ? (
            <form onSubmit={handlePostComment} className="space-y-4">
              {commentError && (
                <div className="text-xs text-danger font-mono bg-red-50 border border-danger/30 p-2.5">
                  {commentError}
                </div>
              )}

              {/* Text Area */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5 font-bold">
                  Write your comment...
                </label>
                <Textarea
                  rows={4}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share details of your experience making this recipe. Taste? Instructions quality?"
                  className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white text-sm"
                />
              </div>

              {/* Interactive Star selects */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5 font-bold">
                  Rating (1-5 Stars) *
                </label>
                <div className="border border-border-custom bg-[#fcfcfc] p-2.5 flex items-center justify-between">
                  <StarRating
                    rating={newCommentRating}
                    interactive={true}
                    onChange={(val) => setNewCommentRating(val)}
                    size="lg"
                  />
                  <span className="font-mono text-xs font-black text-accent bg-neutral-100 px-2 py-0.5">
                    {newCommentRating} / 5
                  </span>
                </div>
              </div>

              {/* Post Button */}
              <button
                type="submit"
                disabled={submittingComment}
                className="btn-primary w-full border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white py-3.5 font-mono text-xs uppercase font-bold tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1"
              >
                {submittingComment ? (
                  "Submitting feedback..."
                ) : (
                  <>
                    <span>Post Comment</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3" id="unsigned-comment-cta">
              <p className="text-xs text-text-muted font-sans leading-relaxed">
                You must possess an active account to share feedback and post star reviews.
              </p>
              <Link
                to="/login"
                className="btn-primary w-full inline-block bg-accent hover:bg-accent-hover text-white py-2.5 font-mono text-xs uppercase font-bold tracking-wider text-center transition-colors shadow-none"
              >
                Sign in to leave a comment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
