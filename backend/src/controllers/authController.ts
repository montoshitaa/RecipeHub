import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/User';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const generateAccessToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const isSecure = process.env.NODE_ENV === 'production';

function cookieDomain(req: Request): string | undefined {
  const host = req.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return undefined;
  }
  const parts = host.split('.');
  if (parts.length > 2) {
    return '.' + parts.slice(-2).join('.');
  }
  return undefined;
}

const setAuthCookies = (req: Request, res: Response, refreshToken: string, csrfToken: string) => {
  const domain = cookieDomain(req);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    path: '/api/auth',
    domain,
    maxAge: COOKIE_MAX_AGE,
  });

  res.cookie('csrfToken', csrfToken, {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    domain,
    maxAge: COOKIE_MAX_AGE,
  });
};

function clearAuthCookies(req: Request, res: Response) {
  const domain = cookieDomain(req);
  res.clearCookie('refreshToken', { httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/api/auth', domain });
  res.clearCookie('csrfToken', { httpOnly: false, secure: isSecure, sameSite: 'strict', path: '/', domain });
}

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

    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    const csrfToken = generateCsrfToken();

    await User.findByIdAndUpdate(userId, { $push: { refreshTokens: refreshToken } });

    setAuthCookies(req, res, refreshToken, csrfToken);

    res.status(201).json({
      user: buildUserResponse(user),
      accessToken,
      csrfToken,
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

    const userId = user!._id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    const csrfToken = generateCsrfToken();

    await User.findByIdAndUpdate(userId, { $push: { refreshTokens: refreshToken } });

    setAuthCookies(req, res, refreshToken, csrfToken);

    res.json({
      user: buildUserResponse(user!),
      accessToken,
      csrfToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};

const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ message: 'Refresh token not found' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; type: string };

    if (decoded.type !== 'refresh') {
      res.status(401).json({ message: 'Invalid token type' });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      clearAuthCookies(req, res);
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const userId = user._id.toString();

    if (!user.refreshTokens || user.refreshTokens.length === 0) {
      user.refreshTokens = [token];
      await user.save();
    } else if (!user.refreshTokens.includes(token)) {
      clearAuthCookies(req, res);
      res.status(401).json({ message: 'Session expired. Please log in again.' });
      return;
    } else {
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    }

    const accessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);
    const csrfToken = generateCsrfToken();

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setAuthCookies(req, res, newRefreshToken, csrfToken);

    res.json({ accessToken, csrfToken });
  } catch (error) {
    clearAuthCookies(req, res);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });
  }
  clearAuthCookies(req, res);
  res.json({ message: 'Logged out successfully' });
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

export { register, login, refresh, logout, getMe, updateProfile };
