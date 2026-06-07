import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  refreshTokens: string[];
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;
