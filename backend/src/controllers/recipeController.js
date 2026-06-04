const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
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
];

const AUTHOR_FIELDS = 'name email bio avatarUrl createdAt';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizePositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => normalizeString(tag))
    .filter(Boolean);
};

const normalizeSteps = (steps) => {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps
    .map((step) => normalizeString(step))
    .filter(Boolean);
};

const normalizeIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients
    .map((ingredient) => ({
      name: normalizeString(ingredient.name),
      amount: normalizePositiveNumber(ingredient.amount),
      unit: normalizeString(ingredient.unit),
    }))
    .filter((ingredient) => ingredient.name && ingredient.amount && ingredient.unit);
};

const validateRecipePayload = (payload, { partial = false } = {}) => {
  const data = {};
  const errors = [];

  const hasField = (field) => Object.prototype.hasOwnProperty.call(payload, field);

  const setRequiredString = (field, label) => {
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

  const setRequiredNumber = (field, label) => {
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
    if (!DIFFICULTIES.includes(difficulty)) {
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

const buildRecipeFilters = (query) => {
  const filters = {};

  const category = normalizeString(query.category);
  const difficulty = normalizeString(query.difficulty);
  const search = normalizeString(query.search);
  const tags = normalizeString(query.tags)
    .split(',')
    .map((tag) => tag.trim())
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

const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find(buildRecipeFilters(req.query))
      .populate('authorId', AUTHOR_FIELDS)
      .sort({ createdAt: -1 });

    return res.json({ recipes });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching recipes' });
  }
};

const createRecipe = async (req, res) => {
  const { data, errors } = validateRecipePayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid recipe data', errors });
  }

  try {
    const recipe = await Recipe.create({
      ...data,
      authorId: req.user._id,
    });

    const populatedRecipe = await recipe.populate('authorId', AUTHOR_FIELDS);

    return res.status(201).json({ recipe: populatedRecipe });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating recipe' });
  }
};

const getRecipeById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe id' });
  }

  try {
    const recipe = await Recipe.findById(req.params.id).populate('authorId', AUTHOR_FIELDS);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    return res.json({ recipe });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching recipe' });
  }
};

const updateRecipe = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe id' });
  }

  const updatePayload = RECIPE_FIELDS.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      payload[field] = req.body[field];
    }
    return payload;
  }, {});

  const { data, errors } = validateRecipePayload(updatePayload, { partial: true });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid recipe data', errors });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipe author can update this recipe' });
    }

    Object.assign(recipe, data);
    await recipe.save();
    await recipe.populate('authorId', AUTHOR_FIELDS);

    return res.json({ recipe });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating recipe' });
  }
};

const deleteRecipe = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid recipe id' });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipe author can delete this recipe' });
    }

    await recipe.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting recipe' });
  }
};

module.exports = { getRecipes, createRecipe, getRecipeById, updateRecipe, deleteRecipe };
