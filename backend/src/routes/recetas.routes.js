const { Router } = require('express');
const {
  getRecetas,
  createReceta,
  getRecetaById,
  updateReceta,
  deleteReceta,
} = require('../controllers/recetasController');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', getRecetas);
router.post('/', protect, createReceta);
router.get('/:id', getRecetaById);
router.put('/:id', protect, updateReceta);
router.delete('/:id', protect, deleteReceta);

module.exports = router;
