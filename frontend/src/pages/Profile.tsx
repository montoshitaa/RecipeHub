/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';

export const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion helper states
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyRecipes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data: Recipe[] = await apiFetch('/api/recipes');
      // Filter recipes client-side by matching authorId as requested
      const filtered = data.filter((recipe) => recipe.authorId === user._id);
      setMyRecipes(filtered);
    } catch (err: any) {
      console.error("Failed to load user recipes", err);
      setError("Unable to retrieve your uploaded recipes list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRecipes();
  }, [user]);

  // Admin controls handlers for cards
  const handleEditClick = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit/${recipeId}`);
  };

  const handleDeleteClick = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecipeToDelete(recipeId);
  };

  const executeDeleteRecipe = async () => {
    if (!recipeToDelete || !token) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/recipes/${recipeToDelete}`, { method: 'DELETE' });
      setRecipeToDelete(null);
      // Re-fetch recipes
      await fetchMyRecipes();
    } catch (err: any) {
      console.error("Failed to delete recipe:", err);
      alert(err?.message || "An error occurred while deleting the recipe.");
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  // Human-readable date parsing
  const formatMemberSince = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!user) {
    return null; // Protected route handles navigation, fallback safeguard
  }

  return (
    <div className="space-y-12 animate-fade-in" id="profile-page">
      {/* User Information Card (Horizontal grid) */}
      <div className="border border-border-custom bg-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
        {/* Large Square Avatar (80px) */}
        <div className={`w-20 h-20 text-white font-serif text-3xl font-bold flex items-center justify-center shrink-0 ${getAvatarBgColorInitials(user.name)}`}>
          {getInitials(user.name)}
        </div>

        <div className="space-y-3 flex-grow text-center sm:text-left">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-text-custom leading-tight">
              {user.name}
            </h1>
            <p className="text-xs font-mono text-text-muted select-all block">
              {user.email}
            </p>
          </div>

          <p className="text-sm text-text-muted leading-relaxed font-sans max-w-xl">
            {user.bio || "No biography provided. Tell us a bit about your favorite spices or preferred cooking techniques."}
          </p>

          <p className="text-[10px] uppercase font-mono tracking-wider text-text-muted select-none pt-2.5 border-t border-border-custom/40 inline-block w-full sm:w-auto">
            Member since: {formatMemberSince(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Confirmation prompt for grid delete actions */}
      {recipeToDelete && (
        <div className="bg-red-50 border border-danger text-danger p-5 font-mono text-sm leading-relaxed" id="profile-delete-confirm">
          <div className="max-w-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold uppercase tracking-wider mb-1">Delete confirmation requested</p>
              <p>Are you absolutely sure you want to delete this recipe from the catalog? This action is permanent.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                disabled={deleting}
                onClick={executeDeleteRecipe}
                className="btn-primary bg-danger text-white text-xs px-4 py-2 font-mono uppercase tracking-wider cursor-pointer"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setRecipeToDelete(null)}
                className="btn-secondary border border-border-custom bg-white text-xs px-4 py-2 font-mono uppercase tracking-wider cursor-pointer text-text-custom"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Published Recipes section */}
      <div className="space-y-6">
        <div className="border-b border-border-custom pb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-custom tracking-tight">
            My Recipes ({myRecipes.length})
          </h2>
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider select-none">
            Curated cookbook guides
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-danger text-danger p-4 font-mono text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="border border-border-custom bg-surface animate-pulse" id={`profile-skeleton-${num}`}>
                <div className="w-full aspect-[16/9] bg-neutral-200 border-b border-border-custom"></div>
                <div className="p-5 space-y-4">
                  <div className="h-3 w-1/3 bg-neutral-200 font-mono"></div>
                  <div className="h-6 w-4/5 bg-neutral-200"></div>
                  <div className="h-4 w-1/2 bg-neutral-200"></div>
                  <div className="border-t border-border-custom pt-4 flex justify-between mt-2">
                    <div className="h-4 w-1/4 bg-neutral-200"></div>
                    <div className="h-4 w-1/5 bg-neutral-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : myRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {myRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                showAdminControls={true}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="border border-border-custom bg-surface p-12 text-center" id="empty-profile-recipes">
            <h3 className="font-serif text-xl font-bold mb-2">You haven't published any recipes yet.</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto font-sans leading-relaxed">
              Your cookbook collections are looking a little bare. Click below to share your first signature culinary recipe.
            </p>
            <Link
              to="/new"
              className="btn-primary bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-6 py-2.5 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Create my first recipe</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple visual picker
function getAvatarBgColorInitials(name: string) {
  const bgColors = ['bg-[#c0392b]', 'bg-[#2c3e50]', 'bg-[#16a085]', 'bg-[#d35400]', 'bg-[#27ae60]', 'bg-[#8e44ad]'];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return bgColors[sum % bgColors.length];
}
