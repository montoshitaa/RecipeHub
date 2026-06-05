/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Recipe, Ingredient } from '../types';

interface RecipeFormProps {
  initialData: Recipe | null;
  onSubmit: (formData: Omit<Recipe, '_id' | 'authorId' | 'createdAt'>) => Promise<void>;
  isSubmitting: boolean;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const navigate = useNavigate();

  // Basic Details State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [time, setTime] = useState<number | ''>('');
  const [servings, setServings] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Dynamic Lists State
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: 1, unit: 'units' }]);
  const [steps, setSteps] = useState<string[]>(['']);

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  // Pre-fill form if editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Breakfast');
      setDifficulty(initialData.difficulty || 'Easy');
      setTime(initialData.time || '');
      setServings(initialData.servings || '');
      setImageUrl(initialData.imageUrl || '');
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
      
      if (initialData.ingredients && initialData.ingredients.length > 0) {
        setIngredients(initialData.ingredients);
      }
      if (initialData.steps && initialData.steps.length > 0) {
        setSteps(initialData.steps);
      }
    }
  }, [initialData]);

  // Ingredients handlers
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 1, unit: 'units' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return; // Keep min 1 row
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = {
      ...updated[index],
      [field]: field === 'amount' ? (value === '' ? '' : Number(value)) : value,
    };
    setIngredients(updated);
  };

  // Steps handlers
  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return; // Keep min 1 row
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  // Compute live tag chips preview
  const activeTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  // Validate fields on submit
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!category) newErrors.category = 'Category is required.';
    if (!difficulty) newErrors.difficulty = 'Difficulty is required.';

    if (time === '' || isNaN(Number(time)) || Number(time) <= 0) {
      newErrors.time = 'Time must be a positive integer.';
    }
    if (servings === '' || isNaN(Number(servings)) || Number(servings) <= 0) {
      newErrors.servings = 'Servings must be a positive integer.';
    }

    // Ingredients check
    const validIngredients = ingredients.filter((ing) => ing.name.trim() && Number(ing.amount) > 0);
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least 1 ingredient with a name and positive amount is required.';
    }

    // Steps check
    const validSteps = steps.filter((st) => st.trim());
    if (validSteps.length === 0) {
      newErrors.steps = 'At least 1 detailed cooking step is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopError(null);

    if (!validateForm()) {
      setTopError('Please fix the errors in the form before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clean inputs
    const packedIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    const packedSteps = steps.filter((st) => st.trim() !== '');

    const finalFormData = {
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      time: Number(time),
      servings: Number(servings),
      imageUrl: imageUrl.trim() || null,
      tags: activeTags,
      ingredients: packedIngredients,
      steps: packedSteps,
    };

    try {
      await onSubmit(finalFormData);
    } catch (err: any) {
      setTopError(err?.message || 'An error occurred while publishing the recipe. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {topError && (
        <div className="bg-red-50 border border-danger text-danger p-4 font-mono text-sm leading-relaxed mb-6">
          <p className="font-bold uppercase tracking-wider mb-1">Error Submitting Form</p>
          <p>{topError}</p>
        </div>
      )}

      {/* Section 1 - Basic Info */}
      <div className="border border-border-custom bg-surface p-6 sm:p-8">
        <h2 className="font-serif text-xl font-bold border-b border-border-custom pb-3 mb-6 text-text-custom">
          Section 1 — Basic Information
        </h2>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
              Recipe Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grandma's Apple Crisp"
              className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
            {errors.title && <p className="text-xs text-danger font-mono mt-1.5">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
              Short Description *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief background about this recipe, its origin, or why you love it..."
              className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
            />
            {errors.description && <p className="text-xs text-danger font-mono mt-1.5">{errors.description}</p>}
          </div>

          {/* Category Dropdown & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
                Category *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-[50px] bg-[#fcfcfc] border border-border-custom px-4 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Snack">Snack</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-[50%] -translate-y-[50%] pointer-events-none text-text-muted">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
                </div>
              </div>
              {errors.category && <p className="text-xs text-danger font-mono mt-1.5">{errors.category}</p>}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
                Difficulty *
              </label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full h-[50px] bg-[#fcfcfc] border border-border-custom px-4 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <div className="absolute right-4 top-[50%] -translate-y-[50%] pointer-events-none text-text-muted">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></svg>
                </div>
              </div>
              {errors.difficulty && <p className="text-xs text-danger font-mono mt-1.5">{errors.difficulty}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                Cooking Time (minutes) *
              </label>
              <input
                type="number"
                min="1"
                value={time}
                onChange={(e) => setTime(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Duration in minutes"
                className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
              />
              {errors.time && <p className="text-xs text-danger font-mono mt-1.5">{errors.time}</p>}
            </div>

            {/* Servings */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                Servings count *
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Portion servings"
                className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
              />
              {errors.servings && <p className="text-xs text-danger font-mono mt-1.5">{errors.servings}</p>}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
              Header Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm mb-3"
            />
            {imageUrl && (
              <div className="border border-border-custom p-2 bg-[#fcfcfc]">
                <p className="text-[11px] font-mono text-text-muted mb-1.5">LIVE URL PREVIEW:</p>
                <img
                  src={imageUrl}
                  alt="Live custom preview"
                  referrerPolicy="no-referrer"
                  className="max-h-44 object-cover w-full opacity-90"
                  onError={(e) => {
                    // Suppress broken preview warnings gently
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
              Tags (comma-separated list)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., baking, dessert, chocolate, sweet"
              className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm mb-2"
            />
            {activeTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeTags.map((t, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[11px] px-2 py-0.5 border border-border-custom bg-surface text-text-custom"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 - Ingredients Table */}
      <div className="border border-border-custom bg-surface p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-3 mb-6">
          <h2 className="font-serif text-xl font-bold text-text-custom">
            Section 2 — Ingredients
          </h2>
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider mt-1 sm:mt-0">
            Define ingredient items & ratios
          </span>
        </div>

        {errors.ingredients && (
          <div className="text-xs text-danger font-mono bg-red-50 border border-danger/30 p-2.5 mb-4">
            {errors.ingredients}
          </div>
        )}

        {/* Mobile Grid/Card list (Only shown on small viewports) */}
        <div className="flex flex-col gap-4 mb-6 sm:hidden">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="border border-border-custom bg-[#fcfcfc] p-4 space-y-4 relative">
              <button
                type="button"
                onClick={() => handleRemoveIngredient(idx)}
                disabled={ingredients.length <= 1}
                className={`absolute top-2 right-2 text-danger p-2 font-mono text-xs font-bold leading-none ${
                  ingredients.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-red-50'
                }`}
                title="Remove Row"
              >
                ✕
              </button>
              
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-text-muted mb-1.5 font-bold">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  placeholder="e.g. Flour or Sugar"
                  className="w-full bg-white border border-border-custom p-2.5 text-sm font-sans focus:outline-none focus:border-text-custom focus:bg-[#fcfcfc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-text-muted mb-1.5 font-bold">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                    className="w-full bg-white border border-border-custom p-2.5 text-sm font-mono focus:outline-none focus:border-text-custom focus:bg-[#fcfcfc]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-text-muted mb-1.5 font-bold">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                    placeholder="cups, g, units"
                    className="w-full bg-white border border-border-custom p-2.5 text-sm font-sans focus:outline-none focus:border-text-custom focus:bg-[#fcfcfc]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View Table (Hidden on small viewports) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse border-y border-border-custom font-mono text-sm leading-none text-left mb-6">
            <thead>
              <tr className="bg-[#fcfcfc] border-b border-border-custom text-text-muted text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Ingredient Name *</th>
                <th className="py-3 px-4 w-32 font-bold">Amount *</th>
                <th className="py-3 px-4 w-40 font-bold">Unit *</th>
                <th className="py-3 px-4 w-12 text-center font-bold">✕</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, idx) => (
                <tr key={idx} className="border-b border-border-custom hover:bg-[#fafaf8]">
                  {/* Name field */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                      placeholder="Flour or Sugar"
                      className="w-full bg-transparent border-b border-transparent hover:border-border-custom focus:border-text-custom py-1.5 px-1 focus:outline-none focus:bg-white text-sm font-sans"
                    />
                  </td>
                  {/* Amount field */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={ing.amount}
                      onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-border-custom focus:border-text-custom py-1.5 px-1 focus:outline-none focus:bg-white text-sm"
                    />
                  </td>
                  {/* Unit field */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                      placeholder="e.g. cups, g, units"
                      className="w-full bg-transparent border-b border-transparent hover:border-border-custom focus:border-text-custom py-1.5 px-1 focus:outline-none focus:bg-white text-sm font-sans"
                    />
                  </td>
                  {/* Remove row */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      disabled={ingredients.length <= 1}
                      className={`text-danger p-1 font-bold ${
                        ingredients.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-red-50'
                      }`}
                      title="Remove Row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={handleAddIngredient}
          className="btn-secondary border border-border-custom text-text-custom hover:border-text-custom px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
        >
          + Add Ingredient
        </button>
      </div>

      {/* Section 3 - Preparation Steps */}
      <div className="border border-border-custom bg-surface p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-3 mb-6">
          <h2 className="font-serif text-xl font-bold text-text-custom">
            Section 3 — Preparation Steps
          </h2>
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider mt-1 sm:mt-0">
            Ordered list of instructions
          </span>
        </div>

        {errors.steps && (
          <div className="text-xs text-danger font-mono bg-red-50 border border-danger/30 p-2.5 mb-4">
            {errors.steps}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {steps.map((st, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <span className="font-mono text-sm font-bold text-accent py-3 select-none w-6 text-right">
                {idx + 1}.
              </span>
              <div className="flex-grow">
                <textarea
                  rows={2}
                  value={st}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder={`Instruction details for Step ${idx + 1}...`}
                  className="w-full bg-[#fcfcfc] border border-border-custom p-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveStep(idx)}
                disabled={steps.length <= 1}
                className={`text-danger p-2 font-bold mt-2 ${
                  steps.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-red-50'
                }`}
                title="Remove Step"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="btn-secondary border border-border-custom text-text-custom hover:border-text-custom px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
        >
          + Add Step
        </button>
      </div>

      {/* Buttons Footer */}
      <div className="border border-border-custom bg-surface p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary w-full sm:w-auto border border-border-custom text-text-custom hover:bg-neutral-100 px-8 py-3.5 font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full sm:w-auto border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white px-8 py-3.5 font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1"
        >
          {isSubmitting ? (
            'Saving recipe...'
          ) : initialData ? (
            <>
              <span>Save changes</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <span>Publish recipe</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
