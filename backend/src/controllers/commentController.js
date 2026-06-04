const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');

const USER_FIELDS = 'name email bio avatarUrl createdAt';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const validateCommentPayload = (payload) => {
  const errors = [];
  const content = normalizeString(payload.content);
  const rating = Number(payload.rating);

  if (!content) {
    errors.push('Content is required');
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push('Rating must be an integer between 1 and 5');
  }

  return {
    data: { content, rating },
    errors,
  };
};

const findRecipeById = async (recipeId) => {
  if (!isValidObjectId(recipeId)) {
    return { error: { status: 400, message: 'Invalid recipe id' } };
  }

  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    return { error: { status: 404, message: 'Recipe not found' } };
  }

  return { recipe };
};

const getComments = async (req, res) => {
  try {
    const { error } = await findRecipeById(req.params.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const comments = await Comment.find({ recipeId: req.params.id })
      .populate('userId', USER_FIELDS)
      .sort({ createdAt: -1 });

    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching comments' });
  }
};

const createComment = async (req, res) => {
  try {
    const { error } = await findRecipeById(req.params.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { data, errors } = validateCommentPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid comment data', errors });
    }

    const comment = await Comment.create({
      recipeId: req.params.id,
      userId: req.user._id,
      content: data.content,
      rating: data.rating,
    });

    const populatedComment = await comment.populate('userId', USER_FIELDS);

    return res.status(201).json({ comment: populatedComment });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating comment' });
  }
};

const deleteComment = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid comment id' });
  }

  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the comment author can delete this comment' });
    }

    await comment.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting comment' });
  }
};

module.exports = { getComments, createComment, deleteComment };
