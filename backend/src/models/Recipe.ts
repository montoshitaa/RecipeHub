import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface IRecipe {
  title: string;
  description: string;
  category: string;
  cookTimeMin: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: IIngredient[];
  steps: string[];
  tags: string[];
  authorId: mongoose.Types.ObjectId;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecipeDocument extends IRecipe, Document {}

const recipeSchema = new Schema<IRecipeDocument>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  cookTimeMin: {
    type: Number,
    required: true,
  },
  servings: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  ingredients: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      unit: { type: String, required: true },
    },
  ],
  steps: {
    type: [String],
    required: true,
  },
  tags: [String],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imageUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

recipeSchema.pre<IRecipeDocument>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Recipe: Model<IRecipeDocument> = mongoose.model<IRecipeDocument>('Recipe', recipeSchema);
export default Recipe;
