/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RecipeForm } from '../components/RecipeForm';
import { createRecipe } from '../api/recipes';
import { Recipe } from '../types';

export const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData: Omit<Recipe, '_id' | 'authorId' | 'createdAt'>) => {
    setIsSubmitting(true);
    try {
      const response = await createRecipe(formData);
      toast.success('Recipe published!');
      navigate('/recipes/' + response._id);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to create recipe';
      toast.error(message);
      throw err; // bubble error up to the Form so it renders top error banner
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="create-recipe-page">
      <div className="border border-border-custom bg-surface p-6 sm:p-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-text-custom mb-1">
          Publish a New Recipe
        </h1>
        <p className="text-sm text-text-muted">
          Fill out all information details across sections to store your dynamic recipes securely in our mutual catalog.
        </p>
      </div>

      <RecipeForm
        initialData={null}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
