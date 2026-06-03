const { Router } = require('express');
const {
  getComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, createComment);
router.delete('/comments/:id', protect, deleteComment);

module.exports = router;
