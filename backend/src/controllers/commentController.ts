import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment, { ICommentDocument } from '../models/Comment';
import Recipe from '../models/Recipe';

const USER_FIELDS = 'name email bio avatarUrl createdAt';

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

interface CommentValidationResult {
  data: { content: string; rating: number };
  errors: string[];
}

const validateCommentPayload = (payload: Record<string, unknown>): CommentValidationResult => {
  const errors: string[] = [];
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

interface FindRecipeResult {
  recipe?: typeof Recipe.prototype;
  error?: { status: number; message: string };
}

const findRecipeById = async (recipeId: string): Promise<FindRecipeResult> => {
  if (!isValidObjectId(recipeId)) {
    return { error: { status: 400, message: 'Invalid recipe id' } };
  }

  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    return { error: { status: 404, message: 'Recipe not found' } };
  }

  return { recipe };
};

const getComments = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const { error } = await findRecipeById(id);

    if (error) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    const comments = await Comment.find({ recipeId: id })
      .populate('userId', USER_FIELDS)
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

const createComment = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  try {
    const { error } = await findRecipeById(id);

    if (error) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    const { data, errors } = validateCommentPayload(req.body as Record<string, unknown>);

    if (errors.length > 0) {
      res.status(400).json({ message: 'Invalid comment data', errors });
      return;
    }

    const comment = await Comment.create({
      recipeId: id,
      userId: req.user!._id,
      content: data.content,
      rating: data.rating,
    });

    const populatedComment = await comment.populate('userId', USER_FIELDS);

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment' });
  }
};

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid comment id' });
    return;
  }

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Only the comment author can delete this comment' });
      return;
    }

    await comment.deleteOne();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

export { getComments, createComment, deleteComment };
