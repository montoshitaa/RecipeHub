import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import recipeRoutes from './routes/recipe.routes';
import commentRoutes from './routes/comment.routes';
import { csrfProtection } from './middlewares/csrf.middleware';
import { notFound, errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', csrfProtection);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api', commentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
