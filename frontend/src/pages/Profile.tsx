/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Pencil, Utensils, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { updateProfile as apiUpdateProfile, normalizeUser } from '../api/auth';
import { getRecipes } from '../api/recipes';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { Skeleton } from '../components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../components/ui/empty';

export const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion helper states
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Profile editing states
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMyRecipes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getRecipes();
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

  const startEditing = () => {
    setEditName(user?.name || '');
    setEditBio(user?.bio || '');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditName('');
    setEditBio('');
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await apiUpdateProfile({ name: editName, bio: editBio });
      const updatedUser = res.data.user;
      updateUser(normalizeUser(updatedUser));
      setEditing(false);
    } catch (err: any) {
      console.error("Failed to update profile", err);
      alert(err?.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteRecipe = async () => {
    if (!recipeToDelete || !token) return;
    setDeleting(true);
    try {
      await api.delete(`/api/recipes/${recipeToDelete}`);
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
    <div className="space-y-12 animate-in fade-in duration-300" id="profile-page">
      {/* User Information Card (Horizontal grid) */}
      <div className="border border-border-custom bg-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
        {/* Large Square Avatar (80px) */}
        <div className={`w-20 h-20 text-white font-serif text-3xl font-bold flex items-center justify-center shrink-0 ${getAvatarBgColorInitials(user.name)}`}>
          {getInitials(user.name)}
        </div>

        <div className="space-y-3 flex-grow text-center sm:text-left">
          <div className="space-y-1">
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="font-serif text-2xl font-bold tracking-tight text-text-custom leading-tight w-full bg-[#fcfcfc] border border-border-custom p-2 focus:outline-none focus:border-text-custom focus:bg-white transition-all"
              />
            ) : (
              <h1 className="font-serif text-2xl font-bold tracking-tight text-text-custom leading-tight">
                {user.name}
              </h1>
            )}
            <p className="text-xs font-mono text-text-muted select-all block">
              {user.email}
            </p>
          </div>

          {editing ? (
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              placeholder="Tell us a bit about your favorite spices or preferred cooking techniques..."
              className="text-sm leading-relaxed font-sans max-w-xl w-full bg-[#fcfcfc] border border-border-custom p-2 focus:outline-none focus:border-text-custom focus:bg-white transition-all"
            />
          ) : (
            <p className="text-sm text-text-muted leading-relaxed font-sans max-w-xl">
              {user.bio || "No biography provided. Tell us a bit about your favorite spices or preferred cooking techniques."}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2.5 border-t border-border-custom/40 w-full sm:w-auto">
            <p className="text-[10px] uppercase font-mono tracking-wider text-text-muted select-none">
              Member since: {formatMemberSince(user.createdAt)}
            </p>
            {!editing ? (
              <button
                onClick={startEditing}
                className="ml-auto text-text-muted hover:text-text-custom transition-colors p-1 cursor-pointer"
                title="Edit profile"
              >
                <Pencil size={14} />
              </button>
            ) : (
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="text-green-600 hover:text-green-700 transition-colors p-1 cursor-pointer disabled:opacity-50"
                  title="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer disabled:opacity-50"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
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
          <div className="bg-red-50 border border-danger text-danger p-4 sm:p-6 font-mono text-sm">
            <p className="font-bold uppercase tracking-wider mb-2">Error Loading Recipes</p>
            <p>{error}</p>
            <button onClick={fetchMyRecipes} className="mt-3 text-xs uppercase tracking-wider underline hover:no-underline font-bold">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="border border-border-custom bg-surface" id={`profile-skeleton-${num}`}>
                <Skeleton className="w-full aspect-[16/9] border-b border-border-custom" />
                <div className="p-5 space-y-4">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="border-t border-border-custom pt-4 flex justify-between mt-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/5" />
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
          <Empty className="border border-border-custom bg-surface p-12" id="empty-profile-recipes">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Utensils className="size-8 text-text-muted" />
              </EmptyMedia>
              <EmptyTitle>You haven't published any recipes yet.</EmptyTitle>
              <EmptyDescription>
                Your cookbook collections are looking a little bare. Click below to share your first signature culinary recipe.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to="/create"
                className="btn-primary bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider px-6 py-2.5 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Create my first recipe</span>
                <ArrowRight size={14} />
              </Link>
            </EmptyContent>
          </Empty>
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
