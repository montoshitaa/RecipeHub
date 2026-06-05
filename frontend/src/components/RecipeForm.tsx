/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, X } from 'lucide-react';
  import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import { Recipe, Ingredient } from '../types';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

// ── Zod Schema ───────────────────────────────────────────────

const recipeFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  time: z.coerce.number().int().positive('Cook time must be a positive number'),
  servings: z.coerce.number().int().positive('Servings must be a positive number'),
  imageUrl: z.string().optional(),
  tags: z.string(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, 'Name is required'),
        amount: z.coerce.number().positive('Amount must be positive'),
        unit: z.string().min(1, 'Unit is required'),
      })
    )
    .min(1, 'At least one ingredient is required'),
  steps: z
    .array(z.string().min(1, 'Step cannot be empty'))
    .min(1, 'At least one step is required'),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

// ── Props ─────────────────────────────────────────────────────

interface RecipeFormProps {
  initialData: Recipe | null;
  onSubmit: (formData: Omit<Recipe, '_id' | 'authorId' | 'createdAt'>) => Promise<void>;
  isSubmitting: boolean;
}

// ── Component ─────────────────────────────────────────────────

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const navigate = useNavigate();

  const [topError, setTopError] = React.useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Breakfast',
      difficulty: 'Easy',
      time: '' as unknown as number,
      servings: '' as unknown as number,
      imageUrl: '',
      tags: '',
      ingredients: [{ name: '', amount: 1, unit: 'units' }],
      steps: [''],
    },
  });

  // ── Dropzone ────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setDropError(null);
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err?.code === 'file-too-large') setDropError('Image must be under 5MB');
      else if (err?.code === 'file-invalid-type') setDropError('Only image files (PNG, JPG, WebP) are accepted');
      else setDropError('Invalid file');
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      form.setValue('imageUrl', dataUrl, { shouldValidate: false });
    };
    reader.readAsDataURL(file);
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    disabled: isSubmitting,
    multiple: undefined,
    onDragEnter: undefined,
    onDragOver: undefined,
    onDragLeave: undefined,
  });

  // Pre-fill when editing
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Breakfast',
        difficulty: initialData.difficulty || 'Easy',
        time: initialData.time || ('' as unknown as number),
        servings: initialData.servings || ('' as unknown as number),
        imageUrl: initialData.imageUrl || '',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
        ingredients:
          initialData.ingredients && initialData.ingredients.length > 0
            ? initialData.ingredients
            : [{ name: '', amount: 1, unit: 'units' }],
        steps:
          initialData.steps && initialData.steps.length > 0
            ? initialData.steps
            : [''],
      });
      if (initialData.imageUrl) {
        setPreviewUrl(initialData.imageUrl);
      }
    }
  }, [initialData, form]);

  // ── Dynamic Field Arrays ──────────────────────────────────

  const ingredientsArray = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  // RHF's FieldArrayPath type excludes arrays of primitives (string[]),
  // so we type-assert the name. Runtime behavior works correctly.
  const stepsArray = useFieldArray({
    control: form.control,
    name: 'steps' as 'steps',
  } as any);

  // ── Tag chips preview ──────────────────────────────────────

  const watchedTags = form.watch('tags');
  const activeTags = watchedTags
    ? watchedTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  // ── Submit Handler ─────────────────────────────────────────

  const handleFormSubmit = async (values: RecipeFormValues) => {
    setTopError(null);
    try {
      const tagArray = values.tags
        ? values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      await onSubmit({
        title: values.title,
        description: values.description,
        category: values.category,
        difficulty: values.difficulty,
        time: values.time,
        servings: values.servings,
        imageUrl: values.imageUrl || null as unknown as string | undefined,
        tags: tagArray,
        ingredients: values.ingredients,
        steps: values.steps,
      });
    } catch (err: any) {
      setTopError(
        err?.response?.data?.message ||
          err?.message ||
          'An error occurred while publishing the recipe. Please try again.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-12"
      >
        {/* Top Error Banner */}
        {topError && (
          <div className="bg-red-50 border border-danger text-danger p-4 font-mono text-sm leading-relaxed mb-6">
            <p className="font-bold uppercase tracking-wider mb-1">
              Error Submitting Form
            </p>
            <p>{topError}</p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — Basic Information
           ══════════════════════════════════════════════════════ */}
        <div className="border border-border-custom bg-surface p-6 sm:p-8">
          <h2 className="font-serif text-xl font-bold border-b border-border-custom pb-3 mb-6 text-text-custom">
            Section 1 — Basic Information
          </h2>

          <div className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                    Recipe Title *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Grandma's Apple Crisp"
                      className="w-full bg-[#fcfcfc] border-border-custom h-auto py-3 px-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm rounded-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger font-mono mt-1.5" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                    Short Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Write a brief background about this recipe, its origin, or why you love it..."
                      className="w-full bg-[#fcfcfc] border-border-custom min-h-0 py-3 px-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm rounded-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger font-mono mt-1.5" />
                </FormItem>
              )}
            />

            {/* Category + Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              {/* Category Select */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
                      Category *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-[50px] bg-[#fcfcfc] border-border-custom rounded-none text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm data-[placeholder]:text-text-muted cursor-pointer">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                        <SelectItem value="Dessert">Dessert</SelectItem>
                        <SelectItem value="Snack">Snack</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-danger font-mono mt-1.5" />
                  </FormItem>
                )}
              />

              {/* Difficulty Select */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-[11px] uppercase tracking-widest font-mono text-text-custom mb-2 font-bold">
                      Difficulty *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-[50px] bg-[#fcfcfc] border-border-custom rounded-none text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm data-[placeholder]:text-text-muted cursor-pointer">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-danger font-mono mt-1.5" />
                  </FormItem>
                )}
              />
            </div>

            {/* Time + Servings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cook Time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                      Cooking Time (minutes) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Duration in minutes"
                        className="w-full bg-[#fcfcfc] border-border-custom h-auto py-3 px-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm rounded-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-danger font-mono mt-1.5" />
                  </FormItem>
                )}
              />

              {/* Servings */}
              <FormField
                control={form.control}
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                      Servings count *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Portion servings"
                        className="w-full bg-[#fcfcfc] border-border-custom h-auto py-3 px-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm rounded-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-danger font-mono mt-1.5" />
                  </FormItem>
                )}
              />
            </div>

            {/* Header Image Dropzone */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                Header Image (Optional)
              </label>

              {!(previewUrl || form.getValues('imageUrl')) ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed border-border-custom bg-[#fcfcfc] p-8 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-text-custom bg-neutral-50' : 'hover:border-text-custom'
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-text-muted font-sans">
                    Drag and drop an image here, or click to browse
                  </p>
                  <p className="text-xs text-text-muted font-mono mt-1">
                    PNG, JPG, or WebP — max 5MB
                  </p>
                </div>
              ) : (
                <div className="border border-border-custom p-2 bg-[#fcfcfc] relative">
                  <img
                    src={previewUrl || form.getValues('imageUrl') || ''}
                    alt="Recipe preview"
                    className="max-h-44 object-cover w-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      form.setValue('imageUrl', '', { shouldValidate: false });
                    }}
                    className="absolute top-2 right-2 bg-white border border-border-custom p-1 text-xs font-mono text-danger hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              )}
              {dropError && (
                <p className="text-xs text-danger font-mono mt-1.5">{dropError}</p>
              )}
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-xs uppercase tracking-wider font-mono text-text-muted mb-2 font-bold">
                    Tags (comma-separated list)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., baking, dessert, chocolate, sweet"
                      className="w-full bg-[#fcfcfc] border-border-custom h-auto py-3 px-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm rounded-none mb-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger font-mono mt-1.5" />
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
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — Ingredients
           ══════════════════════════════════════════════════════ */}
        <div className="border border-border-custom bg-surface p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-3 mb-6">
            <h2 className="font-serif text-xl font-bold text-text-custom">
              Section 2 — Ingredients
            </h2>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider mt-1 sm:mt-0">
              Define ingredient items &amp; ratios
            </span>
          </div>

          {/* Mobile Card Layout */}
          <div className="flex flex-col gap-4 mb-6 sm:hidden">
            {ingredientsArray.fields.map((field, idx) => (
              <div
                key={field.id}
                className="border border-border-custom bg-[#fcfcfc] p-4 space-y-4 relative"
              >
                <button
                  type="button"
                  onClick={() => ingredientsArray.remove(idx)}
                  disabled={ingredientsArray.fields.length <= 1}
                  className={`absolute top-2 right-2 text-danger p-2 font-mono text-xs font-bold leading-none ${
                    ingredientsArray.fields.length <= 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-red-50'
                  }`}
                  title="Remove Row"
                >
                  <X size={14} />
                </button>

                <FormField
                  control={form.control}
                  name={`ingredients.${idx}.name`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="block text-[10px] uppercase font-mono tracking-wider text-text-muted mb-1.5 font-bold">
                        Ingredient Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Flour or Sugar"
                          className="w-full bg-white border-border-custom h-auto py-2.5 px-3 text-sm font-sans focus:outline-none focus:border-text-custom focus:bg-[#fcfcfc] rounded-none"
                          {...f}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-danger font-mono mt-0.5" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`ingredients.${idx}.amount`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="block text-[10px] uppercase font-mono tracking-wider text-text-muted mb-1.5 font-bold">
                          Amount *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min="0.01"
                            className="w-full bg-white border-border-custom h-auto py-2.5 px-3 text-sm font-mono focus:outline-none focus:border-text-custom focus:bg-[#fcfcfc] rounded-none"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] text-danger font-mono mt-0.5" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredients.${idx}.unit`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="block text-[10px] uppercase font-mono tracking-wider text-text-muted mb-1.5 font-bold">
                          Unit *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="cups, g, units"
                            className="w-full bg-white border-border-custom h-auto py-2.5 px-3 text-sm font-sans focus:outline-none focus:border-text-custom focus:bg-[#fcfcfc] rounded-none"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] text-danger font-mono mt-0.5" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
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
                {ingredientsArray.fields.map((field, idx) => (
                  <tr
                    key={field.id}
                    className="border-b border-border-custom hover:bg-[#fafaf8]"
                  >
                    <td className="py-2.5 px-3">
                      <FormField
                        control={form.control}
                        name={`ingredients.${idx}.name`}
                        render={({ field: f }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                placeholder="Flour or Sugar"
                                className="w-full bg-transparent border-0 border-b border-transparent hover:border-border-custom focus:border-text-custom h-auto py-1.5 px-1 focus:outline-none focus:bg-white text-sm font-sans rounded-none"
                                {...f}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] text-danger font-mono mt-0.5" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <FormField
                        control={form.control}
                        name={`ingredients.${idx}.amount`}
                        render={({ field: f }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                min="0.01"
                                className="w-full bg-transparent border-0 border-b border-transparent hover:border-border-custom focus:border-text-custom h-auto py-1.5 px-1 focus:outline-none focus:bg-white text-sm rounded-none"
                                {...f}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] text-danger font-mono mt-0.5" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <FormField
                        control={form.control}
                        name={`ingredients.${idx}.unit`}
                        render={({ field: f }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                placeholder="e.g. cups, g, units"
                                className="w-full bg-transparent border-0 border-b border-transparent hover:border-border-custom focus:border-text-custom h-auto py-1.5 px-1 focus:outline-none focus:bg-white text-sm font-sans rounded-none"
                                {...f}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] text-danger font-mono mt-0.5" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => ingredientsArray.remove(idx)}
                        disabled={ingredientsArray.fields.length <= 1}
                        className={`text-danger p-1 font-bold ${
                          ingredientsArray.fields.length <= 1
                            ? 'opacity-30 cursor-not-allowed'
                            : 'cursor-pointer hover:bg-red-50'
                        }`}
                        title="Remove Row"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() =>
              ingredientsArray.append({
                name: '',
                amount: 1,
                unit: 'units',
              })
            }
            className="btn-secondary border border-border-custom text-text-custom hover:border-text-custom px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Ingredient
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — Preparation Steps
           ══════════════════════════════════════════════════════ */}
        <div className="border border-border-custom bg-surface p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-3 mb-6">
            <h2 className="font-serif text-xl font-bold text-text-custom">
              Section 3 — Preparation Steps
            </h2>
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider mt-1 sm:mt-0">
              Ordered list of instructions
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {stepsArray.fields.map((field, idx) => (
              <div key={field.id} className="flex items-start gap-4">
                <span className="font-mono text-sm font-bold text-accent py-3 select-none w-6 text-right">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <div className="flex-grow">
                  <FormField
                    control={form.control}
                    name={`steps.${idx}`}
                    render={({ field: f }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Textarea
                            rows={2}
                            placeholder={`Instruction details for Step ${idx + 1}...`}
                            className="w-full bg-[#fcfcfc] border-border-custom min-h-0 py-3 px-3 text-text-custom font-sans focus:outline-none focus:border-text-custom focus:bg-white transition-all text-sm rounded-none"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-danger font-mono mt-1" />
                      </FormItem>
                    )}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => stepsArray.remove(idx)}
                  disabled={stepsArray.fields.length <= 1}
                  className={`text-danger p-2 font-bold mt-2 ${
                    stepsArray.fields.length <= 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-red-50'
                  }`}
                  title="Remove Step"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => stepsArray.append('')}
            className="btn-secondary border border-border-custom text-text-custom hover:border-text-custom px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Step
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            Footer Buttons
           ══════════════════════════════════════════════════════ */}
        <div className="border border-border-custom bg-surface p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary w-full sm:w-auto border border-border-custom text-text-custom hover:bg-neutral-100 px-8 py-3.5 font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto border border-text-custom bg-text-custom hover:bg-white hover:text-text-custom text-white px-8 py-3.5 font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none translate-y-0 hover:translate-y-1 rounded-none h-auto"
          >
            {isSubmitting ? (
              'Publishing recipe...'
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
          </Button>
        </div>
      </form>
    </Form>
  );
};
