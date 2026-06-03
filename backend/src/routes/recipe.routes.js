const { Router } = require('express');
const {
  getRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipeController');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', getRecipes);
router.post('/', protect, createRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;
