import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Recipe, { IRecipeDocument } from '../models/Recipe';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const RECIPE_FIELDS = [
  'title',
  'description',
  'category',
  'cookTimeMin',
  'servings',
  'difficulty',
  'ingredients',
  'steps',
  'tags',
  'imageUrl',
] as const;

const AUTHOR_FIELDS = 'name email bio avatarUrl createdAt';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const normalizePositiveNumber = (value: unknown): number | null => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag: unknown) => normalizeString(tag))
    .filter(Boolean);
};

const normalizeSteps = (steps: unknown): string[] => {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps
    .map((step: unknown) => normalizeString(step))
    .filter(Boolean);
};

const normalizeIngredients = (ingredients: unknown): { name: string; amount: number | null; unit: string }[] => {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients
    .map((ingredient: unknown) => {
      const obj = ingredient as Record<string, unknown>;
      return {
        name: normalizeString(obj.name),
        amount: normalizePositiveNumber(obj.amount),
        unit: normalizeString(obj.unit),
      };
    })
    .filter((ingredient) => ingredient.name && ingredient.amount && ingredient.unit);
};

interface ValidationResult {
  data: Record<string, unknown>;
  errors: string[];
}

const validateRecipePayload = (payload: Record<string, unknown>, { partial = false }: { partial?: boolean } = {}): ValidationResult => {
  const data: Record<string, unknown> = {};
  const errors: string[] = [];

  const hasField = (field: string): boolean => Object.prototype.hasOwnProperty.call(payload, field);

  const setRequiredString = (field: string, label: string): void => {
    if (!hasField(field)) {
      if (!partial) errors.push(`${label} is required`);
      return;
    }

    const value = normalizeString(payload[field]);
    if (!value) {
      errors.push(`${label} is required`);
      return;
    }

    data[field] = value;
  };

  const setRequiredNumber = (field: string, label: string): void => {
    if (!hasField(field)) {
      if (!partial) errors.push(`${label} is required`);
      return;
    }

    const value = normalizePositiveNumber(payload[field]);
    if (!value) {
      errors.push(`${label} must be a positive number`);
      return;
    }

    data[field] = value;
  };

  setRequiredString('title', 'Title');
  setRequiredString('description', 'Description');
  setRequiredString('category', 'Category');
  setRequiredNumber('cookTimeMin', 'Cook time');
  setRequiredNumber('servings', 'Servings');

  if (hasField('difficulty')) {
    const difficulty = normalizeString(payload.difficulty);
    if (!(DIFFICULTIES as readonly string[]).includes(difficulty)) {
      errors.push('Difficulty must be Easy, Medium, or Hard');
    } else {
      data.difficulty = difficulty;
    }
  } else if (!partial) {
    errors.push('Difficulty is required');
  }

  if (hasField('ingredients')) {
    const ingredients = normalizeIngredients(payload.ingredients);
    if (ingredients.length === 0) {
      errors.push('At least one valid ingredient is required');
    } else {
      data.ingredients = ingredients;
    }
  } else if (!partial) {
    errors.push('Ingredients are required');
  }

  if (hasField('steps')) {
    const steps = normalizeSteps(payload.steps);
    if (steps.length === 0) {
      errors.push('At least one preparation step is required');
    } else {
      data.steps = steps;
    }
  } else if (!partial) {
    errors.push('Steps are required');
  }

  if (hasField('tags')) {
    data.tags = normalizeTags(payload.tags);
  }

  if (hasField('imageUrl')) {
    data.imageUrl = normalizeString(payload.imageUrl);
  }

  if (partial && Object.keys(data).length === 0 && errors.length === 0) {
    errors.push('At least one valid recipe field is required');
  }

  return { data, errors };
};

interface RecipeFilters {
  category?: string;
  difficulty?: string;
  tags?: { $all: string[] };
  $or?: Array<Record<string, unknown>>;
}

const buildRecipeFilters = (query: Record<string, unknown>): RecipeFilters => {
  const filters: RecipeFilters = {};

  const category = normalizeString(query.category);
  const difficulty = normalizeString(query.difficulty);
  const search = normalizeString(query.search);
  const tags = normalizeString(query.tags)
    .split(',')
    .map((tag: string) => tag.trim())
    .filter(Boolean);

  if (category) {
    filters.category = category;
  }

  if (difficulty) {
    filters.difficulty = difficulty;
  }

  if (tags.length > 0) {
    filters.tags = { $all: tags };
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), 'i');
    filters.$or = [{ title: searchRegex }, { tags: searchRegex }];
  }

  return filters;
};

const getRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipes = await Recipe.find(buildRecipeFilters(req.query as Record<string, unknown>))
      .populate('authorId', AUTHOR_FIELDS)
      .sort({ createdAt: -1 });

    res.json({ recipes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes' });
  }
};

const createRecipe = async (req: Request, res: Response): Promise<void> => {
  const { data, errors } = validateRecipePayload(req.body as Record<string, unknown>);

  if (errors.length > 0) {
    res.status(400).json({ message: 'Invalid recipe data', errors });
    return;
  }

  try {
    const recipe = await Recipe.create({
      ...data,
      authorId: req.user!._id,
    });

    const populatedRecipe = await recipe.populate('authorId', AUTHOR_FIELDS);

    res.status(201).json({ recipe: populatedRecipe });
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe' });
  }
};

const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid recipe id' });
    return;
  }

  try {
    const recipe = await Recipe.findById(id).populate('authorId', AUTHOR_FIELDS);

    if (!recipe) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    res.json({ recipe });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe' });
  }
};

const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid recipe id' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const updatePayload = RECIPE_FIELDS.reduce<Record<string, unknown>>((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }
    return payload;
  }, {});

  const { data, errors } = validateRecipePayload(updatePayload, { partial: true });

  if (errors.length > 0) {
    res.status(400).json({ message: 'Invalid recipe data', errors });
    return;
  }

  try {
    const recipe = await Recipe.findById(id) as IRecipeDocument | null;

    if (!recipe) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    if (recipe.authorId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Only the recipe author can update this recipe' });
      return;
    }

    Object.assign(recipe, data);
    await recipe.save();
    await recipe.populate('authorId', AUTHOR_FIELDS);

    res.json({ recipe });
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe' });
  }
};

const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid recipe id' });
    return;
  }

  try {
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    if (recipe.authorId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Only the recipe author can delete this recipe' });
      return;
    }

    await recipe.deleteOne();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe' });
  }
};

export { getRecipes, createRecipe, getRecipeById, updateRecipe, deleteRecipe };
