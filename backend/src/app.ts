import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import recipeRoutes from './routes/recipe.routes';
import commentRoutes from './routes/comment.routes';
import { notFound, errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api', commentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
