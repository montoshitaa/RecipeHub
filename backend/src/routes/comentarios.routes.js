const { Router } = require('express');
const {
  getComentarios,
  createComentario,
  deleteComentario,
} = require('../controllers/comentariosController');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/:id/comentarios', getComentarios);
router.post('/:id/comentarios', protect, createComentario);
router.delete('/comentarios/:id', protect, deleteComentario);

module.exports = router;
