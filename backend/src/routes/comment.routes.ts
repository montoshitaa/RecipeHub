import { Router } from 'express';
import {
  getComments,
  createComment,
  deleteComment,
} from '../controllers/commentController';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/recipes/:id/comments', getComments);
router.post('/recipes/:id/comments', protect, createComment);
router.delete('/comments/:id', protect, deleteComment);

export default router;
