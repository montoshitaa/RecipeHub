import { Router } from 'express';
import {
  getRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipeController';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getRecipes);
router.post('/', protect, createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

export default router;
