import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/User';

const createToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const buildUserResponse = (user: IUserDocument) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, bio } = req.body as { name?: string; email?: string; password?: string; bio?: string };

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409).json({ message: 'Email is already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      bio: bio?.trim() || undefined,
    });

    res.status(201).json({
      user: buildUserResponse(user),
      token: createToken(user._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    if (!passwordMatches) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.json({
      user: buildUserResponse(user!),
      token: createToken(user!._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

const getMe = (req: Request, res: Response): void => {
  res.json({ user: buildUserResponse(req.user!) });
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, bio } = req.body as { name?: string; bio?: string };

    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim() || '';

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: 'No fields to update' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.user!._id, updates, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export { register, login, getMe, updateProfile };
