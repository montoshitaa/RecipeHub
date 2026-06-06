import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
  recipeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  rating: number;
  createdAt: Date;
}

export interface ICommentDocument extends IComment, Document {}

const commentSchema = new Schema<ICommentDocument>({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment: Model<ICommentDocument> = mongoose.model<ICommentDocument>('Comment', commentSchema);
export default Comment;
