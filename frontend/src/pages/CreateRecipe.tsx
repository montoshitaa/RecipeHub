/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeForm } from '../components/RecipeForm';
import { apiFetch } from '../api/client';
import { Recipe } from '../types';

export const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (formData: Omit<Recipe, '_id' | 'authorId' | 'createdAt'>) => {
    setIsSubmitting(true);
    try {
      const response = await apiFetch('/api/recipes', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // Redirect to the newly created recipe detail page
      if (response && response._id) {
        navigate(`/recipes/${response._id}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Failed to create recipe:', err);
      throw err; // bubble error up to the Form so it renders on top
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
