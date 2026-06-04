const { Router } = require('express');
const {
  getComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/recipes/:id/comments', getComments);
router.post('/recipes/:id/comments', protect, createComment);
router.delete('/comments/:id', protect, deleteComment);

module.exports = router;
