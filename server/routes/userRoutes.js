const express = require('express');
const router = express.Router();
const {
  toggleWishlist,
  getWishlist,
  getAllUsers,
  deleteUser,
  getAdminStats,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// User wishlist routes (Protected)
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

// Admin-only management routes
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.get('/admin/stats', protect, admin, getAdminStats);

module.exports = router;
