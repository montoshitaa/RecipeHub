/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getRecipe, updateRecipe, deleteRecipe } from '../api/recipes';
import { RecipeForm } from '../components/RecipeForm';
import { Recipe } from '../types';

export const EditRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecipe(id)
      .then((data) => {
        if (user && data.authorId !== user._id) {
          navigate('/unauthorized');
          return;
        }
        setRecipe(data);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load recipe'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleFormSubmit = async (formData: Omit<Recipe, '_id' | 'authorId' | 'createdAt'>) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateRecipe(id, formData);
      toast.success('Recipe updated!');
      navigate('/recipes/' + id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update recipe');
      throw err; // bubble to RecipeForm for top error banner
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteRecipe(id);
      toast.success('Recipe deleted');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete recipe');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse" id="edit-recipe-loader">
        <div className="border border-border-custom bg-surface p-6 sm:p-8 space-y-4">
          <div className="h-10 bg-neutral-200 w-1/3"></div>
          <div className="h-4 bg-neutral-200 w-2/3"></div>
        </div>
        <div className="border border-border-custom bg-surface p-8 sm:p-10 space-y-8">
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 w-32"></div>
            <div className="h-12 bg-neutral-200 w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 w-32"></div>
            <div className="h-24 bg-neutral-200 w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 w-32"></div>
              <div className="h-12 bg-neutral-200 w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 w-32"></div>
              <div className="h-12 bg-neutral-200 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="border border-border-custom bg-surface p-8 max-w-xl mx-auto my-12 text-center" id="edit-recipe-error">
        <p className="font-serif text-2xl font-bold text-text-cancel mb-2 text-text-custom">Retrieval Failed</p>
        <p className="text-sm text-text-muted mb-6">{error || "This recipe details could not be retrieved."}</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary bg-text-custom text-white font-mono text-xs uppercase tracking-wider px-6 py-2.5 cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Return to feed
        </button>
      </div>
    );
  }

  const isRecipeOwner = user && recipe && recipe.authorId === user._id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id={`edit-recipe-page-${recipe._id}`}>
      <div className="border border-border-custom bg-surface p-6 sm:p-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-text-custom mb-1">
          Edit Recipe Details
        </h1>
        <p className="text-sm text-text-muted">
          Modify instruction steps, ingredient counts, or descriptions. Rest assured that author credentials and creation history will be preserved.
        </p>
      </div>

      <RecipeForm
        initialData={recipe}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {isRecipeOwner && (
        <div className="border border-border-custom bg-surface p-4 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-serif text-lg font-bold text-danger">Danger Zone</p>
              <p className="text-xs text-text-muted font-mono">Permanently delete this recipe and all associated data.</p>
            </div>
            {!showDeleteConfirm ? (
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                className="btn-primary border border-danger bg-white text-danger hover:bg-danger hover:text-white px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors">
                Delete Recipe
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-danger font-bold">Are you sure?</span>
                <button type="button" disabled={isDeleting} onClick={handleDelete}
                  className="bg-danger text-white px-4 py-2 text-xs uppercase font-mono font-bold cursor-pointer disabled:opacity-50">
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(false)}
                  className="border border-border-custom px-4 py-2 text-xs uppercase font-mono cursor-pointer">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};